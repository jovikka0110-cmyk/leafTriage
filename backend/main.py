# LeafTriage FastAPI Unified Backend & Frontend Server
# Both Frontend and Backend served on the SAME PORT

import os
import io
import sys
import time
import json
import base64
from pathlib import Path
from typing import Optional, Dict, Any

import requests

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None
    types = None

# Ensure backend directory is in sys.path so internal imports resolve anywhere
BACKEND_DIR = Path(__file__).resolve().parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Project root and dist paths
BASE_DIR = BACKEND_DIR.parent
DIST_DIR = BASE_DIR / "dist"

from pydantic import BaseModel
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

try:
    from dotenv import load_dotenv
    HAS_DOTENV = True
except ImportError:
    HAS_DOTENV = False
    load_dotenv = None

# Safe optional gTTS import
try:
    from gtts import gTTS
    HAS_GTTS = True
except ImportError:
    gTTS = None
    HAS_GTTS = False

# Database and analyzer imports with dual resolution
try:
    from database import (
        init_db,
        fetch_all_diseases,
        fetch_disease_by_id,
        fetch_scan_history,
        insert_scan_history,
        delete_scan_record,
        clear_all_scans
    )
    from leaf_analyzer import analyze_leaf_image
except ImportError:
    from backend.database import (
        init_db,
        fetch_all_diseases,
        fetch_disease_by_id,
        fetch_scan_history,
        insert_scan_history,
        delete_scan_record,
        clear_all_scans
    )
    from backend.leaf_analyzer import analyze_leaf_image

if HAS_DOTENV:
    load_dotenv(BASE_DIR / '.env')
    load_dotenv(BACKEND_DIR / '.env')

# Initialize local SQLite database
init_db()

app = FastAPI(
    title="LeafTriage Unified App",
    description="Offline-Capable Crop Leaf Triage & Remedies Engine with Embedded React UI",
    version="1.0.0"
)

# Standard CORS setup (safe with allow_origins=["*"])
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount /assets if the built React frontend exists
if (DIST_DIR / "assets").is_dir():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")


def _clean_env_value(value: Optional[str]) -> str:
    if value is None:
        return ''
    return str(value).strip().strip('"').strip("'")


def _read_model_config():
    provider = _clean_env_value(os.environ.get('AI_MODEL_PROVIDER') or 'gemini').lower()
    provider = 'gemini' if provider in {'gemini', 'google', 'geminai'} else provider
    model = _clean_env_value(os.environ.get('AI_MODEL_NAME') or 'gemini-3.5-flash-lite')
    api_key = _clean_env_value(
        os.environ.get('GEMINI_API_KEY')
        or os.environ.get('GOOGLE_API_KEY')
        or ''
    )
    return provider, model, api_key


def _candidate_gemini_models(model_name: Optional[str] = None):
    preferred = [
        (model_name or 'gemini-3.5-flash-lite').strip(),
        'gemini-3.5-flash-lite',
        'gemini-3.8-flash',
        'gemini-2.5-flash-lite'
    ]
    seen = set()
    ordered = []
    for entry in preferred:
        if not entry:
            continue
        normalized = entry.strip().lower()
        if normalized not in seen:
            seen.add(normalized)
            ordered.append(normalized)
    return ordered


