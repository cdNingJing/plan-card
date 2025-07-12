#!/usr/bin/env python3
"""
Python向量数据库服务器启动脚本
"""

import subprocess
import sys
import os
import asyncio
from pathlib import Path

def install_requirements():
    """安装Python依赖"""
    print("📦 安装Python依赖...")
    
    requirements_file = Path("server/requirements.txt")
    if not requirements_file.exists():
        print("❌ requirements.txt 文件不存在")
        return False
    
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ])
        print("✅ Python依赖安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 安装依赖失败: {e}")
        return False

def start_python_server():
    """启动Python服务器"""
    print("🚀 启动Python向量数据库服务器...")
    
    server_file = Path("server/python_server.py")
    if not server_file.exists():
        print("❌ python_server.py 文件不存在")
        return False
    
    try:
        # 切换到server目录
        os.chdir("server")
        
        # 启动服务器
        subprocess.run([
            sys.executable, "python_server.py"
        ])
        
    except KeyboardInterrupt:
        print("\n🛑 服务器已停止")
    except Exception as e:
        print(f"❌ 启动服务器失败: {e}")
        return False
    
    return True

def main():
    """主函数"""
    print("🐍 Python向量数据库服务器启动器")
    print("=" * 50)
    
    # 检查Python版本
    if sys.version_info < (3, 8):
        print("❌ 需要Python 3.8或更高版本")
        return
    
    # 安装依赖
    if not install_requirements():
        print("❌ 依赖安装失败，无法启动服务器")
        return
    
    # 启动服务器
    start_python_server()

if __name__ == "__main__":
    main() 