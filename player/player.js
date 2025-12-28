// True if globalThis.init function was successfully called
let initialized = false;

const containerElement = document.getElementById('container');
const playerElement = document.getElementById('player');
const titleElement = document.getElementById('title');
const versionElement = document.getElementById('version');
const contentElement = document.getElementById('content');
const sourcesElement = document.getElementById('sources');
const backgroundElement = document.getElementById('background');

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
	if (initialized) return;

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
		setSearchParam('movie', key);

		// Get available players sources
		let sources = [];
		try {
			sources = await fetchSources(movieData)
		} catch (error) {
			showPlayerText(':(')
			showServerUnavailableMessage();
			logger.error('Error fetching data from server', error);
			return;
		}

		// Check if server returned any sources
		if (sources.length === 0) {
			showPlayerText('Фильм не найден :(');
			return;
		}

		// Update list of sources and select one
		setSources(sources);

		// Update title and send analytics
		if (movieData?.title) {
			setTitle(movieData.title);
			sendAnalytics(movieData);
		}

		// Check player version if provided
		if (typeof scriptVersion === 'string') checkVersion(scriptVersion);

		// Show background
		backgroundElement.classList.add('visible');

		// Mark as initialized
		initialized = true;

	} catch (error) {

		// Remove loading spinner
		showPlayerText(':(')

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

	// Add movie and sources data to the request
	Object.entries(movieData).forEach(([key, value]) => apiURL.searchParams.set(key, value));

	// Send request to the API
	const request = await fetch(apiURL, { method: 'GET' });
	if (!request.ok || request?.status !== 200) throw new Error(`Request failed with status ${request.status}`);

	let response = await request.json();
	if (typeof response !== 'object' || !Array.isArray(response?.data) || response === null) {
		throw new Error(`Invalid response type: "${typeof response}"`);
	}

	// Remove players without full data
	let playersData = response.data;
	playersData = playersData.filter((player) => player?.iframeUrl && player?.type);

	// Put player Turbo at the end of the list (as it usually doesn't work)
	const turboIndex = playersData.findIndex((player) => player.type.toLowerCase() === 'turbo');
	if (turboIndex !== -1) playersData.push(playersData.splice(turboIndex, 1)[0]);

	return playersData;
}

/**
 * Update list of available sources
 * @param {object[]} sourcesData
 */
function setSources(sourcesData) {

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
	titleElement.innerHTML = title?.replace(/\((.*)/, (match, content) => `<span>(${content}</span>`);
}

/**
 * Check if the script version is outdated
 * @param {string} scriptVersion
 */
function checkVersion(scriptVersion) {
	if (REQUIRED_VERSION !== scriptVersion) {
		try {
			const numericRequiredVersion = parseVersion(REQUIRED_VERSION)
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
 * Setup the script by setting up timeout and getting cached movie data from URL
 */
function setup() {
	try {
		logger.info('Setup started');

		// First, check for direct data parameter (used by LAMPA plugin)
		const directData = getSearchParam('data');
		if (directData) {
			try {
				const movieData = JSON.parse(directData);
				if (typeof movieData === 'object' && movieData !== null) {
					logger.info('Direct data from URL:', movieData);
					init(movieData);
					return;
				}
			} catch (parseError) {
				logger.error('Failed to parse direct data:', parseError);
			}
		}

		// Get cached movie key from URL
		const movieKey = getSearchParam('movie');
		if (!movieKey) return;

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