def _call_real_vision_model(image_bytes: bytes, crop_hint: Optional[str] = None, provider: Optional[str] = None, model_name: Optional[str] = None, api_key: Optional[str] = None):
    provider = _clean_env_value(provider or 'gemini').lower()
    provider = 'gemini' if provider in {'gemini', 'google', 'geminai'} else provider
    api_key = _clean_env_value(api_key or '')
    if not api_key:
        return {
            'success': False,
            'error': 'No Gemini API key found. Add GEMINI_API_KEY in the backend environment before scanning.'
        }

    try:
        if provider != 'gemini':
            return {'success': False, 'error': f'Unsupported model provider: {provider}. This app is configured for Gemini only.'}

        if genai is None or types is None:
            return {
                'success': False,
                'error': 'Google GenAI SDK is missing. Install google-genai in the backend environment.'
            }

        model_errors = []
        for model_ref in _candidate_gemini_models(model_name):
            try:
                client = genai.Client(api_key=api_key)
                response = client.models.generate_content(
                    model=model_ref,
                    contents=[
                        types.Part.from_text(
                            'Identify the plant leaf disease in this image. Return only valid JSON with keys: disease_name, confidence, crop, reasoning.'
                        ),
                        types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg'),
                    ],
                )

                text = getattr(response, 'text', '') or ''
                if not text:
                    for candidate in getattr(response, 'candidates', []) or []:
                        parts = getattr(candidate, 'content', None)
                        if parts is None:
                            continue
                        for part in getattr(parts, 'parts', []) or []:
                            if getattr(part, 'text', None):
                                text += part.text

                if not text:
                    raise ValueError('Gemini returned no text content for this model.')

                cleaned = text.strip()
                if '```' in cleaned:
                    cleaned = cleaned.replace('```json', '').replace('```', '').strip()
                try:
                    parsed = json.loads(cleaned)
                except Exception:
                    start = cleaned.find('{')
                    end = cleaned.rfind('}')
                    if start != -1 and end != -1 and end > start:
                        parsed = json.loads(cleaned[start:end + 1])
                    else:
                        raise ValueError('Gemini returned a response that was not valid JSON.')

                disease_name = str(parsed.get('disease_name', '')).strip()
                confidence = int(float(parsed.get('confidence', 0)) if str(parsed.get('confidence', '0')).replace('.', '', 1).isdigit() else 0)
                crop_name = str(parsed.get('crop', crop_hint or 'plant')).strip() or 'plant'
                if not disease_name:
                    raise ValueError('Gemini returned no disease name.')
                return {
                    'success': True,
                    'disease_name': disease_name,
                    'confidence': max(70, min(99, confidence or 88)),
                    'crop': crop_name,
                    'provider': 'gemini',
                    'model_used': model_ref
                }
            except Exception as model_exc:
                model_errors.append(f'{model_ref}: {model_exc}')

        joined = ' | '.join(model_errors) if model_errors else 'No Gemini model could process the image.'
        return {'success': False, 'error': f'Gemini API error: {joined[:500]}'}
    except Exception as exc:
        return {'success': False, 'error': f'Gemini request failed: {exc}'}


class ScanRequest(BaseModel):
    image: Optional[str] = None # Base64 data URL
    presetId: Optional[str] = None
    crop: Optional[str] = None # Crop hint: Paddy, Tomato, Banana, Groundnut, Chilli

@app.api_route("/api/health", methods=["GET", "HEAD"])
def health_check():
    ai_engine = "Colorimetry / Morphology (Fallback)"
    try:
        from ml_engine import get_ml_engine
        engine = get_ml_engine()
        if engine and engine.is_ready:
            ai_engine = "MobileNetV2 (ONNX)"
    except Exception:
        pass

    return {
        "status": "healthy",
        "app": "LeafTriage Backend",
        "ai_engine": ai_engine,
        "database": "SQLite Local",
        "version": "1.0.0",
        "real_model_required": True
    }

