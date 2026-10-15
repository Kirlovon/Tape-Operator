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

- [Tampermonkey](https://www.tampermonkey.net/) (рекомендуемое)
- [Violentmonkey](https://violentmonkey.github.io/)
- [Greasemonkey](https://www.greasespot.net/)
- [Userscripts](https://github.com/quoid/userscripts)

### 2. Включите режим разработчика

Включите режим разработчика и выполнение скриптов в настройках браузера.

### 3. Установите скрипт

Перейдите по ссылке ниже или установите вручную из папки userscript:

**Установка по ссылке:**


**Ручная установка:**
Скачайте  из папки  и установите в менеджере.

### 3. Начинайте пользоваться

Откройте страницу с фильмом на одном из поддерживаемых сайтов и нажмите на флажок в левом верхнем углу!

## Лицензия

MIT

Для более подробной информации посетите [GitHub-репозиторий](https://github.com/sanek1mz/Tape-Operator).
