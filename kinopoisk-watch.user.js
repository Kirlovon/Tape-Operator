// ==UserScript==
// @name		Kinopoisk Watch
// @namespace	kinopoisk-watch
// @author		Kirlovon
// @description Watch films on Kinopoisk.ru for free!
// @icon		https://github.com/Kirlovon/Kinopoisk-Watch/raw/master/website/favicon.png
// @version		2.2.0
// @match		*://www.kinopoisk.ru/*
// @grant		none
// @run-at		document-end
// ==/UserScript==

const BANNER_IMAGE = 'data:image/webp;base64,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';
const BANNER_ID = 'kinopoisk-watch';
const MOVIE_TYPES = ['film', 'series'];
const PLAYER_LINK = 'https://kinopoisk-watch.org/player/';

let lastUrl = '/';

/**
 * Add banner element to the page
 */
function mountBanner() {
	const banner = document.createElement('a');
	banner.target = '_blank';
	banner.id = BANNER_ID;
	banner.style.backgroundImage = `url(${BANNER_IMAGE})`;
	banner.style.backgroundSize = 'contain';
	banner.style.backgroundRepeat = 'no-repeat'
	banner.style.width = '32px';
	banner.style.height = '128px';
	banner.style.top = '-128px';
	banner.style.left = '8px';
	banner.style.outline = 'none';
	banner.style.cursor = 'pointer';
	banner.style.position = 'fixed';
	banner.style.zIndex = '9999999999';
	banner.style.transition = 'top 0.2s ease';

	// Events
	banner.addEventListener('mouseover', () => { banner.style.top = '-4px' });
	banner.addEventListener('mouseout', () => { banner.style.top = '-24px' });

	// Show with delay
	setTimeout(() => { banner.style.top = '-24px' }, 300);

	document.body.appendChild(banner);
}

/**
 * Remove banner element from the page
 */
function unmountBanner() {
	const banner = document.getElementById(BANNER_ID);
	if (banner) banner.remove();
}

/**
 * Process & update banner depending on the current page state
 */
function updateBanner() {
	const url = location.href;

	// Skip if the same url
	if (url === lastUrl) return;
	lastUrl = url;

	const banner = document.getElementById(BANNER_ID);
	const urlData = url.split('/');
	const movieId = urlData.at(4);
	const movieType = urlData.at(3);

	// Unmount if link is invalid
	if (!movieId || !movieType || !MOVIE_TYPES.includes(movieType)) {
		if (banner) unmountBanner();
	} else {
		if (!banner) mountBanner();

		const link = new URL(PLAYER_LINK);
		link.searchParams.set('id', movieId);
		link.searchParams.set('title', extractTitle());
		document.getElementById(BANNER_ID).setAttribute('href', link.toString());
	}
}

/**
 * Extract movie title from the page
 */
function extractTitle() {
	try {
		// Extract from the Open Graph meta tags
		let title = document.querySelector('meta[property="og:title"]')?.content;
		if (title) return title;

		// Extract from the page title
		const match = document.title.match(/^([\p{L}\d\s-]+?)(?=\s*(?:,|\(|$))/gui);
		title = match.at(0).trim();
		return title || document.title;

	} catch (error) {
		return document.title;
	}
}

/**
 * Script initialization
 */
function init() {

	// Listen for the Url changes
	const observer = new MutationObserver(() => updateBanner());
	observer.observe(document, { subtree: true, childList: true });

	// Initialize
	updateBanner();
	console.log('Kinopoisk Watch started! 🎥');
}

init();
