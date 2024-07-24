![Image](/assets/poster.webp)

With this script, [IMDB](https://www.imdb.com/), [TMDB](https://www.themoviedb.org/), [Kinopoisk](https://www.kinopoisk.ru/) and [Letterboxd](https://letterboxd.com/) will become free online cinemas! On each page with a movie or TV series, a flag will appear in the upper left corner. By clicking on it, you will open a player with the movie.

[RUS](README.md) | **ENG**

<br>

## Installation 🎓

1. Install one of the extensions for running custom scripts:

    - [Tampermonkey](https://www.tampermonkey.net/) _(recommended)_
    - [Violentmonkey](https://violentmonkey.github.io/)
    - [Greasemonkey](https://www.greasespot.net/)
    - [Userscripts](https://github.com/quoid/userscripts)

2. Enable [developer mode in your browser](https://www.tampermonkey.net/faq.php?locale=ru#Q209).

3. Install the script by going to [this link](https://github.com/Kirlovon/Tape-Operator/raw/main/userscript/tape-operator.user.js). _(or download `tape-operator.user.js` from folder `userscript`) and install manually)_

Done, now open a page with a movie _([example](https://letterboxd.com/film/babylon-2022/))_ and click on the flag in the upper left corner!

> If the flag doesn't appear, check if the script is installed correctly and restart your browser.

<br>

## Deploy 🚀

In case the link to the player is blocked in your country, you can deploy your own version of the site!

> This instruction is intended for developers and other users with the necessary technical skills.

1. Publish the static site located in the `player` folder of this repository.

    - Files and the `index.html` page should be accessible at the main address. _(http://example.com/index.html or simply http://example.com)_
    - Remove the analytics script located in the header of the `index.html` file to avoid sending anonymous analytics.

2. Edit the script from the `userscript` folder:

    - Replace the `PLAYER_URL` variable with the link to your site.
    - Add a line with the link to your site in the `@match` header. This is necessary for the browser to execute the script on your player page.
    - Remove the `@updateURL` and `@downloadURL` headers from the file so that the script doesn't try to update itself.
    - Make sure that the version in the `@version` header is equal to or not lower than the version specified in the `config.js` file, in the `REQUIRED_VERSION` variable. Otherwise, there will be a notification about an outdated script on the site.

3. Install the edited script.

> Self-hosting doesn't guarantee 100% site functionality, as [Kinobox API](https://kinobox.tv/) is used to obtain sources, which is currently impossible to deploy independently.

<br>

## Disclaimer

The player works based on [Kinobox API](https://kinobox.tv/) and is provided solely for informational purposes!

The project does not store or distribute pirated content. All rights to the materials belong to their rightful owners. To remove illegal content, please contact the original source. I am not responsible for the content posted on third-party resources.

**_Piracy is bad!_**

<br>

## License

MIT _([LICENSE](https://github.com/Kirlovon/Tape-Operator/blob/main/LICENSE) file)_
