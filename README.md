# Tape Operator Self-Hosted

![Banner](https://sanek2mz.duckdns.org:8443/player/thumbnail.png)

## What is this?

Self-hosted version of Tape Operator script that bypasses RKN blocks. Allows watching movies from IMDB, TMDB, Kinopoisk and Letterboxd through your own player instance.

**Important: A VPN is REQUIRED to use this script from Russian territory** due to Roskomnadzor blocking.

## Features

- \u26d4 Bypasses RKN blocks via self-hosted nginx
- \u26cf Player hosted on your domain:port
- \u26e1 Userscript updates from your server (not GitHub)
- \u26e9 No external dependencies that can be blocked
- \u26e9 Full control over your data

## Player URL

```text
https://sanek2mz.duckdns.org:8443/player/
```

## Userscript Installation

```text
https://sanek2mz.duckdns.org:8443/tape-operator.user.js
```

## How it works

1. Install the userscript via Tampermonkey/Violentmonkey
2. Open any supported movie page (IMDB, TMDB, Kinopoisk, Letterboxd)
3. Click the flag that appears in the upper left corner
4. Player opens with the movie data
5. All API requests go through your nginx proxy

## Supported Sites

- IMDB (imdb.com)
- TMDB (themoviedb.org)
- Kinopoisk (kinopoisk.ru)
- Letterboxd (letterboxd.com)

## Important Notes

- **VPN REQUIRED** for users in Russia due to RKN blocks
- All data processing happens locally - no piracy content is stored
- Player and userscript are fully under your control
- Updates come from your server, not the original project

## Installation

### 1. Install userscript runner

- [Tampermonkey](https://www.tampermonkey.net/) (recommended)
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)
- [Userscripts](https://github.com/quoid/userscripts)

### 2. Enable script execution

Enable developer mode and script execution in your browser settings.

### 3. Install the script

Go to the installation link below or manually install from the userscript folder:

**Install via link:**
```text
https://sanek2mz.duckdns.org:8443/tape-operator.user.js
```

**Manual install:**
Download  from the  folder and install it in your manager.

### 4. Start using

Open a movie page on any supported site and click the flag in the upper left corner!

## License

MIT

For more information, visit the [GitHub repository](https://github.com/sanek1mz/Tape-Operator).
