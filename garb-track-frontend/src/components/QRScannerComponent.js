import React, { useEffect, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "../api";

const QRScannerComponent = ({ onScanSuccess }) => {
  const handleScanSuccess = useCallback(async (decodedText) => {
    try {
      console.log("Scanned QR Code:", decodedText);
      await api.post("/collection-logs", { qr_code_data: decodedText });
      if (onScanSuccess) {
        onScanSuccess(decodedText, true);
      }
    } catch (error) {
      console.error("Failed to log collection:", error);
      if (onScanSuccess) {
        onScanSuccess(null, false);
      }
    }
  }, [onScanSuccess]);

  const handleScanFailure = (error) => {
    console.warn("QR scan error:", error);
  };

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
    });

    scanner.render(handleScanSuccess, handleScanFailure);
    return () => scanner.clear();
  }, [handleScanSuccess]);

  return (
    <div
      id="qr-reader"
      style={{
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        border: "2px dashed #5E936C",
        borderRadius: "8px",
        padding: "1rem",
        backgroundColor: "#f0fdf4",
      }}
    />
  );
};

export default QRScannerComponent;
