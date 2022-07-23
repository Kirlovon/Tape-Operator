// ==UserScript==
// @name		Kinopoisk Watch
// @namespace	kinopoisk-watch
// @author		Kirlovon
// @description Watch films on Kinopoisk.ru for free!
// @icon		https://raw.githubusercontent.com/Kirlovon/Kinopoisk-Watch/gh-pages/assets/favicon.png
// @version		1.3.0
// @match		*://www.kinopoisk.ru/*
// @grant		none
// @run-at		document-end
// ==/UserScript==

// Vector image of the banner
const BANNER_IMAGE = `
<svg width="100%" height="100%" viewBox="0 0 128 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
	<path id="Banner" d="M128,0L0,0L0,512L64,480L128,512L128,0Z" style="fill:url(#bg);"/>
	<g id="icon" transform="matrix(1,0,0,1,-64,0)">
		<path d="M168,382C168,360.057 149.943,342 128,342C106.057,342 88,360.057 88,382C88,403.943 106.057,422 128,422L165,422L168,410L162,410L160,414L152,414C162.065,406.452 168,394.581 168,382ZM96,382C96,364.445 110.445,350 128,350C145.555,350 160,364.445 160,382C160,399.555 145.555,414 128,414C110.445,414 96,399.555 96,382ZM128,393C132.415,393 136,396.585 136,401C136,405.415 132.415,409 128,409C123.585,409 120,405.415 120,401C120,396.585 123.585,393 128,393ZM144,383C148.415,383 152,386.585 152,391C152,395.415 148.415,399 144,399C139.585,399 136,395.415 136,391C136,386.585 139.585,383 144,383ZM112,383C116.415,383 120,386.585 120,391C120,395.415 116.415,399 112,399C107.585,399 104,395.415 104,391C104,386.585 107.585,383 112,383ZM144,365C148.415,365 152,368.585 152,373C152,377.415 148.415,381 144,381C139.585,381 136,377.415 136,373C136,368.585 139.585,365 144,365ZM112,365C116.415,365 120,368.585 120,373C120,377.415 116.415,381 112,381C107.585,381 104,377.415 104,373C104,368.585 107.585,365 112,365ZM128,355C132.415,355 136,358.585 136,363C136,367.415 132.415,371 128,371C123.585,371 120,367.415 120,363C120,358.585 123.585,355 128,355Z" style="fill:rgb(235,255,255);fill-rule:nonzero;"/>
	</g>
	<defs>
		<linearGradient id="bg" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(128,512,-2048,512,0,0)"><stop offset="0" style="stop-color:rgb(248,12,101);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(247,88,27);stop-opacity:1"/></linearGradient>
	</defs>
</svg>
`;

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
	banner.innerHTML = BANNER_IMAGE;
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
	banner.addEventListener('mouseover', () => { banner.style.top = '-16px' });
	banner.addEventListener('mouseout', () => { banner.style.top = '-32px' });

	// Show with delay
	setTimeout(() => { banner.style.top = '-32px' }, 300);

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
	const movieId = urlData[4];
	const movieType = urlData[3];

	// Unmount if link is invalid
	if (!movieId || !movieType || !MOVIE_TYPES.includes(movieType)) {
		if (banner) unmountBanner();
	} else {
		if (!banner) mountBanner();

		const link = new URL(PLAYER_LINK);
		link.searchParams.set('id', movieId);
		document.getElementById(BANNER_ID).setAttribute('href', link.toString());
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
