import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, AlertCircle } from 'lucide-react';

interface LiveCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  language: 'bn' | 'en';
}

export const LiveCameraModal: React.FC<LiveCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  language
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string>('');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopStream();
      return;
    }

    startCamera();

    return () => {
      stopStream();
    };
  }, [isOpen, facingMode]);

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsReady(false);
  };

  const startCamera = async () => {
    setCameraError('');
    setIsReady(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia not supported');
      }

      // Stop existing stream before starting a new one
      stopStream();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch(() => {});
          setIsReady(true);
        };
      }
    } catch (err: any) {
      console.warn('Live camera stream failed, falling back to native file picker:', err);
      setCameraError(
        language === 'bn'
          ? 'ক্যামেরা চালু করতে সমস্যা হয়েছে। আপনার ব্রাউজার বা ডিভাইসে ক্যামেরা অনুমতি দিন।'
          : 'Could not access device camera. Please grant camera permission.'
      );
    }
  };

  const handleFlipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapture = () => {
    if (!videoRef.current || !isReady) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

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
      onClose();
    } catch (err) {
      console.error('Error capturing frame:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-4 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="w-full max-w-md flex items-center justify-between text-white z-10 pt-2">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-pink-500 animate-pulse" />
          <span className="font-extrabold text-sm">
            {language === 'bn' ? 'ক্যামেরা ভিউফাইন্ডার' : 'Camera Viewfinder'}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Viewfinder Window */}
      <div className="relative w-full max-w-md flex-1 my-3 bg-black rounded-3xl overflow-hidden border-2 border-pink-500/50 flex items-center justify-center shadow-2xl">
        {cameraError ? (
          <div className="p-6 text-center text-white space-y-3">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <p className="text-xs text-red-300 font-bold leading-relaxed">{cameraError}</p>
            <button
              onClick={startCamera}
              className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs rounded-xl transition"
            >
              {language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Retry Camera'}
            </button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
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
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-bold gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-pink-500" />
                <span>{language === 'bn' ? 'ক্যামেরা চালু হচ্ছে...' : 'Initializing camera...'}</span>
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
          title="Flip Camera"
          className="p-3.5 rounded-full bg-slate-800/90 hover:bg-slate-700 text-white transition cursor-pointer border border-slate-700 active:scale-95"
        >
          <RefreshCw className="w-5 h-5" />
        </button>

        {/* Big Shutter Button */}
        <button
          type="button"
          disabled={!isReady}
          onClick={handleCapture}
          className="w-18 h-18 rounded-full border-4 border-white bg-gradient-to-tr from-pink-600 to-rose-500 active:scale-90 hover:scale-105 transition shadow-2xl flex items-center justify-center cursor-pointer disabled:opacity-50"
        >
          <div className="w-12 h-12 rounded-full bg-white/90"></div>
        </button>

        <div className="w-12"></div>
      </div>
    </div>
  );
};
