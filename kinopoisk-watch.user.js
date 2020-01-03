// ==UserScript==
// @name         Kinopoisk Watch
// @namespace    kinopoisk-watch
// @version      0.2
// @description  Watch films on Kinopoisk.ru for free!
// @author       Kirlovon
// @match        *://www.kinopoisk.ru/film/*
// @grant        none
// ==/UserScript==

// Show button when page loaded
showButton();

// Show watch button
function showButton() {

    // Create watch button
    const watchButton = document.createElement('button');
    watchButton.innerText = 'Смотреть';
    watchButton.className = 'movie-button movie-trailer-button';
    watchButton.style.color = 'white';
    watchButton.style.background = 'linear-gradient(45deg, #FF0055, #FF5500)';
    watchButton.onclick = openPlayer;

    // Add button to the page
    const buttonsContainer = document.getElementsByClassName('movie-buttons-container')[0];
    buttonsContainer.prepend(watchButton);
}

// Open page with film player
function openPlayer() {

    // Get id of the film
    const url = window.location.href;
    const id = url.split('/')[4];
    const watchPage = `https://kirlovon.github.io/Kinopoisk-Watch/#/${id}`;

    // Create film overlay
    const overlay = document.createElement('div');
    overlay.id = 'kinopoisk-watch-overlay';
    overlay.className = 'discovery-trailers-overlay';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.setAttribute('src', watchPage);
    iframe.setAttribute('allowfullscreen', true);
    iframe.setAttribute('name', 'KinoPoisk Watch');
    iframe.style.position = 'fixed';
    iframe.style.display = 'block';
    iframe.style.border = 'none';
    iframe.style.top = '50%';
    iframe.style.left = '50%';
    iframe.style.borderRadius = '4px';
    iframe.style.backgroundColor = 'black';
    iframe.style.boxShadow = '0px 8px 32px rgba(0, 0, 0, 0.5)';
    iframe.style.width = 'calc(90% - 64px)';
    iframe.style.height = 'calc(90% - 64px)';
    iframe.style.transform = 'translate(-50%, -50%)';

    // Create close button
    const close = document.createElement('button');
    close.className = 'discovery-trailers-closer';
    close.onclick = closePlayer;

    // Create Powered By link
    const poweredBy = document.createElement('a');
    poweredBy.setAttribute('href', 'https://yohoho.cc/');
    poweredBy.setAttribute('target', '_blank');
    poweredBy.style.position = 'fixed';
    poweredBy.style.cursor = 'pointer';
    poweredBy.style.fontSize = '12px';
    poweredBy.style.color = 'white';
    poweredBy.style.bottom = '16px';
    poweredBy.style.left = '16px';
    poweredBy.innerHTML = 'Powered by Yohoho';

    // Add overlay to body
    overlay.appendChild(close);
    overlay.appendChild(iframe);
    overlay.appendChild(poweredBy);
    document.body.appendChild(overlay);
}

// Close player
function closePlayer() {
    document.getElementById('kinopoisk-watch-overlay').remove();
}