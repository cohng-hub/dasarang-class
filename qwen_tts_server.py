# -*- coding: utf-8 -*-
"""
Qwen3-TTS 로컬 FastAPI 서버
- 유치원 그림책 웹앱 및 로컬 브라우저와 실시간 연동
- 내 목소리(reference.wav 또는 녹음) 등록 및 페이지별 동화책 낭독 스트리밍
"""

import io
import os
import sys
import time
import numpy as np
import soundfile as sf
import torch
from PIL import Image
from rembg import remove, new_session
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse
from pydantic import BaseModel

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

app = FastAPI(title="Qwen3-TTS Local Server")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_MODEL = None
_DEVICE = "cpu"
_SAVED_VOICE_PATH = "reference.wav"
_SAVED_REF_TEXT = (
    "어느 화창한 아침, 밝은미소 해솔반 김나연이 길을 나섰어요. "
    "살랑살랑 부는 바람을 맞으며 무지개 피어난 초록 숲속으로 씩씩하게 걸어갔답니다."
)

_REMBG_SESSION = None

def get_rembg_session():
    global _REMBG_SESSION
    if _REMBG_SESSION is None:
        try:
            print("🚀 rembg u2netp 초고속 세션 로드 중...")
            _REMBG_SESSION = new_session("u2netp")
            print("✅ rembg u2netp 준비 완료!")
        except Exception as e:
            print(f"⚠️ u2netp 로드 실패 ({e}) -> 기본 세션 사용")
            _REMBG_SESSION = new_session()
    return _REMBG_SESSION


def load_model():
    global _MODEL, _DEVICE
    if _MODEL is None:
        from qwen_tts import Qwen3TTSModel
        if torch.cuda.is_available():
            try:
                t = torch.zeros(1, device="cuda") + 1
                _ = t.item()
                _DEVICE = "cuda:0"
                dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
                print(f"🚀 GPU 가속 활성화: {torch.cuda.get_device_name(0)}")
            except Exception as e:
                print(f"⚠️ GPU 오류 ({e}) -> CPU 모드로 실행")
                _DEVICE = "cpu"
                dtype = torch.float32
        else:
            _DEVICE = "cpu"
            dtype = torch.float32

        print("📦 Qwen3-TTS 모델 로드 중...")
        _MODEL = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-0.6B-Base",
            device_map=_DEVICE,
            dtype=dtype,
        )
        print("✅ 모델 준비 완료!")
    return _MODEL, _DEVICE


class VoiceCloneRequest(BaseModel):
    text: str
    language: str = "Korean"
    ref_text: str = None


@app.get("/api/health")
def health():
    has_voice = os.path.exists(_SAVED_VOICE_PATH)
    return {
        "status": "ok",
        "device": _DEVICE,
        "gpu_name": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "None",
        "has_voice": has_voice,
        "ref_audio": _SAVED_VOICE_PATH if has_voice else None,
    }


def convert_to_pcm_wav(raw_bytes, dst_wav_path):
    temp_path = "temp_uploaded_voice_raw"
    with open(temp_path, "wb") as f:
        f.write(raw_bytes)
    try:
        # 1. soundfile 직접 읽기 시도
        data, sr = sf.read(temp_path)
        sf.write(dst_wav_path, data, sr, subtype="PCM_16")
    except Exception:
        # 2. m4a, mp3, aac 등 컨테이너는 PyAV로 디코딩
        import av
        with av.open(temp_path) as container:
            frames = [f.to_ndarray() for f in container.decode(audio=0)]
            sr = container.streams.audio[0].sample_rate
        if not frames:
            raise ValueError("오디오 프레임을 디코딩할 수 없습니다.")
        audio = np.concatenate(frames, axis=1)
        audio = np.mean(audio, axis=0) if audio.shape[0] > 1 else audio[0]
        max_val = np.max(np.abs(audio))
        if max_val > 1.0:
            audio = audio / max_val * 0.95
        sf.write(dst_wav_path, audio, sr, subtype="PCM_16")
    finally:
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception:
                pass


