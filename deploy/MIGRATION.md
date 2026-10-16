# Перенос Tape Operator (selfhost) на новый сервер

Цель: за вечер поднять весь сервис на другом VPS с теми же именами
(домен `sanek2mz.duckdns.org`, порт `8443`). Меняется только IP сервера.

## 1. Подготовка

Создать VPS (Ubuntu 22.04+/24.04), скопировать `deploy/install.sh` на сервер
(scp с ПК). Deploy key и SSH-ключи для GitHub НЕ нужны — репозиторий публичный, сервер
клонирует по HTTPS. Все правки кода делаются на ПК пользователя и пушатся на GitHub
обычным способом; на сервер изменения приезжают через git pull (шаг 4 install.sh
при повторном запуске или вручную: `cd <CLONE_DIR> && git pull`).

## 2. Развёртывание

Заполнить переменные в начале `deploy/install.sh` (DOMAIN, PORT, CLONE_DIR, EMAIL) и запустить от root:

```bash
sudo bash deploy/install.sh
```

Скрипт идемпотентен — его можно перезапускать, незавершённые шаги доделает.

## 3. DuckDNS

Обновить IP: duckdns.org → login → update IP нового сервера.
Пока DNS указывает на старый IP, проверки по публичному домену на новом сервере не пройдут.

## 4. Сертификат

Если DNS уже указывает на новый IP, но сертификат не выпустился
(шаг 5 install.sh не прошёл) — повторить:

```bash
systemctl stop nginx
certbot certonly --standalone -d sanek2mz.duckdns.org -m EMAIL --agree-tos --no-eff-email
bash deploy/install.sh   # доделает шаги 6-8
```

## 5. Проверка

Открыть `https://sanek2mz.duckdns.org:8443/player/` и кликнуть флажок на странице фильма
на Кинопоиске/IMDB/TMDB/Letterboxd.

## Что НЕ переносится автоматически

- xray/VPN — отдельный сервис, к плееру отношения не имеет, настраивается отдельно.
- История просмотров плеера — хранится в localStorage браузера, не на сервере.
