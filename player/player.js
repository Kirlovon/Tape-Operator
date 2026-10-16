/// <reference path="./utils.js" />

const containerElement = document.getElementById('container');
const playerElement = document.getElementById('player');
const titleElement = document.getElementById('title');
const watchedMoviesToggleElement = document.getElementById('watched-movies-toggle');
const watchedMoviesCountElement = document.getElementById('watched-movies-count');
const watchedMoviesPanelElement = document.getElementById('watched-movies-panel');
const watchedMoviesSearchElement = document.getElementById('watched-movies-search');
const watchedMoviesListElement = document.getElementById('watched-movies-list');
const versionElement = document.getElementById('version');
const contentElement = document.getElementById('content');
const sourcesElement = document.getElementById('sources');
const backgroundElement = document.getElementById('background');

let currentMovieKey = getSearchParam('movie') ?? '';

/**
 * @typedef {object} MovieData
 * @property {string} [kinopoisk]
 * @property {string} [imdb]
 * @property {string} [tmdb]
 * @property {string} title
 */

// Set timeout for initialization (5 seconds)
const initializationTimeoutTimer = setTimeout(() => {
	showScriptErrorMessage();
	logger.error('Initialization timeout');
}, 5000);

/**
 * Initialize player
 * @param {object} data The movie data
 * @param {string} [scriptVersion] The version of the script
 */
async function init(data, scriptVersion) {
	try {
		// Stop initialization timeout timer
		clearTimeout(initializationTimeoutTimer);

		// Remove old messages
		containerElement.querySelectorAll('.message').forEach((element) => element.remove());

		// Validate and clean movie data
		const movieData = parseMovieData(data);

		logger.info('Initialization started', movieData);

		// Cache movie data and set search param to allow page refresh and bookmarking
		const key = cacheMovieData(movieData);
		currentMovieKey = key;
		setSearchParam('movie', key);

		// Get available players sources
		let sources = [];
		try {
			sources = await fetchSources(movieData);
		} catch (error) {
			showPlayerText(':(');
			showServerUnavailableMessage();
			logger.error('Error fetching data from server', error);
			return;
		}

		// Check if server returned any sources
		if (sources.length === 0) {
			showPlayerText('Movie not found :(');
			return;
		}

		// Update list of sources and select one
		setSources(sources);

		// Update title and send analytics
		if (movieData?.title) {
			setTitle(movieData.title);
			sendAnalytics(movieData);
		}

		// Update watched movies panel with new movie
		updateWatchedMoviesPanel();

		// Check player version if provided
		if (typeof scriptVersion === 'string') checkVersion(scriptVersion);

		// Show background
		backgroundElement.classList.add('visible');
	} catch (error) {
		// Remove loading spinner
		showPlayerText(':(');

		logger.error('Error during initialization', error);
		showInitializationErrorMessage();
	}
}

/**
 * Fetch players from API
 * @param {MovieData} movieData
 */
async function fetchSources(movieData) {
    const apiURL = new URL(KINOBOX_API);
    Object.entries(movieData).forEach(([key, value]) => apiURL.searchParams.set(key, value));
    try {
        const request = await fetch(apiURL, { method: 'GET' });
        if (!request.ok || request.status !== 200) throw new Error('Request failed: ' + request.status);
        const response = await request.json();
        if (typeof response !== 'object' || !Array.isArray(response?.data) || response === null) throw new Error('Invalid response');
        const playersData = response.data.filter((player) => player?.iframeUrl && player?.type);
        const turboIndex = playersData.findIndex((player) => player.type.toLowerCase() === 'turbo');
        if (turboIndex !== -1) playersData.push(playersData.splice(turboIndex, 1)[0]);
        return playersData;
    } catch (error) {
        logger.error('Error fetching sources from API', error);
        return [];
    }
}

/**
 * Update list of available sources
 * @param {object[]} sourcesData
 */
function setSources(sourcesData) {
	// Reset previous source buttons before rendering new list
	sourcesElement.innerHTML = '';

	// Get preferred source from local storage
	const preferredSource = localStorage.getItem('preferred-source');
	let preferredSourceIndex = sourcesData.findIndex((source) => source.type === preferredSource);

	// If source is not found, select the first one
	if (preferredSourceIndex === -1) preferredSourceIndex = 0;

	sourcesData.forEach((source, index) => {
		const sourceElement = document.createElement('button');
		sourceElement.className = 'source';
		sourceElement.innerText = source?.type;

		if (index === preferredSourceIndex) {
			sourceElement.classList.add('selected');
			selectSource(source);
		}

		// Smooth reveal animation
		sourceElement.style.animationDelay = `${(5 + (sourcesData.length - index)) * 0.05}s`;

		// Select source on click
		sourceElement.addEventListener('click', () => {
			if (sourceElement.classList.contains('selected')) return;

			// Switch selected source
			sourcesElement.querySelectorAll('.source').forEach((element) => element.classList.remove('selected'));
			sourceElement.classList.add('selected');

			// Save selected source as preferred
			localStorage.setItem('preferred-source', source.type);

			selectSource(source);
		});

		sourcesElement.appendChild(sourceElement);
	});
}

