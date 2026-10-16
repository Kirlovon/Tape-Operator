// ==UserScript==
// @name            Tape Operator (selfhost)
// @namespace       tape-operator-selfhost
// @author          Kirlovon
// @description     Watch movies on IMDB, TMDB, Kinopoisk and Letterboxd!
// @version         3.3.4-selfhost.6
// @icon            https://github.com/Kirlovon/Tape-Operator/raw/main/assets/favicon.png
// @updateURL       https://github.com/sanek1mz/Tape-Operator/raw/selfhost/userscript/tape-operator.user.js
// @downloadURL     https://github.com/sanek1mz/Tape-Operator/raw/selfhost/userscript/tape-operator.user.js
// @run-at          document-idle
// @grant           GM.info
// @grant           GM.setValue
// @grant           GM.getValue
// @grant           GM.openInTab
// @grant           GM.deleteValue
// @grant           GM_getResourceURL
// @match           *://www.kinopoisk.ru/*
// @match           *://hd.kinopoisk.ru/*
// @match           *://*.imdb.com/title/*
// @match           *://www.themoviedb.org/movie/*
// @match           *://www.themoviedb.org/tv/*
// @match           *://letterboxd.com/film/*
// @match           *://sanek2mz.duckdns.org/*
// ==/UserScript==

