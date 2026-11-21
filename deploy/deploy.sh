#!/usr/bin/env bash
# 用法：
#   ECS_HOST=1.2.3.4 ECS_USER=root ECS_PATH=/var/www/pinyin-hanzi-app ./deploy/deploy.sh
# 可选：ECS_PORT=22
set -euo pipefail

: "${ECS_HOST:?请设置 ECS_HOST（服务器 IP 或域名）}"
ECS_USER="${ECS_USER:-root}"
ECS_PORT="${ECS_PORT:-22}"
ECS_PATH="${ECS_PATH:-/var/www/pinyin-hanzi-app}"

cd "$(dirname "$0")/.."

ssh -p "$ECS_PORT" "$ECS_USER@$ECS_HOST" "mkdir -p '$ECS_PATH'"
rsync -avz --delete \
  -e "ssh -p $ECS_PORT" \
  --exclude '.git' \
  --exclude 'deploy' \
  --exclude '.github' \
  ./ "$ECS_USER@$ECS_HOST:$ECS_PATH/"

echo "已部署到 $ECS_USER@$ECS_HOST:$ECS_PATH"
echo "首次部署请把 deploy/nginx.conf 放到 /etc/nginx/conf.d/ 并执行：nginx -t && systemctl reload nginx"