/**
 * Select source to display in the player
 * @param {object} sourceData
 */
function selectSource(sourceData) {
	const iframe = document.createElement('iframe');
	iframe.src = sourceData?.iframeUrl;
	iframe.allowFullscreen = true;

	contentElement.innerHTML = '';
	contentElement.appendChild(iframe);
}

/**
 * Update the title of the player
 * @param {string} title
 */
function setTitle(title) {
	document.title = `${title} | Tape Operator`;
	if (titleElement) {
		titleElement.innerHTML = title?.replace(/\((.*)/, (match, content) => `<span>(${content}</span>`);
	}
}

/**
 * Check if the script version is outdated
 * @param {string} scriptVersion
 */
function checkVersion(scriptVersion) {
	if (REQUIRED_VERSION !== scriptVersion) {
		try {
			const numericRequiredVersion = parseVersion(REQUIRED_VERSION);
			const numericScriptVersion = parseVersion(scriptVersion);

			if (numericScriptVersion < numericRequiredVersion) {
				showScriptOutdatedMessage(scriptVersion);
				logger.warn(`Requires script version is ${REQUIRED_VERSION} but your version is ${scriptVersion}`);
			}
		} catch (error) {
			logger.error('Error while checking script version', error);
		}
	}
}

/**
 * Cache movie data in local storage
 * @param {MovieData} movieData
 * @returns {string} The key used to cache the data
 */
function cacheMovieData(movieData) {
	const serialized = JSON.stringify(movieData);
	const key = hashCode(serialized);

	localStorage.setItem(key, serialized);
	return key;
}

/**
 * Validate and clean the movie data
 * @param {string | object} data
 * @returns {MovieData}
 * @throws Will throw an error if the data is invalid
 */
function parseMovieData(data) {
	if (typeof data !== 'object' || data === null) {
		throw new Error(`Invalid movie data type: "${typeof data}"`);
	}

	// Remove unwanted keys from movie data
	const allowedKeys = ['imdb', 'tmdb', 'kinopoisk', 'title'];
	Object.keys(data).forEach((key) => {
		if (!allowedKeys.includes(key)) delete data[key];
	});

	return data;
}

/**
 * Show initialization error message
 */
function showInitializationErrorMessage() {
	const template = document.getElementById('initialization-error-message').content.cloneNode(true);
	containerElement.appendChild(template);
}

/**
 * Show script error message
 */
function showScriptErrorMessage() {
	const template = document.getElementById('script-error-message').content.cloneNode(true);
	containerElement.appendChild(template);
}

/**
 * Show script outdated message
 * @param {string} scriptVersion The current script version
 */
function showScriptOutdatedMessage(scriptVersion) {
	const template = document.getElementById('script-outdated-message').content.cloneNode(true);
	template.querySelector('.script-version').innerText = scriptVersion;
	containerElement.appendChild(template);
}

/**
 * Show server unavailable message. Used when the API is down.
 */
function showServerUnavailableMessage() {
	const template = document.getElementById('server-unavailable-message').content.cloneNode(true);
	containerElement.appendChild(template);
}

/**
 * Show message inside the player
 * @param {string} messageText The message to display
 */
function showPlayerText(messageText) {
	const playerTextElement = document.createElement('span');
	playerTextElement.innerHTML = messageText;

	contentElement.innerHTML = '';
	contentElement.appendChild(playerTextElement);
}

/**
 * Send analytics data. Sends only id type, movie title & preferred video source.
 * @param {MovieData} movieData
 */
function sendAnalytics(movieData) {
	if (typeof plausible === 'function') {
		try {
			const title = movieData.title?.trim()?.toLowerCase();
			if (!title) return;

			const idType = Object.keys(movieData).find((key) => ['imdb', 'kinopoisk', 'tmdb'].includes(key));
			const preferredSource = localStorage.getItem('preferred-source')?.toLowerCase();

			let props = {};
			if (idType) props['id-type'] = idType;
			if (preferredSource) props['preferred-source'] = preferredSource;

			plausible('pageview', { u: title, props: props });
		} catch (error) {
			logger.error('Analytics error', error);
		}
	}
}

/**
 * Get watched movies from local storage
 * @returns {{ key: string, title: string }[]}
 */
function getWatchedMovies() {
	const movies = [];

	for (let index = 0; index < localStorage.length; index += 1) {
		const key = localStorage.key(index);
		if (!key) continue;

		let parsedData = null;
		try {
			const rawValue = localStorage.getItem(key);
			if (!rawValue) continue;
			parsedData = JSON.parse(rawValue);
		} catch {
			continue;
		}

		if (typeof parsedData !== 'object' || parsedData === null) continue;
		if (typeof parsedData.title !== 'string') continue;

		/** @type {string} */
		const normalizedTitle = parsedData.title.trim();
		if (!normalizedTitle) continue;

		movies.push({ key, title: normalizedTitle });
	}

	return movies.sort((left, right) => left.title.localeCompare(right.title, 'ru'));
}

/**
 * Render movie links for watched movies
 * @param {{ key: string, title: string }[]} movies
 * @param {string} selectedMovieKey
 */
function renderMovieLinks(movies, selectedMovieKey) {
	watchedMoviesListElement.innerHTML = '';

	if (movies.length == 0) {
		const emptyState = document.createElement('span');
		emptyState.className = 'movie-list-empty';
		emptyState.textContent = 'Nothing found';
		watchedMoviesListElement.appendChild(emptyState);
		return;
	}

	movies.forEach((movie) => {
		const link = document.createElement('a');
		link.href = `?movie=${movie.key}`;
		link.className = 'movie-link';
		link.textContent = movie.title;

		if (`${movie.key}` === `${selectedMovieKey}`) link.classList.add('selected');
		watchedMoviesListElement.appendChild(link);
	});
}

/**
 * Toggle watched movies panel
 * @param {boolean} isOpen
 */
function toggleWatchedMoviesPanel(isOpen) {
	watchedMoviesToggleElement.classList.toggle('open', isOpen);
	watchedMoviesPanelElement.classList.toggle('hidden', !isOpen);
	watchedMoviesToggleElement.setAttribute('aria-expanded', String(isOpen));
	if (isOpen) watchedMoviesSearchElement.focus();
}

/**
 * Update list of watched movies in the panel, update count and button state
 */
function updateWatchedMoviesPanel() {
	if (!watchedMoviesToggleElement || !watchedMoviesCountElement || !watchedMoviesListElement) {
		return;
	}

	// Load watched movies from local storage
	const watchedMovies = getWatchedMovies();

	// Update button text with count
	const movieCount = watchedMovies.length;
	const countText = `${movieCount} movies watched`;
	watchedMoviesCountElement.textContent = countText;

	// Disable button when there are no watched movies yet
	if (watchedMovies.length <= 1) {
		watchedMoviesToggleElement.setAttribute('aria-expanded', 'false');
		watchedMoviesToggleElement.disabled = true;
		return;
	}

	// Enable button
	watchedMoviesToggleElement.disabled = false;

	// Render list of movies
	const searchQuery = watchedMoviesSearchElement?.value?.trim()?.toLowerCase() || '';
	const filteredMovies = searchQuery ? watchedMovies.filter((movie) => movie.title.toLowerCase().includes(searchQuery)) : watchedMovies;
	renderMovieLinks(filteredMovies, currentMovieKey);
}

/**
 * Setup watched movies panel event listeners
 */
function setupWatchedMoviesPanel() {
	if (!watchedMoviesToggleElement || !watchedMoviesCountElement || !watchedMoviesPanelElement || !watchedMoviesSearchElement || !watchedMoviesListElement) {
		logger.warn('Watched movies panel setup skipped: required DOM elements were not found');
		return;
	}

	// Initial update
	updateWatchedMoviesPanel();

	// Toggle panel on button click
	watchedMoviesToggleElement.addEventListener('click', () => {
		const isOpen = watchedMoviesPanelElement.classList.contains('hidden');
		toggleWatchedMoviesPanel(isOpen);
	});

	// Filter available movies by the search query
	watchedMoviesSearchElement.addEventListener('input', () => {
		updateWatchedMoviesPanel();
	});

	// Close panel when clicking outside
	document.addEventListener('click', (event) => {
		const isClickInside = watchedMoviesToggleElement.contains(event.target) || watchedMoviesPanelElement.contains(event.target);
		if (!isClickInside) toggleWatchedMoviesPanel(false);
	});

	// Close panel when pressing Escape key
	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') toggleWatchedMoviesPanel(false);
	});
}

/**
 * Setup the script by setting up timeout and getting watched movie data from URL
 */
function setup() {
	try {
		logger.info('Setup started');

		// Setup watched movies panel with movies from local storage
		setupWatchedMoviesPanel();

		// Get cached movie key from URL
		const movieKey = getSearchParam('movie');
		if (!movieKey) return;
		currentMovieKey = movieKey;

		// Get movie data from cache
		const cachedData = localStorage.getItem(movieKey);
		if (!cachedData) {
			logger.error(`Cached data with key "${movieKey}" not found`);
			return;
		}

		// Parse movie data object
		const movieData = JSON.parse(cachedData);
		if (typeof movieData !== 'object') return;

		logger.info('Cached data was found:', movieData);
		init(movieData);
	} catch (error) {
		logger.error('Setup error', error);
	}
}

// Display player version
versionElement.innerHTML = `v${REQUIRED_VERSION}`;

// Reveal body
document.body.classList.add('visible');

// Make init function available for external use
globalThis.init = init;

// Setup script
document.addEventListener('DOMContentLoaded', setup);
