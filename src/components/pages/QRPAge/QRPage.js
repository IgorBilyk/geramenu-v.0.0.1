import { useState, useEffect, useRef } from "react";
import {useParams } from "react-router-dom";

import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import Navbar from "../../ui/Navbar";

const QRPage = () => {
  const [userId, setUserId] = useState(null);
  const { Id } = useParams();

  const qrRef = useRef();

  useEffect(() => {
    // Fetch the user ID from local storage
    const storedUserId = localStorage.getItem("userID");
    setUserId(storedUserId);
  }, []);

  const generatePDF = () => {
    const qrCodeSVG = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
  
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
  
      const pdf = new jsPDF();
  
      // Add text and QR codes
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.text("Menu Digital", 110, 35, { align: "center" }); // Text above the first QR code
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 70, 40, 85, 85); // First QR code

  
      pdf.text("Menu Digital", 110, 150, { align: "center" }); // Text above the second QR code
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 70, 155, 85, 85); // Second QR code
  
      pdf.save("menu.pdf");
    };
  
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };
  


  return (
    <div className="flex flex-col min-h-screen text-bgGreen">
      <Navbar active="items" />
      <div className="flex flex-col justify-center items-center min-h-[100vh]">
        <h2 className="text-2xl font-bold mb-4">Scan to View Menu</h2>
        
        {userId && (
          <div ref={qrRef} className="bg-white p-6 rounded-lg shadow-lg">
            <QRCodeSVG
              value={`https://qr-menugen.web.app/previewext/${userId}`}
              size={300}
            />
          </div>
        )}
        
        <div className="flex flex-wrap m-4 space-x-4 justify-center items-arround">
          <button
            onClick={generatePDF}
            className="bg-blue text-textWhite px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Download PDF
          </button>
      
          <FacebookShareButton
            url={`https://qr-menugen.web.app/previewext/${userId}`}
            className="bg-blue text-textWhite  px-4 py-2 rounded-md hover:bg-blue-800 inline-block"
          >
            Share on Facebook
          </FacebookShareButton>
          <TwitterShareButton
            url={`https://qr-menugen.web.app/previewext/${userId}`}
            className="bg-blue text-textWhite  px-4 py-2 rounded-md hover:bg-blue-600 inline-block"
          >
            Share on Twitter
          </TwitterShareButton>
        </div>
      </div>
    </div>
  );
};

export default QRPage;
