// ==UserScript==
// @name         Kinopoisk Watch
// @namespace    kinopoisk-watch
// @version      1.1
// @description  Watch films on Kinopoisk.ru for free!
// @author       Kirlovon
// @match        *://www.kinopoisk.ru/*/*
// @grant        none
// ==/UserScript==

const kinopoiskWatchLink = 'https://kirlovon.github.io/Kinopoisk-Watch';
const bannerId = 'kinopoisk-watch';
const movieTypes = ['film', 'series'];

// Image of the banner
const bannerImage = `
<svg width="100%" height="100%" viewBox="0 0 128 512" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <path id="Banner" d="M128,0L0,0L0,512L64,480L128,512L128,0Z" style="fill:url(#_Linear1);"/>
    <g id="icon" transform="matrix(1,0,0,1,-64,0)">
        <path d="M168,382C168,360.057 149.943,342 128,342C106.057,342 88,360.057 88,382C88,403.943 106.057,422 128,422L165,422L168,410L162,410L160,414L152,414C162.065,406.452 168,394.581 168,382ZM96,382C96,364.445 110.445,350 128,350C145.555,350 160,364.445 160,382C160,399.555 145.555,414 128,414C110.445,414 96,399.555 96,382ZM128,393C132.415,393 136,396.585 136,401C136,405.415 132.415,409 128,409C123.585,409 120,405.415 120,401C120,396.585 123.585,393 128,393ZM144,383C148.415,383 152,386.585 152,391C152,395.415 148.415,399 144,399C139.585,399 136,395.415 136,391C136,386.585 139.585,383 144,383ZM112,383C116.415,383 120,386.585 120,391C120,395.415 116.415,399 112,399C107.585,399 104,395.415 104,391C104,386.585 107.585,383 112,383ZM144,365C148.415,365 152,368.585 152,373C152,377.415 148.415,381 144,381C139.585,381 136,377.415 136,373C136,368.585 139.585,365 144,365ZM112,365C116.415,365 120,368.585 120,373C120,377.415 116.415,381 112,381C107.585,381 104,377.415 104,373C104,368.585 107.585,365 112,365ZM128,355C132.415,355 136,358.585 136,363C136,367.415 132.415,371 128,371C123.585,371 120,367.415 120,363C120,358.585 123.585,355 128,355Z" style="fill:rgb(235,255,255);fill-rule:nonzero;"/>
    </g>
    <defs>
        <linearGradient id="_Linear1" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse" gradientTransform="matrix(128,512,-2048,512,0,0)"><stop offset="0" style="stop-color:rgb(248,12,101);stop-opacity:1"/><stop offset="1" style="stop-color:rgb(247,88,27);stop-opacity:1"/></linearGradient>
    </defs>
</svg>
`;

function openMoviePlayerPage(movieId) {
    const link = new URL(kinopoiskWatchLink);
    link.searchParams.set('id', movieId);
    window.open(link.toString(), '_blank').focus();
}

function mountBanner(movieId) {
    const banner = document.createElement('div');
    banner.id = bannerId;
    banner.innerHTML = bannerImage;
    banner.style.width = '32px';
    banner.style.height = '128px';
    banner.style.top = '-128px';
    banner.style.left = '8px';
    banner.style.outline = 'none';
    banner.style.cursor = 'pointer';
    banner.style.position = 'fixed';
    banner.style.zIndex = '9999999999';
    banner.style.transition = 'top 0.2s ease';

    setTimeout(() => {
        banner.style.top = '-32px';
        banner.addEventListener('click', () => openMoviePlayerPage(movieId));
        banner.addEventListener('mouseover', () => { banner.style.top = '0px' });
        banner.addEventListener('mouseout', () => { banner.style.top = '-32px' });
    }, 100);

    document.body.appendChild(banner);
}

function removeBanner() {
    if (document.contains(document.getElementById(bannerId))) {
        document.getElementById(bannerId).remove();
    }
}

/**
 * Initialize script
 */
function init() {
    const url = window.location.href;
    const urlData = url.split('/');
    const movieId = urlData[4];
    const movieType = urlData[3];

    if (typeof movieId === 'undefined' || typeof movieType === 'undefined') {
        console.error('Kinopoisk Watch movie data incorrect');
        removeBanner();

        return;
    }

    if (movieTypes.includes(movieType)) {
        mountBanner(movieId);
    } else {
        removeBanner();
    }
}

// Init on change url without refresh
let lastUrl = location.href;
new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
        lastUrl = url;
        init();
    }
}).observe(document, {subtree: true, childList: true});

// Init on load
window.addEventListener('load', init);