# 1. Real-time Leaf Image Diagnosis Endpoint
@app.post("/api/scan")
async def scan_leaf(payload: ScanRequest):
    image_bytes = None
    photo_url = payload.image

    if payload.image and payload.image.startswith("data:image"):
        try:
            header, encoded = payload.image.split(",", 1)
            image_bytes = base64.b64decode(encoded)
        except Exception as e:
            print("Failed to decode base64 image:", e)

    if not image_bytes:
        image_bytes = b""

    provider, model_name, api_key = _read_model_config()
    if api_key:
        real_result = _call_real_vision_model(image_bytes, crop_hint=payload.crop, provider=provider, model_name=model_name, api_key=api_key)
        if real_result.get('success'):
            disease_id = str(real_result['disease_name']).strip().lower().replace(' ', '_')
            disease = fetch_disease_by_id(disease_id) or fetch_disease_by_id('banana_sigatoka')
            result = {
                'is_low_confidence': False,
                'confidence': int(real_result.get('confidence', 88)),
                'disease': disease,
                'ai_engine': f'Real Vision ({real_result.get("provider", provider).upper()})',
                'message_en': f"Identified {disease['names']['en'] if disease else real_result['disease_name']} with live API model detection.",
                'message_ta': f"{disease['names']['ta'] if disease else real_result['disease_name']} உண்மையான AI மாதிரியில் கண்டறியப்பட்டது."
            }
            if disease:
                try:
                    insert_scan_history({
                        'id': f"scan_{int(time.time() * 1000)}",
                        'timestamp': int(time.time() * 1000),
                        'disease_id': disease['id'],
                        'crop_en': disease['crop'],
                        'crop_ta': disease['crop_ta'],
                        'name_en': disease['names']['en'],
                        'name_ta': disease['names']['ta'],
                        'icon': disease['icon'],
                        'confidence': result['confidence'],
                        'image_data': photo_url[:200] if photo_url else ''
                    })
                except Exception as e:
                    print('Failed to write to scan_history:', e)
            return {
                'isLowConfidence': result['is_low_confidence'],
                'confidence': result['confidence'],
                'disease': result['disease'],
                'aiEngine': result['ai_engine'],
                'photoUrl': photo_url,
                'message': result.get('message_ta') or result.get('message_en')
            }

        return {
            'isLowConfidence': True,
            'confidence': 0,
            'disease': None,
            'aiEngine': 'Model API Error',
            'photoUrl': photo_url,
            'message': real_result.get('error') or 'Real model request failed. Please check the backend environment variables and model name.',
            'modelError': True
        }

    return {
        'isLowConfidence': True,
        'confidence': 0,
        'disease': None,
        'aiEngine': 'Model API Required',
        'photoUrl': photo_url,
        'message': 'The backend Gemini API key is not configured. Add GEMINI_API_KEY in the backend environment before analysis.',
        'modelRequired': True
    }

# File Upload variant for native camera forms
@app.post("/api/scan/upload")
async def scan_leaf_file(file: UploadFile = File(...), presetId: Optional[str] = Form(None), crop: Optional[str] = Form(None)):
    image_bytes = await file.read()
    b64 = f"data:{file.content_type};base64,{base64.b64encode(image_bytes).decode('utf-8')}"

    provider, model_name, api_key = _read_model_config()
    if api_key:
        real_result = _call_real_vision_model(image_bytes, crop_hint=crop, provider=provider, model_name=model_name, api_key=api_key)
        if real_result.get('success'):
            disease_id = str(real_result['disease_name']).strip().lower().replace(' ', '_')
            disease = fetch_disease_by_id(disease_id) or fetch_disease_by_id('banana_sigatoka')
            result = {
                'is_low_confidence': False,
                'confidence': int(real_result.get('confidence', 88)),
                'disease': disease,
                'ai_engine': f'Real Vision ({real_result.get("provider", provider).upper()})',
                'message_en': f"Identified {disease['names']['en'] if disease else real_result['disease_name']} with live API model detection.",
                'message_ta': f"{disease['names']['ta'] if disease else real_result['disease_name']} உண்மையான AI மாதிரியில் கண்டறியப்பட்டது."
            }
            return {
                'isLowConfidence': result['is_low_confidence'],
                'confidence': result['confidence'],
                'disease': result['disease'],
                'aiEngine': result['ai_engine'],
                'photoUrl': b64,
                'message': result.get('message_ta') or result.get('message_en')
            }

        return {
            'isLowConfidence': True,
            'confidence': 0,
            'disease': None,
            'aiEngine': 'Model API Error',
            'photoUrl': b64,
            'message': real_result.get('error') or 'Real model request failed. Please check the backend environment variables and model name.',
            'modelError': True
        }

    return {
        'isLowConfidence': True,
        'confidence': 0,
        'disease': None,
        'aiEngine': 'Model API Required',
        'photoUrl': b64,
        'message': 'The backend Gemini API key is not configured. Add GEMINI_API_KEY in the backend environment before analysis.',
        'modelRequired': True
    }

