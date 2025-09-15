import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const TestQR = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    QRCode.toCanvas(canvasRef.current, "zone-123", { width: 256 }, (error) => {
      if (error) console.error(error);
      else console.log("QR Code generated!");
    });
  }, []);

  return (
    <div>
      <h2>Test QR Code</h2>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default TestQR;
