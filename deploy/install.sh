#!/bin/bash
# =============================================================================
# deploy/install.sh — идемпотентное развёртывание Tape Operator (selfhost)
# на ЧИСТОМ сервере Ubuntu 22.04+/24.04. Можно безопасно перезапускать.
#
# Запуск: sudo bash deploy/install.sh
# =============================================================================
set -euo pipefail

# --- Переменные, правятся под себя -------------------------------------------
DOMAIN="sanek2mz.duckdns.org"
PORT="8443"
CLONE_DIR="/opt/tape-operator"
GIT_REPO="https://github.com/sanek1mz/Tape-Operator.git"   # публичный, HTTPS, без ключей
EMAIL="user@example.com"    # для certbot
# -----------------------------------------------------------------------------

WWW_DIR="/var/www/tape-operator"   # статика, на которую смотрит nginx (alias)

# 0. Права root
if [ "$(id -u)" -ne 0 ]; then
    echo "ОШИБКА: запуск от root (sudo bash deploy/install.sh)"; exit 1
fi

# 1. Системные пакеты
echo "[1/8] Установка nginx, git, python3, pip..."
apt-get update -qq
apt-get install -y -qq nginx git python3 python3-pip

# 2. Python-зависимость прокси (TLS-имперсонация)
echo "[2/8] Установка curl_cffi..."
pip3 install curl_cffi --break-system-packages 2>/dev/null || pip3 install curl_cffi

# 3. Фаервол (тихо, если правило уже есть)
echo "[3/8] Открытие портов: 22, 80, 443, $PORT..."
for p in 22 80 443 "$PORT"; do
    ufw allow "$p/tcp" >/dev/null 2>&1 || true
done
ufw reload >/dev/null 2>&1 || true

# 4. Клон/обновление по HTTPS (ключи не используются, репозиторий публичный)
echo "[4/8] Клон/обновление репозитория..."
if [ ! -d "$CLONE_DIR/.git" ]; then
    git clone -b selfhost "$GIT_REPO" "$CLONE_DIR"
else
    git -C "$CLONE_DIR" fetch origin
    git -C "$CLONE_DIR" reset --hard origin/selfhost
fi

# 4.1 Статика: nginx раздаёт из $WWW_DIR (alias), держим её в sync с клоном
echo "[4/8] Синхронизация статики в $WWW_DIR..."
mkdir -p "$WWW_DIR"
cp -r "$CLONE_DIR/player/." "$WWW_DIR/player/"
cp "$CLONE_DIR/userscript/tape-operator.user.js" "$WWW_DIR/tape-operator.user.js"

# 5. SSL через certbot (только если сертификата ещё нет)
echo "[5/8] Проверка/выпуск SSL-сертификата..."
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    apt-get install -y -qq certbot python3-certbot-nginx 2>/dev/null || apt-get install -y -qq certbot
    # Порт 80 должен быть свободен: временно останавливаем nginx
    systemctl stop nginx
    certbot certonly --standalone -d "$DOMAIN" -m "$EMAIL" --agree-tos --no-eff-email
    # nginx пока запустим не включим — включится в шаге 7 после конфига
else
    echo "      сертификат уже есть, пропускаю"
fi

# 6. systemd-юнит прокси (подставляем $CLONE_DIR)
echo "[6/8] Настройка kinobox-proxy (systemd)..."
sed "s|/opt/tape-operator|$CLONE_DIR|g" "$CLONE_DIR/deploy/kinobox-proxy.service" \
    > /etc/systemd/system/kinobox-proxy.service
systemctl daemon-reload
systemctl enable --now kinobox-proxy

# 7. nginx: шаблон → реальный конфиг (подставим домен/порт/пути/сертификаты)
echo "[7/8] Настройка nginx..."
sed -e "s|__DOMAIN__|$DOMAIN|g" \
    -e "s|__PORT__|$PORT|g" \
    -e "s|__WWW_DIR__|$WWW_DIR|g" \
    "$CLONE_DIR/deploy/nginx-tape-operator.conf" \
    > /etc/nginx/sites-available/tape-operator
ln -sf /etc/nginx/sites-available/tape-operator /etc/nginx/sites-enabled/tape-operator
nginx -t
systemctl reload nginx 2>/dev/null || systemctl start nginx

# 8. Проверки
echo "[8/8] Проверки..."
echo "--- локальный прокси (127.0.0.1:8787):"
curl -s 'http://127.0.0.1:8787/?imdb=tt0133093' | head -c 100; echo
echo "--- локальный плеер через nginx:"
curl -sk "https://localhost:$PORT/player/" -H "Host: $DOMAIN" | head -c 100; echo
echo "--- API через публичный домен (проходит ТОЛЬКО ПОСЛЕ обновления IP в DuckDNS):"
curl -sk "https://$DOMAIN:$PORT/player/api/kinobox?imdb=tt0133093" | head -c 100; echo

echo "ГОТОВО. Если последняя проверка не проходит — обновите IP в DuckDNS (duckdns.org → login → update IP)."
