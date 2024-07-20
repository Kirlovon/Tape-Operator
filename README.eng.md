![Image](/assets/poster.webp)

With this script, [IMDB](https://www.imdb.com/), [TMDB](https://www.themoviedb.org/), [Kinopoisk](https://www.kinopoisk.ru/), and [Letterboxd](https://letterboxd.com/) will become free online cinemas! On every movie or TV show page, a banner will appear in the top left corner. Clicking on it will open a player with the movie.

[RUS](README.md) | **ENG**

<br>

## Installation 🎓

1. Install one of the browser extensions to run custom scripts:

    - [Tampermonkey](https://www.tampermonkey.net/) _(recommended)_
    - [Violentmonkey](https://violentmonkey.github.io/)
    - [Greasemonkey](https://www.greasespot.net/)
    - [Userscripts](https://github.com/quoid/userscripts)

2. Enable [developer mode in your browser](https://www.tampermonkey.net/faq.php#Q209).
3. Install the script by following [this link](https://github.com/Kirlovon/Tape-Operator/raw/master/tape-operator.user.js). _(or download `tape-operator.user.js` and install manually)_

Done! Now open a movie page _([example](https://letterboxd.com/film/babylon-2022/))_ and click on the flag in the top left corner!

> If the flag does not appear, check if the script is installed correctly and restart your browser.

<br>

## Deploy 🚀

In case the link to the player is blocked in your country, you can deploy your own version of the site!

> This instruction is intended for developers and other users with necessary technical skills.

1. Publish a static website located in the `player` folder of this repository.

    - Files and the `index.html` page should be accessible at the main address. _(http://example.com/index.html or simply http://example.com)_

    - Remove the analytics script found in the header of the `index.html` file to avoid sending anonymous analytics.

2. Edit the script from the `userscript` folder:

    - Replace the `PLAYER_URL` variable with a link to your site.

    - Add a line with a link to your site in the `@match` header. This is necessary for the browser to execute the script on your player page.

    - Remove the `@updateURL` and `@downloadURL` headers from the file so the script does not attempt to update itself.

    - Ensure that the version in the `@version` header matches or is not lower than the version specified in the `player.js` file under the `REQUIRED_VERSION` variable. Otherwise, the site will display a script outdated notification.

3. Install the edited script.

> Self-hosting does not guarantee 100% site functionality as it is based on the [Kinobox](https://kinobox.tv/) player, which currently cannot be self-deployed.

<br>

## Disclaimer

The script operates based on the [Kinobox.tv](https://kinobox.tv/) player and is provided solely for informational purposes!

This project does not store or distribute pirate content. All rights to the materials belong to their rightful owners. For the removal of illegal content, please contact the original source. I do not take responsibility for content posted on third-party sites.

**_Piracy is bad!_**

<br>

## License

MIT _([LICENSE](https://github.com/Kirlovon/Tape-Operator/blob/master/LICENSE) file)_
