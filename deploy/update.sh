#!/bin/bash
# Обновление Tape-Operator на сервере через git pull по SSH с deploy-ключом.

set -euo pipefail

REPO_DIR="/var/www/Tape-Operator"
DEPLOY_KEY="$HOME/.ssh/tape_operator_deploy"

# Проверяем, что приватный ключ существует и доступен только владельцу
if [ ! -f "$DEPLOY_KEY" ]; then
    echo "Ошибка: ключ $DEPLOY_KEY не найден." >&2
    exit 1
fi

chmod 600 "$DEPLOY_KEY"

# Pull по SSH с ключом tape_operator_deploy (секреты не попадают в репозиторий)
GIT_SSH_COMMAND="ssh -i $DEPLOY_KEY -o IdentitiesOnly=yes" \
    git -C "$REPO_DIR" pull origin selfhost

echo "Обновление завершено."