(function () {

	// Current version of the script
	const VERSION = GM.info?.script?.version;

	// Banner image (Keep as base64 for better compatibility with browsers)
	const BANNER_IMAGE = 'data:image/webp;base64,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';

	const ALT_BANNER_IMAGE = 'data:image/webp;base64,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';

	// URL to the player
	const PLAYER_URL = 'https://sanek2mz.duckdns.org:8443/player/';

	// ID of the banner, attached to the page
	const BANNER_ID = 'tape-operator-banner';
	const ALT_BANNER_ID = 'tape-operator-alt-banner';

	// URL Matchers
	const KINOPOISK_MATCHER = /kinopoisk\.ru\/(film|series)\/.*/;
	const IMDB_MATCHER = /imdb\.com\/title\/tt\.*/;
	const TMDB_MATCHER = /themoviedb\.org\/(movie|tv)\/\.*/;
	const LETTERBOXD_MATCHER = /letterboxd\.com\/film\/\.*/;
	const MATCHERS = [KINOPOISK_MATCHER, IMDB_MATCHER, TMDB_MATCHER, LETTERBOXD_MATCHER];

	// Logging utility
	const logger = {
		info: (...args) => console.info('[Tape Operator Script]', ...args),
		warn: (...args) => console.warn('[Tape Operator Script]', ...args),
		error: (...args) => console.error('[Tape Operator Script]', ...args),
	}

	let previousUrl = '/';

	/**
	 * Initialize banner on the page
	 */
	async function initBanner() {
		const observer = new MutationObserver(() => updateBanner());
		observer.observe(document, { subtree: true, childList: true });
		updateBanner();
	}

	/**
	 * Update banner based on the current movie data on page
	 */
	function updateBanner() {
		const url = getCurrentURL();

		// Skip to prevent unnecessary updates
		if (url === previousUrl) return;

		// Check if URL matches
		const urlMatches = MATCHERS.some((matcher) => url.match(matcher));
		if (!urlMatches) return removeBanner();

		// Check if title is present
		const extractedTitle = extractTitle();
		if (!extractedTitle) return removeBanner();

		// Movie found, now we can stop searching
		previousUrl = url;
		attachBanner();
	}

	/**
	 * Extract movie data from the page
	 */
	function extractMovieData() {
		const url = getCurrentURL();

		// Movie title
		const title = extractTitle();
		if (!title) return null;

		// Kinopoisk ID
		if (url.match(KINOPOISK_MATCHER)) {

			// If its a Kinopoisk HD page
			if (url.includes('hd.kinopoisk.ru')) {
				try {
					const element = document.getElementById('__NEXT_DATA__');
					const jsonData = JSON.parse(element.innerText);
					const apolloState = Object.values(jsonData?.props?.pageProps?.apolloState?.data || {});

					const id = apolloState.find((item) => item?.__typename === 'TvSeries' || item?.__typename === 'Film')?.id;
					if (!id) throw new Error('No ID was found in the page data');

					return { kinopoisk: id, title };
				} catch (error) {
					console.error('Failed to extract ID from Kinopoisk HD page:', error);
					return null;
				}
			}

			const id = url.split('/').at(4);
			return { kinopoisk: id, title };
		}

		// IMDB ID
		if (url.match(IMDB_MATCHER)) {
			const seriesBlock = document.querySelector('a[data-testid="hero-title-block__series-link"]');

			// In case of opened episode of the series, get ID from "Go back to series" link
			if (seriesBlock) {
				const id = seriesBlock.href.split('/').at(4);
				return { imdb: id, title };
			}

			const id = url.split('/').at(4);
			return { imdb: id, title };
		}

		// TMDB ID
		if (url.match(TMDB_MATCHER)) {
			const id = url.split('/').at(4).split('-').at(0);
			return { tmdb: id, title };
		}

		// IMDB ID from Letterboxd
		if (url.match(LETTERBOXD_MATCHER)) {
			const elements = document.querySelectorAll('a');
			const elementsArray = Array.from(elements);

			// Find IMDB ID
			const imdbLink = elementsArray.find((link) => link?.href?.match(IMDB_MATCHER));
			if (imdbLink) {
				const imdbId = imdbLink.href.split('/').at(4);
				if (imdbId) return { imdb: imdbId, title };
			}

			// Find TMDB ID
			const tmdbLink = elementsArray.find((link) => link?.href?.match(TMDB_MATCHER));
			if (tmdbLink) {
				const tmdbId = tmdbLink.href.split('/').at(4)?.split('-')?.at(0);
				if (tmdbId) return { tmdbId: tmdbId, title };
			}

			return null;
		}

		return null;
	}

	/**
	 * Get current URL.
	 * @returns {string} Current url without query parameters and hashes.
	 */
	function getCurrentURL() {
		return location.origin + location.pathname;
	}

	/**
	 * Extract movie title from the page
	 * @returns {string} The extracted title
	 */
	function extractTitle() {
		try {
			const titleElement = document.querySelector('meta[property="og:title"]') || document.querySelector('meta[name="twitter:title"]');
			if (!titleElement) return null;

			const title = titleElement?.content?.trim();
			if (!title) return null;

			// Skip default Kinopoisk title
			if (title.startsWith('Кинопоиск.')) return null;

			// Remove addition attachments on Kinopoisk HD
			if (title.includes('— смотреть онлайн в хорошем качестве — Кинопоиск')) {
				return title.replace('— смотреть онлайн в хорошем качестве — Кинопоиск', '').trim();
			}

			// Remove title attachment from IMDB
			if (title.includes('⭐')) {
				return title.split('⭐').at(0).trim();
			}

			// Any other IMDB attachment
			if (title.endsWith('- IMDb') && title.includes(')')) {
				const lastParenthesisIndex = title.lastIndexOf(')');
				return title.slice(0, lastParenthesisIndex + 1).trim();
			}

			return title;
		} catch (error) {
			return null;
		}
	}

	/**
	 * Add banner element to the page
	 */
	function attachBanner() {
		if (document.getElementById(BANNER_ID)) return;

		const banner = document.createElement('button');
		banner.id = BANNER_ID;
		banner.style.all = 'unset';
		banner.style.backgroundImage = `url(${BANNER_IMAGE})`;
		banner.style.backgroundSize = 'contain';
		banner.style.backgroundRepeat = 'no-repeat';
		banner.style.width = '32px';
		banner.style.height = '128px';
		banner.style.top = '-48px';
		banner.style.left = '8px';
		banner.style.opacity = '0';
		banner.style.outline = 'none';
		banner.style.cursor = 'pointer';
		banner.style.position = 'fixed';
		banner.style.zIndex = '9999999999';
		banner.style.transition = 'opacity 0.15s ease, top 0.15s ease';
		banner.style.filter = 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5))';

		// Events
		banner.addEventListener('mouseover', () => (banner.style.top = '-12px'));
		banner.addEventListener('mouseout', () => (banner.style.top = '-24px'));
		banner.addEventListener('click', () => openPlayer());
		banner.addEventListener('mousedown', (event) => event.button === 1 && openPlayer(true));

		setTimeout(() => {
			banner.style.top = '-24px';
			banner.style.opacity = '1';
		}, 300);

		document.body.appendChild(banner);

		attachAltBanner();
	}

	/**
	 * Add alternative (right) banner that opens Yandex search fallback
	 */
	function attachAltBanner() {
		if (document.getElementById(ALT_BANNER_ID)) return;

		const banner = document.createElement('button');
		banner.id = ALT_BANNER_ID;
		banner.title = 'Искать на Яндексе (запасной вариант)';
		banner.style.all = 'unset';
		banner.style.backgroundImage = `url(${ALT_BANNER_IMAGE})`;
		banner.style.backgroundSize = 'contain';
		banner.style.backgroundRepeat = 'no-repeat';
		banner.style.width = '32px';
		banner.style.height = '128px';
		banner.style.top = '-48px';
		banner.style.right = '8px';
		banner.style.opacity = '0';
		banner.style.outline = 'none';
		banner.style.cursor = 'pointer';
		banner.style.position = 'fixed';
		banner.style.zIndex = '9999999999';
		banner.style.transition = 'opacity 0.15s ease, top 0.15s ease';
		banner.style.transform = 'scaleX(-1)';
		banner.style.filter = 'drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.5))';

		banner.addEventListener('mouseover', () => (banner.style.top = '-12px'));
		banner.addEventListener('mouseout', () => (banner.style.top = '-24px'));
		banner.addEventListener('click', () => openYandexSearch());
		banner.addEventListener('mousedown', (event) => event.button === 1 && openYandexSearch());

		setTimeout(() => {
			banner.style.top = '-24px';
			banner.style.opacity = '1';
		}, 300);

		document.body.appendChild(banner);
	}

	/**
	 * Extract release year: from title (IMDB/TMDB) or meta description (Kinopoisk)
	 * @returns {string} Year or empty string
	 */
	function extractYear() {
		try {
			const data = extractMovieData();
			if (data?.title) {
				const match = data.title.match(/\b(19|20)\d{2}\b/);
				if (match) return match[0];
			}
			const desc = document.querySelector('meta[property="og:description"]')?.content || '';
			const match = desc.match(/\b(19|20)\d{2}\b/);
			if (match) return match[0];
		} catch (error) {
			return '';
		}
		return '';
	}

	/**
	 * Open Yandex search for the movie as a fallback source
	 */
	function openYandexSearch() {
		const data = extractMovieData();
		if (!data || !data.title) return logger.error('Failed to extract movie data for search');

		const year = extractYear();
		const query = `Смотреть фильм ${data.title} ${year} онлайн бесплатно в HD 1080 на Лордфильм`.replace(/\s+/g, ' ').trim();
		const url = 'https://yandex.ru/search/?text=' + encodeURIComponent(query);

		logger.info('Opening Yandex search:', query);
		GM.openInTab(url);
	}

	/**
	 * Remove banner from the page
	 */
	function removeBanner() {
		document.getElementById(BANNER_ID)?.remove();
		document.getElementById(ALT_BANNER_ID)?.remove();
	}

	/**
	 * Open player with the extracted data
	 * @param {boolean} loadInBackground If true, page will be opened in background
	 */
	async function openPlayer(loadInBackground = false) {
		const data = extractMovieData();
		if (!data) return logger.error('Failed to extract movie data');

		await GM.setValue('movie-data', data);

		logger.info('Opening player for movie', data);
		GM.openInTab(PLAYER_URL, loadInBackground);
	}

	/**
	 * Init player with the extracted data.
	 * Executed on the player page only.
	 */
	async function initPlayer() {
		const data = await GM.getValue('movie-data', {});
		await GM.deleteValue('movie-data');

		// Skip initialization if no data
		if (!data || Object.keys(data).length === 0) return;

		// Stringify data twice to prevent XSS and automatically escape quotes
		const dataSerialized = JSON.stringify(JSON.stringify(data));
		const versionSerialized = JSON.stringify(VERSION);

		// Inject data to the player
		const scriptElement = document.createElement('script');
		scriptElement.innerHTML = `globalThis.init(JSON.parse(${dataSerialized}), ${versionSerialized});`;
		document.body.appendChild(scriptElement);

		logger.info('Injected movie data:', data);
	}

	// Init player or banner
	logger.info('Script executed');
const PLAYER_DOMAIN = 'https://sanek2mz.duckdns.org:8443';
const PLAYER_PATH = /player/;
const isPlayerPage = PLAYER_DOMAIN === location.origin && PLAYER_PATH.test(location.pathname);
isPlayerPage ? initPlayer() : initBanner()
})();
