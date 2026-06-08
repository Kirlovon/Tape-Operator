// ==UserScript==
// @name            Tape Operator
// @namespace       tape-operator
// @author          Kirlovon
// @description     Watch movies on IMDB, TMDB, Kinopoisk and Letterboxd!
// @version         3.3.3
// @icon            https://github.com/Kirlovon/Tape-Operator/raw/main/assets/favicon.png
// @updateURL       https://github.com/Kirlovon/Tape-Operator/raw/main/userscript/tape-operator.user.js
// @downloadURL     https://github.com/Kirlovon/Tape-Operator/raw/main/userscript/tape-operator.user.js
// @resource        BANNER_IMAGE https://cdn.jsdelivr.net/gh/Kirlovon/Tape-Operator@main/assets/banner.webp
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
// @match           *://www.betaseries.com/*/show/*
// @match           *://www.betaseries.com/*/movie/*
// @match           *://www.betaseries.com/*/episode/*
// @match           *://tapeop.dev/*
// ==/UserScript==

(function () {

	// Current version of the script
	const VERSION = GM.info?.script?.version;

	// Banner image
	// Violentmonkey: false forces data URL to avoid CSP issues with blob
	const BANNER_IMAGE = GM_getResourceURL('BANNER_IMAGE', false);

	// URL to the player
	const PLAYER_URL = 'https://tapeop.dev/';

	// ID of the banner, attached to the page
	const BANNER_ID = 'tape-operator-banner';

	// URL Matchers
	const KINOPOISK_MATCHER = /kinopoisk\.ru\/(film|series)\/.*/;
	const IMDB_MATCHER = /imdb\.com\/title\/tt\.*/;
	const TMDB_MATCHER = /themoviedb\.org\/(movie|tv)\/\.*/;
	const LETTERBOXD_MATCHER = /letterboxd\.com\/film\/\.*/;
	const BETASERIES_MATCHER = /betaseries\.com\/[a-z-]+\/(show|movie|episode)\/.+/;
	const MATCHERS = [KINOPOISK_MATCHER, IMDB_MATCHER, TMDB_MATCHER, LETTERBOXD_MATCHER, BETASERIES_MATCHER];

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

		// IMDB ID from Letterboxd or BetaSeries
		if (url.match(LETTERBOXD_MATCHER) || url.match(BETASERIES_MATCHER)) {
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
			// BetaSeries: prefer the h1 title element over the og:title meta tag
			const betaseriesTitle = document.querySelector('h1.blockInformations__title');
			if (betaseriesTitle) {
				const title = betaseriesTitle.textContent?.trim();
				if (title) return title;
			}

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
	}

	/**
	 * Remove banner from the page
	 */
	function removeBanner() {
		document.getElementById(BANNER_ID)?.remove();
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
	location.href.includes(PLAYER_URL) ? initPlayer() : initBanner();
})();
