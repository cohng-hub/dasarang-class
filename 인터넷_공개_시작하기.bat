@echo off
chcp 65001 > nul
title 해솔반 나만의 그림책 만들기 - 영구 고정 인터넷 서버
echo ========================================================
echo   🌟 해솔반 나만의 그림책 만들기 - 어디서나 접속 서버 🌟
echo ========================================================
echo.
echo [1/3] AI 음성 및 누끼 서버 실행 중...
start /b python qwen_tts_server.py > nul 2>&1

echo [2/3] 웹 서비스 실행 중...
start /b npm run dev > nul 2>&1

echo.
echo ========================================================
echo   📌 영구 고정 접속 주소: https://dasarang-class.loca.lt
echo   (언제 어디서나, 내일도 주소가 절대 바뀌지 않습니다)
echo ========================================================
echo.
echo [3/3] 영구 고정 보안 터널 연결 중...
echo.

:LOOP
npx -y localtunnel --port 5173 --subdomain dasarang-class --local-host 127.0.0.1
echo ⚠️ 터널 재연결 중... (2초 후 재시도)
timeout /t 2 /nobreak > nul
goto LOOP

