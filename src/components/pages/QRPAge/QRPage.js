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

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 20, 20, 65, 65);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 125, 20, 65, 65);

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 20, 95, 65, 65);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 125, 95, 65, 65);

      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 20, 175, 65, 65);
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 125, 175, 65, 65);


      pdf.save("menu.pdf");
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };


  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Navbar active="items" />
      <div className="flex flex-col justify-center items-center min-h-[100vh]">
        <h2 className="text-2xl font-bold mb-4">Scan to View Menu</h2>
        
        {userId && (
          <div ref={qrRef} className="bg-white p-6 rounded-lg shadow-lg">
            <QRCodeSVG
              value={`https://www.google.com/search?q=${userId}`}
              size={300}
            />
          </div>
        )}
        
        <div className="flex flex-wrap m-4 space-x-4 justify-center items-arround">
          <button
            onClick={generatePDF}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Download PDF
          </button>
      
          <FacebookShareButton
            url={`https://yourapp.com/previewext/${userId}`}
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 inline-block"
          >
            Share on Facebook
          </FacebookShareButton>
          <TwitterShareButton
            url={`https://yourapp.com/previewext/${userId}`}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 inline-block"
          >
            Share on Twitter
          </TwitterShareButton>
        </div>
      </div>
    </div>
  );
};

export default QRPage;
