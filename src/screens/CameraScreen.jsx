import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import LeafGuideOverlay from '../widgets/LeafGuideOverlay';
import { SAMPLE_TEST_LEAVES, createLeafDataUrl, ClassifierService } from '../services/classifier';
import { 
  ArrowLeft, 
  Zap, 
  ZapOff, 
  Image as ImageIcon, 
  Camera, 
  RefreshCw, 
  FlipHorizontal, 
  AlertCircle,
  Upload
} from 'lucide-react';

export default function CameraScreen() {
  const { lang, t, screenParams, navigateTo, goBack } = useApp();

  const isMobileDevice = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);
  const streamRef = useRef(null);

  const [streamActive, setStreamActive] = useState(false);
  const [facingMode, setFacingMode] = useState(isMobileDevice ? 'environment' : 'user');
  const [selectedCrop, setSelectedCrop] = useState(() => {
    const crop = screenParams?.selectedCrop || 'auto';
    return typeof crop === 'string' ? crop.toLowerCase() : 'auto';
  });
  const explicitCropHint = screenParams?.selectedCrop && selectedCrop !== 'auto' ? selectedCrop : null;
  const [flashOn, setFlashOn] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [cameraName, setCameraName] = useState('');
  const [liveScanActive, setLiveScanActive] = useState(false);
  const [liveScanLoading, setLiveScanLoading] = useState(false);
  const [liveResult, setLiveResult] = useState({
    confidence: 0,
    disease: '',
    status: ''
  });
  const liveScanTimerRef = useRef(null);

  const cropsList = [
    { id: 'auto', labelEn: 'Auto Detect', labelTa: 'தானாக அறிதல்', icon: '✨' },
    { id: 'tomato', labelEn: 'Tomato', labelTa: 'தக்காளி', icon: '🍅' },
    { id: 'paddy', labelEn: 'Paddy', labelTa: 'நெல்', icon: '🌾' },
    { id: 'banana', labelEn: 'Banana', labelTa: 'வாழை', icon: '🍌' },
    { id: 'groundnut', labelEn: 'Groundnut', labelTa: 'நிலக்கடலை', icon: '🥜' },
    { id: 'chilli', labelEn: 'Chilli', labelTa: 'மிளகாய்', icon: '🌶️' }
  ];

  // Helper to attach stream to video element and force playback
  const attachStreamToVideo = (stream) => {
    const video = videoRef.current;
    if (video && stream) {
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', '');
      video.setAttribute('autoplay', '');
      video.setAttribute('muted', '');
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.onloadedmetadata = () => {
        video.play().then(() => setStreamActive(true)).catch(e => console.warn('Metadata play caught:', e));
      };
      video.play().then(() => setStreamActive(true)).catch(e => console.warn('Immediate play caught:', e));
    }
  };

  // Initialize camera with cascading fallbacks for both mobile & laptop webcams
  const startCamera = async (mode = facingMode) => {
    setIsInitializing(true);
    setCameraError(null);

    // Stop existing stream
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
      } catch (_) {}
      streamRef.current = null;
    }

    let stream = null;
    let caughtError = null;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('NotSupported');
      setIsInitializing(false);
      return;
    }

    // Step 1: Enumerate video devices to prefer real color RGB camera on laptops (skip Windows Hello IR sensors)
    let videoDevices = [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoDevices = devices.filter(d => d.kind === 'videoinput');
    } catch (_) {}

    const rgbWebcam = videoDevices.find(d => {
      const label = (d.label || '').toLowerCase();
      return !label.includes('ir') && !label.includes('infrared') && !label.includes('hello');
    });

    // Step 2: Attempt to open the best stream
    // Attempt A: On laptops/desktops, prefer non-IR webcam deviceId if known
    if (rgbWebcam && rgbWebcam.deviceId && !isMobileDevice && mode === 'user') {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: rgbWebcam.deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        if (stream) setCameraName(rgbWebcam.label || 'Webcam');
      } catch (errA) {
        console.warn('Attempt A (RGB deviceId) failed:', errA);
      }
    }

    // Attempt B: Use facingMode ideal constraint (essential for mobile rear camera or laptop front camera)
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
        const track = stream?.getVideoTracks()?.[0];
        if (track) setCameraName(track.label || (mode === 'user' ? 'Front Camera' : 'Rear Camera'));
      } catch (errB) {
        console.warn('Attempt B (facingMode ideal) failed:', errB);
        caughtError = errB;
      }
    }

    // Attempt C: Standard generic video fallback
    if (!stream) {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        const track = stream?.getVideoTracks()?.[0];
        if (track) setCameraName(track.label || 'Webcam');
      } catch (errC) {
        console.warn('Attempt C (basic video) failed:', errC);
        caughtError = errC;
      }
    }

    if (stream) {
      streamRef.current = stream;
      setStreamActive(true);
      setCameraError(null);
      attachStreamToVideo(stream);
    } else {
      setStreamActive(false);
      setCameraError(caughtError?.name || 'CameraUnavailable');
    }
    setIsInitializing(false);
  };

  useEffect(() => {
    const cropFromParams = screenParams?.selectedCrop || 'auto';
    setSelectedCrop(typeof cropFromParams === 'string' ? cropFromParams.toLowerCase() : 'auto');
  }, [screenParams?.selectedCrop]);

  useEffect(() => {
    startCamera(facingMode);

    return () => {
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach(track => track.stop());
        } catch (_) {}
      }
    };
  }, [facingMode]);

  useEffect(() => {
    if (streamActive && streamRef.current) {
      attachStreamToVideo(streamRef.current);
    }
  }, [streamActive]);

  useEffect(() => () => {
    if (liveScanTimerRef.current) {
      clearInterval(liveScanTimerRef.current);
      liveScanTimerRef.current = null;
    }
  }, []);

  const toggleCameraFacing = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const stopLiveScan = () => {
    if (liveScanTimerRef.current) {
      clearInterval(liveScanTimerRef.current);
      liveScanTimerRef.current = null;
    }
    setLiveScanActive(false);
    setLiveScanLoading(false);
    setLiveResult({ confidence: 0, disease: '', status: '' });
  };

  const captureFrameForLiveScan = async () => {
    if (!streamActive || !videoRef.current) {
      return;
    }

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return;
      }

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = canvas.toDataURL('image/jpeg', 0.9);

      setLiveScanLoading(true);
      const result = await ClassifierService.analyzeLeaf(imageData, null, selectedCrop);

      if (result && result.disease) {
        const diseaseName = lang === 'ta'
          ? (result.disease.names?.ta || result.disease.name_ta || result.disease.name || 'நோய் கண்டறியப்பட்டது')
          : (result.disease.names?.en || result.disease.name_en || result.disease.name || 'Disease detected');

        setLiveResult({
          confidence: result.confidence ?? 0,
          disease: diseaseName,
          status: result.isLowConfidence
            ? (lang === 'ta' ? 'மீண்டும் எடுக்கவும்' : 'Retake for better clarity')
            : (lang === 'ta' ? 'நேரடி பதிவு இயங்குகிறது' : 'Live scan active')
        });
      } else if (result) {
        setLiveResult({
          confidence: result.confidence ?? 0,
          disease: lang === 'ta' ? 'செயலாக்கம் தொடர்கிறது' : 'Processing leaf...',
          status: lang === 'ta' ? 'சற்று காத்திருங்கள்' : 'Please wait'
        });
      }
    } catch (err) {
      console.warn('Live scan loop failed safely:', err);
      setLiveResult({
        confidence: 0,
        disease: lang === 'ta' ? 'மீண்டும் முயற்சிக்கவும்' : 'Retrying live scan',
        status: lang === 'ta' ? 'கேமரா நிலை சரிபார்க்கப்படுகிறது' : 'Checking camera status'
      });
    } finally {
      setLiveScanLoading(false);
    }
  };

  const startLiveScan = async () => {
    if (!streamActive) {
      await startCamera(facingMode);
    }

    if (!streamActive && !videoRef.current) {
      return;
    }

    if (liveScanTimerRef.current) {
      clearInterval(liveScanTimerRef.current);
      liveScanTimerRef.current = null;
    }

    setLiveScanActive(true);
    setLiveResult({ confidence: 0, disease: '', status: lang === 'ta' ? 'நேரடி ஸ்கேன் தொடங்குகிறது...' : 'Starting live scan...' });

    await captureFrameForLiveScan();

    liveScanTimerRef.current = setInterval(() => {
      captureFrameForLiveScan();
    }, 2800);
  };

  // Capture current frame from live camera stream or sample
  const handleCapture = (presetId = null) => {
    let capturedDataUrl = null;

    if (streamActive && videoRef.current && !presetId) {
      try {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext('2d');

        // Mirror horizontal if in front-facing / laptop webcam mode
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      } catch (e) {
        console.warn('Canvas frame capture error:', e);
      }
    }

    if (!capturedDataUrl) {
      const sample = presetId || 'paddy_blast';
      capturedDataUrl = createLeafDataUrl(
        sample === 'tomato_early_blight' ? 'target_rings' :
        sample === 'banana_sigatoka' ? 'linear_streaks' :
        sample === 'low_confidence_unclear' ? 'blurry' : 'spindle_spots',
        '#558B64'
      );
    }

    // Stop camera stream before navigating
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }

    navigateTo('analysing', {
      photoUrl: capturedDataUrl,
      presetSampleId: presetId,
      crop: explicitCropHint
    });
  };

  // Native File/Camera Upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        navigateTo('analysing', {
          photoUrl: event.target.result,
          presetSampleId: null,
          crop: explicitCropHint
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#0F1611',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* File input for gallery or native phone camera */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {liveScanActive && (
        <div style={{
          position: 'absolute',
          left: '16px',
          right: '16px',
          bottom: '120px',
          zIndex: 60,
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'rgba(9, 15, 11, 0.88)',
            border: '1px solid rgba(130, 189, 146, 0.35)',
            borderRadius: '18px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.28)',
            padding: '10px 16px',
            minWidth: '260px',
            maxWidth: '90%',
            color: '#F7F9F7',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.74rem', fontWeight: '700', letterSpacing: '0.08em', color: '#8CD49D', marginBottom: '4px', textTransform: 'uppercase' }}>
              {lang === 'ta' ? 'நேரடி ஸ்கேன்' : 'Live Scan'}
            </div>
            <div style={{ fontSize: '0.96rem', fontWeight: '700', marginBottom: '2px' }}>
              {liveScanLoading ? (lang === 'ta' ? 'ஸ்கேன் செய்கிறது...' : 'Scanning...') : liveResult.disease || (lang === 'ta' ? 'இலைகளை பரிசோதிக்கிறது' : 'Checking leaf...')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#B8C9BD' }}>
              {liveResult.status || (lang === 'ta' ? 'செயலாக்கம் தொடர்கிறது' : 'Processing live feed')}
              {liveResult.confidence ? ` • ${liveResult.confidence}%` : ''}
            </div>
          </div>
        </div>
      )}

      {/* Top Floating Controls */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '20px',
        right: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 50
      }}>
        <button
          className="icon-btn"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#FFFFFF' }}
          onClick={goBack}
          aria-label="Back"
        >
          <ArrowLeft size={22} />
        </button>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Active Camera Mode Badge / Quick Switch */}
          <button
            onClick={toggleCameraFacing}
            style={{
              backgroundColor: 'rgba(0,0,0,0.65)',
              color: '#A8D5B5',
              border: '1px solid rgba(118, 180, 135, 0.4)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
            title={lang === 'ta' ? 'கேமராவை மாற்ற கிளிக் செய்க' : 'Click to flip / switch camera'}
          >
            <RefreshCw size={14} />
            <span>
              {facingMode === 'user'
                ? (lang === 'ta' ? '🧑‍🌾 வெப்கேமரா' : '🧑‍🌾 Webcam')
                : (lang === 'ta' ? '🌿 பின்பக்க கேமரா' : '🌿 Rear Camera')}
            </span>
          </button>

          {/* Flip Camera (Front/Back) */}
          <button
            className="icon-btn"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#FFFFFF' }}
            onClick={toggleCameraFacing}
            title={lang === 'ta' ? 'கேமராவை மாற்று' : 'Flip Camera'}
          >
            <FlipHorizontal size={20} />
          </button>

          {/* Flash Toggle */}
          <button
            className="icon-btn"
            style={{ 
              backgroundColor: flashOn ? 'var(--color-terracotta)' : 'rgba(0,0,0,0.65)', 
              color: '#FFFFFF' 
            }}
            onClick={() => setFlashOn(!flashOn)}
            title={flashOn ? t.flashOn : t.flashOff}
          >
            {flashOn ? <Zap size={22} color="#FFD166" /> : <ZapOff size={22} />}
          </button>

          {/* Device Gallery / Native Camera Shortcut */}
          <button
            className="icon-btn"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#FFFFFF' }}
            onClick={() => fileInputRef.current?.click()}
            title={t.pickGallery}
          >
            <ImageIcon size={22} />
          </button>
        </div>
      </div>

      {/* Target Crop Selector Pill Strip */}
      <div style={{
        position: 'absolute',
        top: '68px',
        left: '16px',
        right: '16px',
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        zIndex: 50,
        scrollbarWidth: 'none',
        padding: '4px 0'
      }}>
        {cropsList.map(c => (
          <button
            key={c.id}
            onClick={() => setSelectedCrop(c.id)}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              border: selectedCrop === c.id ? '2px solid #82BD92' : '1px solid rgba(255,255,255,0.25)',
              backgroundColor: selectedCrop === c.id ? '#2D5436' : 'rgba(15, 22, 17, 0.72)',
              backdropFilter: 'blur(6px)',
              color: '#FFFFFF',
              fontSize: '0.82rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: selectedCrop === c.id ? '0 0 12px rgba(130, 189, 146, 0.5)' : 'none'
            }}
          >
            <span>{c.icon}</span>
            <span>{lang === 'ta' ? c.labelTa : c.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Camera Viewport / Live Stream Area */}
      <div style={{
        position: 'relative',
        flex: 1,
        width: '100%',
        minHeight: '480px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
        overflow: 'hidden'
      }}>
        {/* Flash screen effect */}
        {flashOn && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 230, 0.22)',
            zIndex: 10,
            pointerEvents: 'none'
          }} />
        )}

        {/* Live Video Feed (Always active in DOM and fills the entire viewport) */}
        <video
          ref={(el) => {
            videoRef.current = el;
            if (el && streamRef.current && el.srcObject !== streamRef.current) {
              el.srcObject = streamRef.current;
              el.muted = true;
              el.playsInline = true;
              el.play().then(() => setStreamActive(true)).catch(e => console.warn('Ref attach play error:', e));
            }
          }}
          autoPlay
          playsInline
          muted
          onLoadedMetadata={(e) => {
            e.target.play().then(() => setStreamActive(true)).catch(() => {});
          }}
          onPlaying={() => setStreamActive(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            zIndex: 1,
            backgroundColor: '#000000'
          }}
        />

        {!streamActive && (
          /* Fallback when browser camera stream is waiting, denied, or initializing */
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '30px 20px',
            textAlign: 'center',
            color: '#EDF4EE',
            maxWidth: '460px',
            zIndex: 15
          }}>
            <div style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: 'rgba(111, 166, 125, 0.2)',
              border: '2px dashed #6FA67D',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <Camera size={42} color="#76B487" />
            </div>

            <h3 style={{ fontSize: 'calc(1.25rem * var(--font-scale))', fontWeight: '800', marginBottom: '8px' }}>
              {cameraError === 'NotAllowedError'
                ? (lang === 'ta' ? 'கேமரா அனுமதி தேவை' : 'Camera Permission Blocked')
                : (lang === 'ta' ? 'லேப்டாப் கேமராவை இணைக்கவும்' : 'Connect Laptop Webcam')}
            </h3>

            <p style={{ fontSize: 'calc(0.9rem * var(--font-scale))', color: '#A3B7AA', marginBottom: '18px', lineHeight: 1.55 }}>
              {cameraError === 'NotAllowedError'
                ? (lang === 'ta'
                    ? 'பிரவுசரின் முகவரிப் பட்டியில் (URL bar) உள்ள கேமரா அல்லது பூட்டு குறியீட்டை (🔒) கிளிக் செய்து அனுமதி வழங்கவும்.'
                    : 'Click the camera or lock icon (🔒) in your browser address bar to allow camera access, then click Connect Camera.')
                : (lang === 'ta'
                    ? 'உங்கள் லேப்டாப் வெப்கேமராவுடன் நேரலை ஸ்கேனைத் தொடங்க கீழே உள்ள பொத்தானை கிளிக் செய்யவும்.'
                    : 'Click below to connect your laptop webcam and start real-time scanning.')}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '320px' }}>
              <button
                className="btn-primary"
                onClick={() => startCamera(facingMode)}
                style={{ padding: '14px 20px', minHeight: '50px', fontSize: '1.0rem', fontWeight: '800' }}
              >
                <Camera size={20} />
                <span>{lang === 'ta' ? 'கேமராவை ஆன் செய்க' : 'Connect / Start Camera'}</span>
              </button>

              <button
                className="btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  padding: '12px 20px', 
                  minHeight: '46px', 
                  fontSize: '0.92rem', 
                  backgroundColor: 'rgba(255,255,255,0.1)', 
                  color: '#FFFFFF', 
                  border: '1px solid rgba(255,255,255,0.2)' 
                }}
              >
                <Upload size={18} />
                <span>{lang === 'ta' ? 'படத்தை பதிவேற்று' : 'Upload Leaf Photo'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Leaf Silhouette Guide Overlay */}
        <LeafGuideOverlay />
      </div>

      {/* Interactive Quick Leaf Samples Strip */}
      <div style={{
        backgroundColor: 'rgba(20, 28, 22, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '12px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        zIndex: 40
      }}>
        <span style={{ fontSize: 'calc(0.78rem * var(--font-scale))', color: '#A3B7AA', fontWeight: '600' }}>
          {lang === 'ta' ? 'சோதனை மாதிரி இலைகள் (1-க்ளிக் ஆய்வு):' : 'Click a diseased leaf sample to test:'}
        </span>

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          maxWidth: '100%',
          paddingBottom: '4px'
        }}>
          {SAMPLE_TEST_LEAVES.map(sample => (
            <button
              key={sample.id}
              onClick={() => handleCapture(sample.id)}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 14px',
                fontSize: 'calc(0.82rem * var(--font-scale))',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'background-color var(--transition-fast)'
              }}
            >
              <span>{sample.icon}</span>
              <span>{lang === 'ta' ? sample.labelTa : sample.labelEn}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Shutter Controls */}
      <div style={{
        backgroundColor: '#0F1611',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '16px 28px 24px 28px',
        zIndex: 40
      }}>
        {/* Gallery shortcut */}
        <button
          className="icon-btn"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)' 
          }}
          onClick={() => fileInputRef.current?.click()}
          title={t.pickGallery}
        >
          <ImageIcon size={22} />
        </button>

        {/* Large Round Capture Shutter Button */}
        <button
          onClick={() => handleCapture()}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#FFFFFF',
            border: '6px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s ease'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.92)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Capture leaf photo"
          title="Capture Photo"
        >
          <div style={{
            width: '62px',
            height: '62px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary)',
            border: '2px solid #FFFFFF'
          }} />
        </button>

        <button
          className="icon-btn"
          style={{ 
            backgroundColor: liveScanActive ? 'rgba(130, 189, 146, 0.22)' : 'rgba(255,255,255,0.15)', 
            color: '#FFFFFF',
            border: liveScanActive ? '1px solid rgba(130, 189, 146, 0.7)' : '1px solid rgba(255,255,255,0.2)',
            boxShadow: liveScanActive ? '0 0 14px rgba(130, 189, 146, 0.4)' : 'none'
          }}
          onClick={() => {
            if (liveScanActive) {
              stopLiveScan();
            } else {
              startLiveScan();
            }
          }}
          title={lang === 'ta' ? 'நேரடி ஸ்கேன்' : 'Live Scan'}
        >
          {liveScanActive ? <Zap size={22} color="#8CD49D" /> : <ZapOff size={22} />}
        </button>

        {/* Test Low Confidence (<60%) */}
        <button
          className="icon-btn"
          style={{ 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)' 
          }}
          onClick={() => handleCapture('low_confidence_unclear')}
          title="Test Low Confidence (<60%)"
        >
          <RefreshCw size={22} />
        </button>
      </div>
    </div>
  );
}
