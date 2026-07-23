#!/bin/bash
# 在服务器上运行（通过 WebShell）
# 用法: cd ~/20260725 && bash deploy/deploy-server.sh

set -e

PROJECT_DIR=~/20260725
WEB_DIR=/var/www/20260725

echo "===== 1. 拉取最新代码 ====="
cd $PROJECT_DIR
git pull

echo "===== 2. 安装依赖 ====="
rm -rf node_modules package-lock.json
npm install

echo "===== 3. 构建 ====="
npm run build

echo "===== 4. 部署到网站目录 ====="
sudo mkdir -p $WEB_DIR
sudo cp -r dist/* $WEB_DIR/
sudo chown -R www-data:www-data $WEB_DIR
sudo chmod -R 755 $WEB_DIR

echo "===== 5. 重载 Nginx ====="
sudo nginx -t && sudo systemctl reload nginx

echo "===== 6. 重启后端服务 ====="
pm2 restart memory-store 2>/dev/null || pm2 start $PROJECT_DIR/backend/server.js --name memory-store

echo "===== 部署完成 ====="
