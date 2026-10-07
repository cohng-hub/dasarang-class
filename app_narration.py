# -*- coding: utf-8 -*-
"""
Qwen3-TTS 로컬 음성 복제 나레이션 웹 스튜디오 (Gradio Web UI)
- 브라우저에서 마이크로 직접 10초 녹음하거나 reference.wav 파일 업로드
- 대본 입력 후 원클릭으로 내 목소리 MP3 나레이션 생성 및 즉시 청취/다운로드
- NVIDIA RTX 5060 Ti GPU 자동 가속
"""

import os
import sys
import time
import numpy as np
import soundfile as sf
import gradio as gr
import torch

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

DEFAULT_REF_TEXT = (
    "알람 소리만 들어도 온몸이 천근만근인 월요일 아침, 커피를 마셔도 뇌가 안 깨고, "
    "몸은 여전히 침대 속에 있는 기분이죠? 그럴 땐 딱 3초만 투자해 보세요. "
    "지친 몸에 활력을 즉시 깨워주는 단 한 모금의 힘, 오늘 하루도 가볍게 시작하세요! "
    "지금 바로 당신의 에너지를 충전하세요!"
)

DEFAULT_SCRIPT = (
    "글만 넣으면 내 목소리로 팟캐스트도 하고 콘텐츠도 만들면 좋겠는데,\n"
    "비용 때문에 망설이신 적 있으신가요?\n\n"
    "오늘은 나만의 음성 AI 모델에 제 목소리를 직접 학습시켜봤습니다.\n"
    "제미나이도 챗GPT도 아닙니다. 모델도 목소리도 결과물도 전부 제 것입니다."
)

_MODEL = None
_DEVICE = None


def get_model():
    global _MODEL, _DEVICE
    if _MODEL is None:
        from qwen_tts import Qwen3TTSModel
        if torch.cuda.is_available():
            try:
                # GPU 연산 검증
                t = torch.zeros(1, device="cuda") + 1
                _ = t.item()
                _DEVICE = "cuda:0"
                dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
                print(f"🚀 GPU 가속 활성화: {torch.cuda.get_device_name(0)}")
            except Exception as e:
                print(f"⚠️ GPU 연산 오류 ({e}) -> CPU 모드로 로드")
                _DEVICE = "cpu"
                dtype = torch.float32
        else:
            _DEVICE = "cpu"
            dtype = torch.float32

        print("📦 Qwen3-TTS 0.6B Base 모델 로드 중...")
        _MODEL = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-0.6B-Base",
            device_map=_DEVICE,
            dtype=dtype,
        )
        print("✅ 모델 준비 완료!")
    return _MODEL, _DEVICE


def generate_narration(ref_audio, ref_text, script_text, output_filename):
    if not ref_audio:
        return None, "❌ 참조 음성 파일(reference.wav 또는 마이크 녹음)을 업로드하거나 녹음해 주세요."

    clean_script = (script_text or "").strip()
    if not clean_script:
        return None, "❌ 생성할 대본 내용을 입력해 주세요."

    clean_ref_text = (ref_text or "").strip()
    if not clean_ref_text:
        clean_ref_text = DEFAULT_REF_TEXT

    out_name = (output_filename or "").strip()
    if not out_name:
        out_name = "output.mp3"
    if not (out_name.endswith(".mp3") or out_name.endswith(".wav")):
        out_name += ".mp3"

    model, device = get_model()

    print(f"\n🎙️ 나레이션 합성 시작...")
    print(f" - 참조 음성: {ref_audio}")
    print(f" - 대본 글자수: {len(clean_script)}자")
    start_t = time.time()

    try:
        wavs, sr = model.generate_voice_clone(
            text=clean_script,
            language="Korean",
            ref_audio=ref_audio,
            x_vector_only_mode=True,
        )
        elapsed = time.time() - start_t

        audio_data = wavs[0]
        # 노멀라이제이션 (피크 왜곡 방지)
        max_val = np.max(np.abs(audio_data))
        if max_val > 1.0:
            audio_data = audio_data / max_val * 0.95

        ext = os.path.splitext(out_name)[1].lower()
        fmt = "MP3" if ext == ".mp3" else "WAV"

        sf.write(out_name, audio_data, sr, format=fmt)
        duration = len(audio_data) / sr

        status_msg = (
            f"### 🎉 나레이션 생성 성공!\n"
            f"- **소요 시간:** {elapsed:.1f}초 (디바이스: `{device}`)\n"
            f"- **음성 길이:** {duration:.1f}초\n"
            f"- **저장된 파일:** `{os.path.abspath(out_name)}`\n"
            f"- 아래 오디오 플레이어에서 재생하거나 다운로드할 수 있습니다."
        )
        return out_name, status_msg
    except Exception as e:
        import traceback
        traceback.print_exc()
        return None, f"❌ 생성 실패: {str(e)}"


