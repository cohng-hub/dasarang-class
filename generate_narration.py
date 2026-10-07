# -*- coding: utf-8 -*-
"""
Qwen3-TTS 로컬 음성 복제 나레이션 생성기
- 참조 음성(reference.wav)을 사용하여 내 목소리로 나레이션 생성
- 생성 결과를 고음질 MP3로 자동 저장
"""

import os
import sys
import time
import argparse
import numpy as np

# Windows 콘솔 인코딩 UTF-8 설정
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


def detect_optimal_device():
    """
    GPU 및 CUDA 호환성을 자동으로 감지하여 최적의 디바이스와 dtype을 반환합니다.
    (RTX 50-series sm_120 호환 여부 사전 검증 포함)
    """
    import torch

    if not torch.cuda.is_available():
        print("💡 CUDA GPU를 찾을 수 없어 CPU 모드로 실행합니다.")
        return "cpu", torch.float32

    try:
        # CUDA 연산 정상 수행 가능 여부 테스트 (sm_120 커널 미지원 예외 방지)
        test_t = torch.zeros(2, 2, device="cuda")
        _ = (test_t + 1).sum().item()
        
        gpu_name = torch.cuda.get_device_name(0)
        dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else torch.float16
        print(f"🚀 GPU 가속 활성화: {gpu_name} (dtype: {dtype})")
        return "cuda:0", dtype
    except Exception as e:
        print(f"⚠️ GPU 연산 오류 ({e}) -> 안전하게 CPU 모드로 전환합니다.")
        return "cpu", torch.float32


def load_tts_model(model_name="Qwen/Qwen3-TTS-12Hz-0.6B-Base"):
    """
    Qwen3-TTS 0.6B Base 모델을 로드합니다.
    """
    import torch
    from qwen_tts import Qwen3TTSModel

    device, dtype = detect_optimal_device()
    print(f"📦 Qwen3-TTS 모델 불러오는 중... ({model_name})")
    start_t = time.time()
    
    model = Qwen3TTSModel.from_pretrained(
        model_name,
        device_map=device,
        dtype=dtype,
    )
    print(f"✅ 모델 로드 완료! (소요 시간: {time.time() - start_t:.1f}초)")
    return model, device


def generate_speech(
    model,
    text,
    ref_audio="reference.wav",
    ref_text=DEFAULT_REF_TEXT,
    output_path="output.mp3",
    language="Korean",
):
    """
    참조 음성을 바탕으로 대본 텍스트를 음성으로 복제 생성하고 MP3로 저장합니다.
    """
    import soundfile as sf

    if not os.path.exists(ref_audio):
        raise FileNotFoundError(
            f"참조 음성 파일 '{ref_audio}'을(를) 찾을 수 없습니다.\n"
            f"현재 폴더에 10초 내외의 녹음 파일({ref_audio})을 넣어주세요."
        )

    clean_text = text.strip()
    if not clean_text:
        raise ValueError("생성할 대본 내용이 비어 있습니다.")

    print(f"\n🎙️ [음성 합성 시작]")
    print(f" • 참조 음성: {ref_audio}")
    print(f" • 대본 글자 수: {len(clean_text)}자")
    print(f" • 저장 경로: {output_path}")

    start_t = time.time()
    wavs, sr = model.generate_voice_clone(
        text=clean_text,
        language=language,
        ref_audio=ref_audio,
        x_vector_only_mode=True,
    )
    gen_time = time.time() - start_t

    # 오디오 데이터 추출 및 볼륨 정규화 (클리핑 방지)
    audio_data = wavs[0]
    max_val = np.max(np.abs(audio_data))
    if max_val > 1.0:
        audio_data = audio_data / max_val * 0.95

    # 출력 확장자에 맞춰 저장 (기본 MP3)
    ext = os.path.splitext(output_path)[1].lower()
    fmt = "MP3" if ext == ".mp3" else "WAV"
    
    sf.write(output_path, audio_data, sr, format=fmt)
    duration_sec = len(audio_data) / sr

    print(f"🎉 음성 생성 및 저장 완료!")
    print(f" • 생성된 음성 길이: {duration_sec:.1f}초")
    print(f" • 합성 소요 시간: {gen_time:.1f}초")
    print(f" • 파일 크기: {os.path.getsize(output_path):,} bytes")
    print(f" • 저장된 파일: {os.path.abspath(output_path)}\n")

    return output_path


def main():
    parser = argparse.ArgumentParser(description="Qwen3-TTS 로컬 음성 복제 나레이션 생성기")
    parser.add_argument("--ref_audio", "-r", default="reference.wav", help="참조 음성 파일 경로 (기본: reference.wav)")
    parser.add_argument("--ref_text", default=DEFAULT_REF_TEXT, help="참조 음성 녹음 대본")
    parser.add_argument("--text", "-t", default=None, help="생성할 나레이션 대본 텍스트")
    parser.add_argument("--file", "-f", default=None, help="대본이 적힌 텍스트 파일 (.txt)")
    parser.add_argument("--output", "-o", default="output.mp3", help="출력 파일 경로 (기본: output.mp3)")
    parser.add_argument("--language", "-l", default="Korean", help="언어 (기본: Korean)")
    args = parser.parse_args()

    # 1. 대본 텍스트 확보
    text_content = args.text
    if not text_content and args.file and os.path.exists(args.file):
        with open(args.file, "r", encoding="utf-8") as f:
            text_content = f.read()

    # 파일 및 인자 둘 다 없으면 script.txt 탐색
    if not text_content and os.path.exists("script.txt"):
        print("📄 'script.txt' 파일을 발견하여 대본으로 사용합니다.")
        with open("script.txt", "r", encoding="utf-8") as f:
            text_content = f.read()

    # 아무것도 없으면 기본 대본 사용 및 script.txt 생성
    if not text_content:
        text_content = DEFAULT_SCRIPT
        if not os.path.exists("script.txt"):
            with open("script.txt", "w", encoding="utf-8") as f:
                f.write(DEFAULT_SCRIPT)
            print("📝 'script.txt' 예시 대본 파일이 생성되었습니다. 원하는 내용으로 수정해 보세요.")

    # 2. 참조 음성 파일 확인
    ref_audio = args.ref_audio
    if not os.path.exists(ref_audio):
        # 혹시 '내목소리.wav' 또는 다른 wav 파일이 있는지 탐색
        fallback_candidates = ["내목소리.wav", "my_voice.wav", "voice.wav"]
        found = False
        for cand in fallback_candidates:
            if os.path.exists(cand):
                ref_audio = cand
                found = True
                print(f"💡 '{cand}' 파일을 참조 음성으로 자동 지정했습니다.")
                break
        
        if not found:
            print(f"\n❌ 오류: 참조 음성 '{ref_audio}' 파일이 존재하지 않습니다.")
            print(f"👉 10초 내외의 녹음 파일을 '{os.path.abspath(ref_audio)}' 로 넣어주시거나,")
            print(f"   python generate_narration.py --ref_audio <파일명.wav> 옵션을 지정해 주세요.\n")
            sys.exit(1)

    # 3. 모델 로드 및 생성
    model, device = load_tts_model()
    generate_speech(
        model=model,
        text=text_content,
        ref_audio=ref_audio,
        ref_text=args.ref_text,
        output_path=args.output,
        language=args.language,
    )


if __name__ == "__main__":
    main()
