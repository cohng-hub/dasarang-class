@echo off
chcp 65001 > nul
title Qwen3-TTS 내 목소리 나레이션 스튜디오 (Web)
cd /d "%~dp0"

echo ========================================================
echo   🎙️ Qwen3-TTS 나레이션 웹 스튜디오 시작 중...
echo ========================================================
echo.
echo 브라우저에서 편리하게 마이크 녹음 및 파일 업로드,
echo 대본 입력 후 바로 MP3를 생성 및 다운로드할 수 있습니다.
echo.
echo 잠시 후 브라우저가 열립니다 (http://127.0.0.1:7860)
echo.

start "" "http://127.0.0.1:7860"
python app_narration.py

pause > nul