# Gradio 웹 UI 인터페이스 구성
custom_css = """
.container { max-width: 900px; margin: auto; padding: 20px; }
.main-title { text-align: center; color: #1E3A8A; font-weight: 800; font-size: 28px; margin-bottom: 8px; }
.sub-title { text-align: center; color: #4B5563; font-size: 15px; margin-bottom: 24px; }
.btn-generate { background: linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%) !important; color: white !important; font-size: 18px !important; font-weight: 700 !important; border-radius: 12px !important; padding: 14px !important; }
"""

with gr.Blocks(css=custom_css, title="Qwen3-TTS 내 목소리 나레이션 스튜디오") as demo:
    with gr.Column(elem_classes=["container"]):
        gr.Markdown(
            """
            <div class="main-title">🎙️ Qwen3-TTS 내 목소리 나레이션 생성 스튜디오</div>
            <div class="sub-title">10초 내 목소리(reference.wav)로 자연스러운 AI 나레이션 오디오(MP3)를 생성합니다.</div>
            """
        )

        with gr.Row():
            with gr.Column(scale=1):
                gr.Markdown("### 1️⃣ 내 목소리 준비 (참조 음성)")
                # 기본 reference.wav가 폴더에 있으면 기본값 지정
                default_audio = "reference.wav" if os.path.exists("reference.wav") else None
                ref_audio_input = gr.Audio(
                    value=default_audio,
                    sources=["upload", "microphone"],
                    type="filepath",
                    label="내 목소리 10초 파일 업로드 또는 즉시 녹음",
                )
                ref_text_input = gr.Textbox(
                    value=DEFAULT_REF_TEXT,
                    lines=4,
                    label="녹음할 때 읽은 대본 (참조 텍스트)",
                    placeholder="녹음할 때 발음한 내용을 그대로 적어주세요.",
                )

            with gr.Column(scale=1):
                gr.Markdown("### 2️⃣ 나레이션 대본 입력")
                script_input = gr.Textbox(
                    value=DEFAULT_SCRIPT,
                    lines=8,
                    label="내 목소리로 읽을 대본",
                    placeholder="여기에 나레이션으로 만들고 싶은 글이나 동화책 문장을 입력하세요.",
                )
                output_name_input = gr.Textbox(
                    value="output.mp3",
                    label="저장할 MP3 파일명",
                )

        btn_generate = gr.Button("🎧 내 목소리로 MP3 나레이션 생성하기", elem_classes=["btn-generate"])

        gr.Markdown("### 3️⃣ 생성 결과")
        result_audio = gr.Audio(label="생성된 나레이션 음성 (MP3)", type="filepath")
        status_md = gr.Markdown()

        btn_generate.click(
            fn=generate_narration,
            inputs=[ref_audio_input, ref_text_input, script_input, output_name_input],
            outputs=[result_audio, status_md],
        )

if __name__ == "__main__":
    # 초기 모델 백그라운드 프리로드
    try:
        get_model()
    except Exception as e:
        print("초기 모델 로드 대기 중 (실행 시 로드):", e)
    demo.launch(server_name="127.0.0.1", server_port=7860, share=False)
