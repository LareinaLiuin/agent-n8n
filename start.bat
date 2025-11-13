@echo off
REM n8n Agent Assistant Windows 启动脚本
REM 快速启动开发环境

echo 🚀 启动 n8n Agent Assistant 开发环境...

REM 检查 Node.js 版本
echo 📋 检查 Node.js 版本...
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js 16+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%

REM 检查环境变量文件
echo 🔧 检查环境配置...

if not exist "backend\.env" (
    echo 📝 创建后端环境变量文件...
    copy "backend\.env.example" "backend\.env"
    echo ⚠️  请编辑 backend\.env 文件，添加你的 OpenAI API Key
)

if not exist "frontend\.env" (
    echo 📝 创建前端环境变量文件...
    copy "frontend\.env.example" "frontend\.env"
)

REM 安装后端依赖
echo 📦 安装后端依赖...
cd backend
if not exist "node_modules" (
    npm install
)

REM 检查后端是否能编译
echo 🔨 检查后端编译...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 后端编译失败
    pause
    exit /b 1
)

cd ..

REM 安装前端依赖
echo 📦 安装前端依赖...
cd frontend
if not exist "node_modules" (
    npm install
)

cd ..

echo.
echo 🎉 环境准备完成！
echo.
echo 📋 启动说明：
echo 1. 编辑 backend\.env 文件，添加你的 OpenAI API Key
echo 2. 在一个命令行中运行: cd backend && npm run dev
echo 3. 在另一个命令行中运行: cd frontend && npm run dev
echo 4. 在浏览器中打开: http://localhost:3000
echo.
echo 📚 更多信息请查看：
echo - 用户指南: docs\USER_GUIDE.md
echo - 开发指南: docs\DEVELOPMENT.md
echo - 部署指南: docs\DEPLOYMENT.md
echo.

REM 询问是否立即启动
set /p "choice=是否立即启动服务？(y/n): "
if /i "%choice%"=="y" (
    echo 🚀 启动后端服务...
    start "Backend" cmd /k "cd backend && npm run dev"

    timeout /t 3 /nobreak >nul

    echo 🚀 启动前端服务...
    start "Frontend" cmd /k "cd frontend && npm run dev"

    echo.
    echo ✅ 服务启动成功！
    echo 📍 前端地址: http://localhost:3000
    echo 📍 后端地址: http://localhost:3001
    echo.
    echo 按任意键退出...
    pause >nul
) else (
    echo 👋 开发愉快！
    pause
)

exit /b 0