@app.post("/api/register-voice")
async def register_voice(
    audio_file: UploadFile = File(...),
    ref_text: str = Form(None)
):
    global _SAVED_REF_TEXT
    try:
        content = await audio_file.read()
        convert_to_pcm_wav(content, _SAVED_VOICE_PATH)
        
        if ref_text and ref_text.strip():
            _SAVED_REF_TEXT = ref_text.strip()
            with open("reference_text.txt", "w", encoding="utf-8") as f:
                f.write(_SAVED_REF_TEXT)

        return {
            "success": True,
            "message": "내 목소리가 성공적으로 등록되었습니다!",
            "file_size": len(content),
            "ref_text": _SAVED_REF_TEXT
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/remove-bg")
async def remove_bg(image_file: UploadFile = File(...)):
    try:
        content = await image_file.read()
        input_image = Image.open(io.BytesIO(content)).convert("RGBA")
        # 512px로 다운스케일하여 0.16초만에 초고속 배경 제거 (동화책 해상도로 선명)
        max_size = 512
        if max(input_image.size) > max_size:
            input_image.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
        t0 = time.time()
        session = get_rembg_session()
        output_image = remove(input_image, session=session)
        print(f"✨ AI 배경 제거(누끼) 완료 ({time.time() - t0:.2f}초, 해상도: {output_image.size})")
        buf = io.BytesIO()
        output_image.save(buf, format="PNG")
        return Response(content=buf.getvalue(), media_type="image/png")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/child-tts")
async def child_tts(req: VoiceCloneRequest):
    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="텍스트가 비어 있습니다.")
    import edge_tts
    # 맑고 경쾌한 6~7세 어린이 동화 구연 목소리 (SunHi Neural, +38Hz, +8%)
    clean_text = text.replace('"', '').replace("'", "").replace("\n", ", ")
    t0 = time.time()
    communicate = edge_tts.Communicate(clean_text, "ko-KR-SunHiNeural", pitch="+38Hz", rate="+8%")
    audio_bytes = bytearray()
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_bytes.extend(chunk["data"])
    print(f"👧 어린이 목소리 생성 완료 ({time.time() - t0:.2f}초, {len(audio_bytes)} 바이트)")
    return Response(content=bytes(audio_bytes), media_type="audio/mpeg")


@app.post("/api/voice-clone")
def voice_clone(req: VoiceCloneRequest):
    global _SAVED_REF_TEXT
    if not os.path.exists(_SAVED_VOICE_PATH):
        raise HTTPException(status_code=400, detail="등록된 목소리(reference.wav)가 없습니다. 먼저 목소리를 등록해 주세요.")

    text = req.text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="텍스트가 비어 있습니다.")

    # 1. 만약 요청된 텍스트가 등록된 대본과 실질적으로 일치하면 즉시 원본 오디오 반환 (0초 지연)
    norm_req = "".join(text.split())
    norm_ref = "".join(_SAVED_REF_TEXT.split())
    if norm_req and (norm_req == norm_ref or norm_req in norm_ref or norm_ref in norm_req):
        print("⚡ 원본 녹음 대본과 일치 -> 즉각적인 무지연 오디오 반환!")
        with open(_SAVED_VOICE_PATH, "rb") as f:
            return Response(content=f.read(), media_type="audio/wav")

    ref_text = req.ref_text.strip() if req.ref_text else _SAVED_REF_TEXT
    model, device = load_model()

    # reference.wav가 m4a나 기타 포맷인 경우 자동 감지하여 PCM WAV로 즉시 변환/복구
    try:
        sf.info(_SAVED_VOICE_PATH)
    except Exception:
        print(f"⚠️ {_SAVED_VOICE_PATH} 포맷 복구 진행 중...")
        try:
            with open(_SAVED_VOICE_PATH, "rb") as f:
                raw_b = f.read()
            convert_to_pcm_wav(raw_b, _SAVED_VOICE_PATH)
            print("✅ 복구 완료!")
        except Exception as conv_err:
            print("복구 실패:", conv_err)

    try:
        t0 = time.time()
        wavs, sr = model.generate_voice_clone(
            text=text,
            language=req.language,
            ref_audio=_SAVED_VOICE_PATH,
            x_vector_only_mode=True,
        )
        audio_data = wavs[0]
        max_val = np.max(np.abs(audio_data))
        if max_val > 1.0:
            audio_data = audio_data / max_val * 0.95

        buf = io.BytesIO()
        sf.write(buf, audio_data, sr, format="WAV")
        buf.seek(0)

        elapsed = time.time() - t0
        print(f"🎙️ 음성 합성 완료 ({elapsed:.1f}초, 디바이스: {device})")

        return Response(content=buf.getvalue(), media_type="audio/wav")
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    load_model()
    get_rembg_session()
    uvicorn.run(app, host="0.0.0.0", port=8000)
