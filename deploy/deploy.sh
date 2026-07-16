#!/bin/bash
# 部署脚本 - 在本地运行
# 用法: ./deploy/deploy.sh user@43.129.250.140

set -e

SERVER=${1:-"root@43.129.250.140"}
REMOTE_DIR="/var/www/20260725"
NGINX_CONF="deploy/nginx.conf"

echo "===== 1. 本地构建 ====="
npm run build

echo "===== 2. 上传文件到服务器 ====="
ssh $SERVER "mkdir -p $REMOTE_DIR"
rsync -avz --delete dist/ $SERVER:$REMOTE_DIR/

echo "===== 3. 部署 Nginx 配置 ====="
scp $NGINX_CONF $SERVER:/etc/nginx/sites-available/memory-store
ssh $SERVER "ln -sf /etc/nginx/sites-available/memory-store /etc/nginx/sites-enabled/memory-store && rm -f /etc/nginx/sites-enabled/default"

echo "===== 4. 测试并重载 Nginx ====="
ssh $SERVER "nginx -t && systemctl reload nginx"

echo "===== 部署完成 ====="
echo "验证: http://43.129.250.140"
echo "域名: http://kabule.online (CDN生效后 https://www.kabule.online)"
