import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import { FacebookShareButton, TwitterShareButton } from "react-share";
import Navbar from "../../ui/Navbar";

const QRPage = () => {
  const [userId, setUserId] = useState(null);
  const qrRef = useRef();

  useEffect(() => {
    // Fetch the user ID from local storage
    const storedUserId = localStorage.getItem("userID");
    setUserId(storedUserId);
  }, []);

  // Function to generate a PDF with the QR code
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
      pdf.text("Scan the QR Code to view the menu:", 10, 10);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 15, 40, 180, 160);
      pdf.save("menu.pdf");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Function to print the QR code
  const printQRCode = () => {
    const qrCodeSVG = qrRef.current.querySelector("svg");
    const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL("image/png");
      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Print QR Code</title>
          </head>
          <body>
            <img src="${dataUrl}" style="width: 200px; height: 200px;" />
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Navbar active="items" />
      <h2 className="text-2xl font-bold mb-4">Scan to View Menu</h2>
      
      {userId && (
        <div ref={qrRef} className="bg-white p-6 rounded-lg shadow-lg">
          <QRCodeSVG
            value={`https://yourapp.com/previewext/${userId}`}
            size={200}
          />
        </div>
      )}
      
      <div className="mt-4 space-x-4">
        <button
          onClick={generatePDF}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Download PDF
        </button>
        <button
          onClick={printQRCode}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Print QR Code
        </button>
        <FacebookShareButton
          url={`https://yourapp.com/previewext/${userId}`}
          className="inline-block"
        >
          <button className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800">
            Share on Facebook
          </button>
        </FacebookShareButton>
        <TwitterShareButton
          url={`https://yourapp.com/previewext/${userId}`}
          className="inline-block"
        >
          <button className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
            Share on Twitter
          </button>
        </TwitterShareButton>
      </div>
    </div>
  );
};

export default QRPage;
