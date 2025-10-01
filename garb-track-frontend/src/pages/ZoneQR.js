import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

function ZoneQR() {
  const zones = ['Zone A', 'Zone B', 'Zone C'];
  const canvasRefs = useRef([]);

  useEffect(() => {
    zones.forEach((zone, index) => {
      QRCode.toCanvas(canvasRefs.current[index], zone, { width: 200 }, (err) => {
        if (err) {
          console.error(err);
        } else {
          console.log(`${zone} QR generated`);
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount, zones won't change

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Zone QR Codes</h1>
      <p>Scan these QR codes to log garbage collection for each zone.</p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
        {zones.map((zone, index) => (
          <div key={zone} style={{ textAlign: 'center' }}>
            <canvas ref={(el) => (canvasRefs.current[index] = el)} />
            <p style={{ marginTop: '0.5rem', fontWeight: 'bold' }}>{zone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ZoneQR;
