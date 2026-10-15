# Самохранилище Tape Operator

![Banner](https://sanek2mz.duckdns.org:8443/player/thumbnail.png)

## Что это?

Самохраниливая версия скрипта Tape Operator, который обходит блокировки РКН. Позволяет смотреть фильмы с IMDB, TMDB, Kinopoisk и Letterboxd через ваш собственный плеер.

**Важно: Для использования скрипта с территории РФ требуется VPN.** из-за блокировок Roskomnadzor.

## Возможности

- ⛔ Обходит блокировки РКН через самохраниливый nginx
- 🎬 Плеер на вашем домене:порт
- 📡 Обновления скрипта с вашего сервера (а не с GitHub)
- 🔒 Нет внешних зависимостей, которые могут быть заблокированы
- 📦 Полный контроль над вашими данными

## Player URL



## Userscript Installation



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


**Manual install:**
Download  from the  folder and install it in your manager.

### 4. Start using

Open a movie page on any supported site and click the flag in the upper left corner!

## License

MIT

For more information, visit the [GitHub repository](https://github.com/sanek1mz/Tape-Operator).
