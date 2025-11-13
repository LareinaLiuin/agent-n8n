#!/bin/bash

# n8n Agent Assistant 启动脚本
# 快速启动开发环境

set -e

echo "🚀 启动 n8n Agent Assistant 开发环境..."

# 检查 Node.js 版本
echo "📋 检查 Node.js 版本..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 16+"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js 版本: $NODE_VERSION"

# 检查环境变量文件
echo "🔧 检查环境配置..."

if [ ! -f "backend/.env" ]; then
    echo "📝 创建后端环境变量文件..."
    cp backend/.env.example backend/.env
    echo "⚠️  请编辑 backend/.env 文件，添加你的 OpenAI API Key"
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 创建前端环境变量文件..."
    cp frontend/.env.example frontend/.env
fi

# 安装后端依赖
echo "📦 安装后端依赖..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

# 检查后端是否能编译
echo "🔨 检查后端编译..."
npm run build

cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

cd ..

echo ""
echo "🎉 环境准备完成！"
echo ""
echo "📋 启动说明："
echo "1. 编辑 backend/.env 文件，添加你的 OpenAI API Key"
echo "2. 在一个终端中运行: cd backend && npm run dev"
echo "3. 在另一个终端中运行: cd frontend && npm run dev"
echo "4. 在浏览器中打开: http://localhost:3000"
echo ""
echo "📚 更多信息请查看："
echo "- 用户指南: docs/USER_GUIDE.md"
echo "- 开发指南: docs/DEVELOPMENT.md"
echo "- 部署指南: docs/DEPLOYMENT.md"
echo ""

# 询问是否立即启动
read -p "是否立即启动服务？(y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 启动后端服务..."
    cd backend
    npm run dev &
    BACKEND_PID=$!

    sleep 3

    echo "🚀 启动前端服务..."
    cd ../frontend
    npm run dev &
    FRONTEND_PID=$!

    echo ""
    echo "✅ 服务启动成功！"
    echo "📍 前端地址: http://localhost:3000"
    echo "📍 后端地址: http://localhost:3001"
    echo ""
    echo "按 Ctrl+C 停止服务..."

    # 等待用户中断
    trap "echo '🛑 停止服务...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
    wait
fi

echo "👋 开发愉快！"