import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Square } from 'lucide-react';
import jsQR from 'jsqr';
import { Student } from '@/store/useStore';

interface QRScannerProps {
  onScan: (data: string) => void;
  students: Student[];
}

export default function QRScanner({ onScan, students }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scannedQRs, setScannedQRs] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsScanning(true);
          setHasPermission(true);
        };
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasPermission(false);
    }
  };

  const stopScanner = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const scanQRCode = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      animationFrameRef.current = requestAnimationFrame(scanQRCode);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && !scannedQRs.includes(code.data)) {
      const matchedStudent = students.find(s => s.qrCode === code.data);
      if (matchedStudent) {
        onScan(code.data); // <-- Call AttendanceCapture handler
        setScannedQRs(prev => [...prev, code.data]); // Prevent duplicate scans
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQRCode);
  };

  useEffect(() => {
    if (isScanning) animationFrameRef.current = requestAnimationFrame(scanQRCode);
    return () => stopScanner();
  }, [isScanning]);

  // Simulate Scan (for testing)
  const simulateScan = () => {
    if (!students.length) return;
    const specificQR = students[0].qrCode;
    if (!scannedQRs.includes(specificQR)) {
      onScan(specificQR);
      setScannedQRs(prev => [...prev, specificQR]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-900 rounded-lg p-4 min-h-[300px] flex items-center justify-center relative">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[400px] object-cover rounded"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed rounded-lg w-48 h-48 animate-pulse flex items-center justify-center">
                <Square className="text-white" size={32} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-white">
            <Camera size={48} className="mx-auto mb-4" />
            <p className="mb-4">Camera scanner ready</p>
            <p className="text-sm text-gray-300">Position QR code within the frame</p>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-4">
        {!isScanning ? (
          <>
            <Button onClick={startScanner} className="flex items-center gap-2">
              <Camera size={16} /> Start Scanner
            </Button>
            <Button variant="outline" onClick={simulateScan} className="flex items-center gap-2">
              Simulate Scan
            </Button>
          </>
        ) : (
          <Button onClick={stopScanner} variant="destructive" className="flex items-center gap-2">
            <Square size={16} /> Stop Scanner
          </Button>
        )}
      </div>

      {hasPermission === false && (
        <div className="text-center text-amber-600 bg-amber-50 p-4 rounded-lg">
          <p className="font-medium">Camera Permission Required</p>
          <p className="text-sm mt-1">Please allow camera access to use the QR scanner or use "Simulate Scan".</p>
        </div>
      )}
    </div>
  );
}
