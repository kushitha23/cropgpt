import React, { useState, useRef, useCallback } from 'react';
import { analyzeCropImage } from '../services/geminiService';
import { CropScanResult, Language } from '../types';
import { translations } from '../constants';
import { CameraIcon, UploadIcon } from './Icons';

const Spinner = () => (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
);

const CropScanner: React.FC<{ language: Language }> = ({ language }) => {
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [result, setResult] = useState<CropScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[language];

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraOn(true);
        setResult(null);
        setError('');
        setPreviewImage(null);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please check permissions.");
    }
  }, []);

  const analyzeBase64Image = useCallback(async (base64: string) => {
    setLoading(true);
    setResult(null);
    setError('');
    const analysisResult = await analyzeCropImage(base64);
    if (analysisResult) {
      setResult(analysisResult);
    } else {
      setError("Analysis failed. Please try again with a clearer image.");
    }
    setLoading(false);
  }, []);
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewImage(base64String);
        analyzeBase64Image(base64String.split(',')[1]);
      };
      reader.readAsDataURL(file);
    }
  }, [stopCamera, analyzeBase64Image]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleCapture = useCallback(async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      
      const dataUrl = canvas.toDataURL('image/jpeg');
      const base64Image = dataUrl.split(',')[1];
      
      stopCamera();
      setPreviewImage(dataUrl);
      await analyzeBase64Image(base64Image);
    }
  }, [stopCamera, analyzeBase64Image]);
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6">
        <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
          {isCameraOn ? (
            <video ref={videoRef} className="w-full h-full object-cover" playsInline />
          ) : previewImage ? (
            <img src={previewImage} alt="Crop Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-gray-400 p-4">
              <CameraIcon className="w-16 h-16 mx-auto text-gray-500" />
              <p className="mt-2 font-semibold">{t.cameraOff}</p>
              <p className="text-sm mt-1">{t.uploadPrompt}</p>
            </div>
          )}
           {loading && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-4 transition-opacity duration-300">
              <Spinner />
              <p className="text-white font-semibold text-lg">{t.analyzing}</p>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

        <div className="flex flex-col sm:flex-row gap-4">
          {isCameraOn ? (
             <>
              <button onClick={handleCapture} className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors" disabled={loading}>{t.capture}</button>
              <button onClick={stopCamera} className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors">{t.stopScan}</button>
            </>
          ) : previewImage ? (
             <>
              <button onClick={startCamera} className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <CameraIcon className="w-5 h-5"/>
                {t.retake}
              </button>
              <button onClick={handleUploadClick} className="flex-1 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-dark transition-colors flex items-center justify-center gap-2">
                <UploadIcon className="w-5 h-5"/>
                {t.uploadAnother}
              </button>
            </>
          ) : (
            <>
              <button onClick={startCamera} className="flex-1 bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                <CameraIcon className="w-5 h-5"/>
                {t.startScan}
              </button>
              <button onClick={handleUploadClick} className="flex-1 bg-accent text-white font-bold py-3 px-4 rounded-lg hover:bg-accent-dark transition-colors flex items-center justify-center gap-2">
                <UploadIcon className="w-5 h-5"/>
                {t.uploadImage}
              </button>
            </>
          )}
        </div>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="text-2xl font-bold text-center text-gray-800 dark:text-white">{t.scanResult}</h3>
            <div className="p-4 bg-secondary dark:bg-gray-700/50 rounded-lg space-y-4">
              <div>
                <p><strong className="text-gray-700 dark:text-gray-200">Crop:</strong> {result.cropName}</p>
                <p><strong className="text-gray-700 dark:text-gray-200">Health:</strong> <span className={result.healthStatus === 'Healthy' ? 'text-green-500 font-bold' : 'text-yellow-500 font-bold'}>{result.healthStatus}</span></p>
                <p><strong className="text-gray-700 dark:text-gray-200">Disease/Issue:</strong> {result.disease}</p>
              </div>

              {result.recommendations && result.recommendations.length > 0 && (
                <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-md text-gray-800 dark:text-gray-100">{t.recommendations}</h4>
                  <ul className="list-disc list-inside mt-1 text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    {result.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              )}
              
              {result.fertilizers && result.fertilizers.length > 0 && (
                <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-md text-gray-800 dark:text-gray-100">{t.fertilizers}</h4>
                  <ul className="list-disc list-inside mt-1 text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    {result.fertilizers.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}

               {result.pesticides && result.pesticides.length > 0 && (
                <div className="pt-3 border-t border-gray-300 dark:border-gray-600">
                  <h4 className="font-semibold text-md text-gray-800 dark:text-gray-100">{t.pesticides}</h4>
                  <ul className="list-disc list-inside mt-1 text-sm space-y-1 text-gray-600 dark:text-gray-300">
                    {result.pesticides.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropScanner;