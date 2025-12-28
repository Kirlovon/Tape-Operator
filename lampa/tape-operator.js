/**
 * Tape Operator Plugin for LAMPA
 * Opens movies in the Tape Operator player
 *
 * Installation:
 * Add this URL to LAMPA plugins: https://github.com/Kirlovon/Tape-Operator/raw/main/lampa/tape-operator.js
 */
(function () {
    'use strict';

    // Plugin configuration
    var PLUGIN_NAME = 'Tape Operator';
    var PLUGIN_VERSION = '1.0.0';
    var PLAYER_URL = 'https://tapeop.dev/';

    // Logging utility
    var logger = {
        info: function () {
            var args = Array.prototype.slice.call(arguments);
            console.info.apply(console, ['[Tape Operator]'].concat(args));
        },
        error: function () {
            var args = Array.prototype.slice.call(arguments);
            console.error.apply(console, ['[Tape Operator]'].concat(args));
        }
    };

    /**
     * Build the player URL with movie data
     * @param {Object} movieData - Movie data object with imdb, kinopoisk, tmdb, and title
     * @returns {string} Full URL to the player
     */
    function buildPlayerUrl(movieData) {
        // The player accepts a 'data' parameter with JSON-encoded movie data
        var serialized = JSON.stringify(movieData);
        return PLAYER_URL + '?data=' + encodeURIComponent(serialized);
    }

    /**
     * Extract movie data from LAMPA card object
     * @param {Object} card - LAMPA card object
     * @returns {Object|null} Movie data or null if extraction failed
     */
    function extractMovieData(card) {
        if (!card) return null;

        var movieData = {};

        // Get title
        var title = card.title || card.name || card.original_title || card.original_name;
        if (title) {
            movieData.title = title;
        }

        // Get IMDB ID
        if (card.imdb_id) {
            movieData.imdb = card.imdb_id;
        }

        // Get Kinopoisk ID
        if (card.kinopoisk_id) {
            movieData.kinopoisk = String(card.kinopoisk_id);
        } else if (card.kp_id) {
            movieData.kinopoisk = String(card.kp_id);
        }

        // Get TMDB ID
        if (card.id && !card.imdb_id && !card.kinopoisk_id) {
            // If only TMDB ID is available
            movieData.tmdb = String(card.id);
        }

        // Validate that we have at least one ID
        if (!movieData.imdb && !movieData.kinopoisk && !movieData.tmdb) {
            // Try to get TMDB ID anyway
            if (card.id) {
                movieData.tmdb = String(card.id);
            }
        }

        // Check if we have enough data
        if (!movieData.title && !movieData.imdb && !movieData.kinopoisk && !movieData.tmdb) {
            return null;
        }

        return movieData;
    }

    /**
     * Open the Tape Operator player with movie data
     * @param {Object} card - LAMPA card object
     */
    function openPlayer(card) {
        var movieData = extractMovieData(card);

        if (!movieData) {
            logger.error('Failed to extract movie data from card:', card);
            if (typeof Lampa !== 'undefined' && Lampa.Noty) {
                Lampa.Noty.show('Не удалось получить данные о фильме');
            }
            return;
        }

        logger.info('Opening player for movie:', movieData);

        // Open player in new tab/window
        var url = buildPlayerUrl(movieData);
        window.open(url, '_blank');
    }

    /**
     * Add context menu item to movie cards
     */
    function addContextMenuItem() {
        if (typeof Lampa === 'undefined') {
            logger.error('Lampa is not defined');
            return;
        }

        // Add menu item to context menu
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'complite') {
                var menu = e.object.activity.render().find('.full-start-new__buttons');

                if (menu.length && !menu.find('.tape-operator-btn').length) {
                    var button = $('<div class="full-start__button selector tape-operator-btn">' +
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">' +
                        '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>' +
                        '</svg>' +
                        '<span>' + PLUGIN_NAME + '</span>' +
                        '</div>');

                    button.on('hover:enter', function () {
                        var card = e.data.movie;
                        openPlayer(card);
                    });

                    menu.append(button);
                }
            }
        });

        // Add to context menu on long press
        Lampa.Listener.follow('card', function (e) {
            if (e.type === 'contextmenu') {
                e.items.push({
                    title: PLUGIN_NAME,
                    subtitle: 'Смотреть в Tape Operator',
                    onSelect: function () {
                        openPlayer(e.card);
                    }
                });
            }
        });
    }

    /**
     * Initialize the plugin
     */
    function init() {
        logger.info('Plugin v' + PLUGIN_VERSION + ' loaded');

        // Wait for LAMPA to be ready
        if (typeof Lampa === 'undefined') {
            logger.error('Lampa is not defined, waiting...');
            setTimeout(init, 500);
            return;
        }

        // Register the plugin
        if (window.appready) {
            addContextMenuItem();
        } else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') {
                    addContextMenuItem();
                }
            });
        }
    }

    // Start initialization
    init();

})();
