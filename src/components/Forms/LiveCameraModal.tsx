import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, X, RefreshCw, AlertCircle, Smartphone } from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  onUseNativeCamera?: () => void;
  language: 'bn' | 'en';
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  onUseNativeCamera,
  language
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionIdRef = useRef(0);
  const initTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nativeHintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);
  const [showNativeHint, setShowNativeHint] = useState(false);

  const clearTimers = useCallback(() => {
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
      initTimeoutRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (nativeHintTimerRef.current) {
      clearTimeout(nativeHintTimerRef.current);
      nativeHintTimerRef.current = null;
    }
  }, []);

  const stopStream = useCallback(() => {
    sessionIdRef.current += 1;
    clearTimers();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {}
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = null;
      videoRef.current.onloadeddata = null;
      videoRef.current.oncanplay = null;
      videoRef.current.onplaying = null;
      try {
        videoRef.current.srcObject = null;
      } catch {}
    }
    setIsReady(false);
    setShowNativeHint(false);
  }, [clearTimers]);

  const requestStreamWithFallback = async (preferredFacing: 'environment' | 'user'): Promise<MediaStream> => {
    const withTimeout = (promise: Promise<MediaStream>, ms: number) =>
      Promise.race<MediaStream>([
        promise,
        new Promise<MediaStream>((_, reject) =>
          setTimeout(() => reject(new Error('CAMERA_TIMEOUT')), ms)
        )
      ]);

    const primaryConstraints: MediaStreamConstraints = {
      video: {
        facingMode: { ideal: preferredFacing },
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    try {
      return await withTimeout(navigator.mediaDevices.getUserMedia(primaryConstraints), 6500);
    } catch (primaryErr: any) {
      const errName = primaryErr?.name || '';
      if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
        throw primaryErr;
      }
      // Fallback to simplest possible video constraint for older cameras/WebViews
      return await withTimeout(
        navigator.mediaDevices.getUserMedia({ video: true, audio: false }),
        5500
      );
    }
  };

  const startCamera = useCallback(async () => {
    stopStream();
    const sessionId = sessionIdRef.current;

    setCameraError('');
    setIsReady(false);
    setShowNativeHint(false);

    nativeHintTimerRef.current = setTimeout(() => {
      if (sessionIdRef.current === sessionId) {
        setShowNativeHint(true);
      }
    }, 1800);

    initTimeoutRef.current = setTimeout(() => {
      if (sessionIdRef.current === sessionId) {
        stopStream();
        setCameraError(
          language === 'bn'
            ? 'ক্যামেরা চালু হতে বেশি সময় লাগছে। নিচ থেকে ফোনের মূল ক্যামেরা ব্যবহার করুন অথবা ক্যামেরার অনুমতি দিন।'
            : 'Camera is taking too long to start. Use your device camera below or check camera permissions.'
        );
      }
    }, 9000);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      const stream = await requestStreamWithFallback(facingMode);

      if (sessionIdRef.current !== sessionId) {
        stream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {}
        });
        return;
      }

      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error('Video element unavailable');
      }

      const markReady = () => {
        if (sessionIdRef.current !== sessionId) return;
        clearTimers();
        setIsReady(true);
      };

      const checkVideoPlayingOrLoaded = () => {
        if (sessionIdRef.current !== sessionId) return;
        if (video.readyState >= 2 || video.videoWidth > 0) {
          markReady();
        }
      };

      // Attach listeners BEFORE setting srcObject so early events are never missed
      video.onloadedmetadata = () => {
        video.play().catch(() => {});
        checkVideoPlayingOrLoaded();
      };
      video.onloadeddata = checkVideoPlayingOrLoaded;
      video.oncanplay = () => {
        video.play().catch(() => {});
        markReady();
      };
      video.onplaying = markReady;

      video.muted = true;
      video.playsInline = true;
      video.setAttribute('playsinline', 'true');
      video.setAttribute('webkit-playsinline', 'true');
      video.srcObject = stream;

      try {
        await video.play();
      } catch {
        // Ignore autoplay promise rejection if muted inline playback still starts via events
      }

      if (video.readyState >= 2 || video.videoWidth > 0) {
        markReady();
        return;
      }

      // Poll briefly as a safety net for WebViews that suppress media events
      pollIntervalRef.current = setInterval(() => {
        if (sessionIdRef.current !== sessionId) {
          if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
          return;
        }
        if (video.readyState >= 2 || video.videoWidth > 0) {
          markReady();
        } else {
          video.play().catch(() => {});
        }
      }, 180);
    } catch (err: any) {
      if (sessionIdRef.current !== sessionId) return;
      clearTimers();
      console.warn('Live camera stream failed:', err);
      const isDenied = err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError';
      setCameraError(
        isDenied
          ? language === 'bn'
            ? 'ক্যামেরার অনুমতি বন্ধ আছে। ব্রাউজার/অ্যাপ সেটিংস থেকে ক্যামেরা অনুমতি দিন অথবা ফোনের ক্যামেরা ব্যবহার করুন।'
            : 'Camera permission was denied. Allow camera access or use your device camera.'
          : language === 'bn'
            ? 'লাইভ ক্যামেরা চালু করা যায়নি। নিচের বাটন থেকে সরাসরি ফোনের ক্যামেরা ব্যবহার করুন।'
            : 'Could not start live camera. Please use your device camera below.'
      );
    }
  }, [clearTimers, facingMode, language, stopStream]);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    startCamera();

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode, startCamera, stopStream]);

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleTriggerNativeCamera = () => {
    stopStream();
    onClose();
    if (onUseNativeCamera) {
      setTimeout(() => onUseNativeCamera(), 60);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !isReady) return;

    try {
      const video = videoRef.current;
      const rawW = video.videoWidth || 640;
      const rawH = video.videoHeight || 480;
      const maxDim = 1200;
      let width = rawW;
      let height = rawH;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // If user camera, flip horizontally for mirror effect
      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      onCapture(dataUrl);
      stopStream();
      onClose();
    } catch (err) {
      console.error('Error capturing frame:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between text-white z-10 pt-2">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-pink-500 animate-pulse" />
          <span className="font-extrabold text-sm">
            {language === 'bn' ? 'ক্যামেরা ভিউফাইন্ডার' : 'Camera Viewfinder'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            stopStream();
            onClose();
          }}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder Window */}
      <div className="relative w-full max-w-md flex-1 my-3 bg-black rounded-3xl overflow-hidden border-2 border-pink-500/50 flex items-center justify-center shadow-2xl">
        {cameraError ? (
          <div className="p-6 text-center text-white space-y-4 max-w-xs">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-xs text-red-300 font-bold leading-relaxed">{cameraError}</p>
            <div className="flex flex-col gap-2.5">
              {onUseNativeCamera && (
                <button
                  type="button"
                  onClick={handleTriggerNativeCamera}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{language === 'bn' ? 'ফোনের মূল ক্যামেরা খুলুন' : 'Open Device Camera'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2.5 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Camera'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? '-scale-x-100' : ''}`}
            />

            {/* Visual Viewfinder Crosshairs */}
            <div className="absolute inset-4 pointer-events-none border border-white/20 rounded-2xl flex flex-col justify-between p-4">
              <div className="flex justify-between">
                <span className="w-6 h-6 border-t-2 border-l-2 border-pink-500"></span>
                <span className="w-6 h-6 border-t-2 border-r-2 border-pink-500"></span>
              </div>
              <div className="flex justify-between">
                <span className="w-6 h-6 border-b-2 border-l-2 border-pink-500"></span>
                <span className="w-6 h-6 border-b-2 border-r-2 border-pink-500"></span>
              </div>
            </div>

            {!isReady && (
              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white text-xs font-bold gap-3 p-4 text-center">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-pink-500" />
                  <span>{language === 'bn' ? 'ক্যামেরা চালু হচ্ছে...' : 'Initializing camera...'}</span>
                </div>
                {showNativeHint && onUseNativeCamera && (
                  <button
                    type="button"
                    onClick={handleTriggerNativeCamera}
                    className="mt-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{language === 'bn' ? 'ফোনের ক্যামেরা ওপেন করুন' : 'Use Phone Camera'}</span>
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="w-full max-w-md flex items-center justify-around pb-4 z-10">
        <button
          type="button"
          onClick={handleFlipCamera}
          title={language === 'bn' ? 'ক্যামেরা ঘোরান' : 'Flip Camera'}
          className="p-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white transition cursor-pointer border border-slate-700 active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* Big Shutter Button */}
        <button
          type="button"
          disabled={!isReady}
          onClick={handleCapture}
          aria-label={language === 'bn' ? 'ছবি তুলুন' : 'Capture Photo'}
          className="w-[72px] h-[72px] rounded-full border-4 border-white bg-gradient-to-tr from-pink-600 to-rose-500 active:scale-90 hover:scale-105 transition shadow-2xl flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-white/90"></div>
        </button>

        {onUseNativeCamera ? (
          <button
            type="button"
            onClick={handleTriggerNativeCamera}
            title={language === 'bn' ? 'ফোনের মূল ক্যামেরা' : 'Device Camera'}
            className="p-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white transition cursor-pointer border border-slate-700 active:scale-95"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-12"></div>
        )}
      </div>
    </div>
  );
};
