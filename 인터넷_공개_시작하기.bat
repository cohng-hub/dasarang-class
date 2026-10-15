@echo off
chcp 65001 > nul
title 해솔반 나만의 그림책 만들기 - 인터넷 공개 서버
echo ========================================================
echo   🌟 해솔반 나만의 그림책 만들기 - 어디서나 접속 서버 🌟
echo ========================================================
echo.
echo [1/3] AI 음성 및 누끼 서버 실행 중...
start /b python qwen_tts_server.py > nul 2>&1

echo [2/3] 웹 서비스 실행 중...
start /b npm run dev > nul 2>&1

echo [3/3] 전 세계 어디서나 접속 가능한 인터넷 보안 링크 생성 중...
echo (잠시만 기다려 주세요...)
echo.

"%~dp0tools\cloudflared.exe" tunnel --url http://localhost:5173
pause
