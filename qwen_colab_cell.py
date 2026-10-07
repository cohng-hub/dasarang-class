# ==============================================================================
# 🎈 [구글 코랩 실행용] 나만의 그림책 - Qwen3-TTS 부모님 목소리 복제 1-클릭 서버
# ==============================================================================
# 이 코드를 구글 코랩(Google Colab)의 코드 셀에 붙여넣고 [GPU T4] 환경에서 실행하세요!
# 실행 후 나오는 [Public URL: https://xxxx.gradio.live] 주소를 복사하여
# 그림책 웹사이트의 [🎙️ 목소리 복제 설정]에 넣으시면 연동이 완료됩니다!
# ==============================================================================

!pip install -q -U qwen-tts soundfile fastapi uvicorn python-multipart gradio nest-asyncio

import torch
assert torch.cuda.is_available(), "🚨 상단 메뉴 [런타임] -> [런타임 유형 변경]에서 GPU (T4 이상)를 켜주세요!"

import io
import os
import tempfile
import soundfile as sf
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
import gradio as gr

app = FastAPI(title="Qwen3-TTS Picture Book Voice Clone API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
print("⏳ Qwen3-TTS 모델 로딩 중... (최초 1회 약 30~50초 소요)")
from qwen_tts import Qwen3TTSModel
model = Qwen3TTSModel.from_pretrained("Qwen/Qwen3-TTS-12Hz-0.6B-Base", device_map="cuda:0", dtype=dtype)
print("✅ Qwen3-TTS 모델 로드 완료!")

CURRENT_REF_AUDIO = None
CURRENT_REF_TEXT = None

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "has_voice": CURRENT_REF_AUDIO is not None and os.path.exists(CURRENT_REF_AUDIO),
        "ref_text": CURRENT_REF_TEXT,
        "device": "cuda:0"
    }

@app.post("/api/register-voice")
async def register_voice(audio_file: UploadFile = File(...), ref_text: str = Form(...)):
    global CURRENT_REF_AUDIO, CURRENT_REF_TEXT
    save_path = os.path.join(tempfile.gettempdir(), "parent_voice.wav")
    contents = await audio_file.read()
    with open(save_path, "wb") as f:
        f.write(contents)
    CURRENT_REF_AUDIO = save_path
    CURRENT_REF_TEXT = ref_text.strip()
    print(f"🎙️ 목소리 등록 완료! 텍스트: {CURRENT_REF_TEXT[:30]}...")
    return {"success": True, "message": "목소리가 성공적으로 등록되었습니다!"}

class CloneReq(BaseModel):
    text: str
    language: str = "Korean"

@app.post("/api/voice-clone")
async def voice_clone(req: CloneReq):
    global CURRENT_REF_AUDIO, CURRENT_REF_TEXT
    if not CURRENT_REF_AUDIO or not os.path.exists(CURRENT_REF_AUDIO):
        raise HTTPException(status_code=400, detail="등록된 목소리(ref_audio)가 없습니다. 먼저 목소리를 등록해주세요.")
    
    print(f"🔊 음성 합성 시작: {req.text[:40]}...")
    wavs, sr = model.generate_voice_clone(
        text=req.text,
        language=req.language or "Korean",
        ref_audio=CURRENT_REF_AUDIO,
        ref_text=CURRENT_REF_TEXT
    )
    buf = io.BytesIO()
    sf.write(buf, wavs[0], sr, format="WAV")
    buf.seek(0)
    print("✅ 음성 합성 완료 및 전송!")
    return Response(content=buf.read(), media_type="audio/wav")

# Gradio 공용 터널 생성 및 FastAPI 마운트
with gr.Blocks(title="Qwen3-TTS 그림책 목소리 복제 서버") as demo:
    gr.Markdown("## 🎉 Qwen3-TTS 목소리 복제 서버가 정상 동작 중입니다!")
    gr.Markdown("아래 표시되는 **Public URL (https://xxxx.gradio.live)** 주소를 복사하여 그림책 사이트의 **[🎙️ AI 목소리 복제 설정]** 창에 입력하세요.")

app = gr.mount_gradio_app(app, demo, path="/ui")
demo.launch(share=True)