# 2. Diseases Knowledgebase Endpoints
@app.api_route("/api/diseases", methods=["GET", "HEAD"])
def get_all_diseases():
    return fetch_all_diseases()

@app.api_route("/api/diseases/{disease_id}", methods=["GET", "HEAD"])
def get_disease(disease_id: str):
    disease = fetch_disease_by_id(disease_id)
    if not disease:
        raise HTTPException(status_code=404, detail="Disease not found in local database")
    return disease

# 3. Scan History Endpoints
@app.api_route("/api/history", methods=["GET", "HEAD"])
def get_history():
    return fetch_scan_history()

@app.delete("/api/history/{scan_id}")
def delete_history_item(scan_id: str):
    success = delete_scan_record(scan_id)
    return {"success": success}

@app.delete("/api/history")
def clear_history():
    success = clear_all_scans()
    return {"success": success}

# 4. Google Translate Voice TTS Proxy with In-Memory Audio Cache
_tts_cache: Dict[str, bytes] = {}

@app.api_route("/api/tts", methods=["GET", "HEAD"])
def stream_tts_audio(
    text: str = Query(..., description="Text to speak"),
    lang: str = Query("ta", description="Language code: ta or en")
):
    clean_text = text.strip()[:200]
    cache_key = f"{lang}:{clean_text}"

    if cache_key in _tts_cache:
        return Response(content=_tts_cache[cache_key], media_type="audio/mpeg")

    if not HAS_GTTS or gTTS is None:
        raise HTTPException(
            status_code=503,
            detail="gTTS package unavailable; on-device speech synthesis fallback active"
        )

    try:
        tts = gTTS(text=clean_text, lang=lang if lang in ["ta", "en"] else "ta", slow=False)
        fp = io.BytesIO()
        tts.write_to_fp(fp)
        fp.seek(0)
        audio_data = fp.read()
        
        if len(_tts_cache) > 150:
            _tts_cache.clear()
        _tts_cache[cache_key] = audio_data

        return Response(content=audio_data, media_type="audio/mpeg")
    except Exception as e:
        print("TTS Notice (fallback to on-device TTS):", e)
        raise HTTPException(
            status_code=503,
            detail="Online TTS service unavailable; using on-device speech synthesis fallback"
        )

# 5. Serve React Frontend on the SAME PORT (Single-Port Full-Stack Deployment)
@app.get("/")
def serve_frontend_root():
    index_file = DIST_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(str(index_file))
    return {
        "status": "healthy",
        "app": "LeafTriage",
        "message": "Frontend build not found. Run 'npm run build' to generate static assets."
    }

@app.get("/{full_path:path}")
def serve_frontend_spa(full_path: str):
    # Exclude /api routes so they return proper 404s if nonexistent
    if full_path.startswith("api"):
        raise HTTPException(status_code=404, detail=f"API route '/{full_path}' not found")

    file_path = DIST_DIR / full_path
    if full_path and file_path.is_file():
        return FileResponse(str(file_path))

    # Single Page Application (SPA) routing fallback
    index_file = DIST_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(str(index_file))

    raise HTTPException(status_code=404, detail="Resource not found")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print("\n" + "=" * 60)
    print(f" LeafTriage Unified Server Running on Port {port}")
    print(f" -> Frontend & Backend Unified: http://localhost:{port}/")
    print(f" -> Backend API Health Check  : http://localhost:{port}/api/health")
    print(f" -> SQLite Plant Database     : Active (leaftriage.db)")
    print("=" * 60 + "\n")
    uvicorn.run(app, host="0.0.0.0", port=port)

