import { useState, useEffect, useRef } from 'react';
import { db } from '../../../firebase/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import Navbar from '../../ui/Navbar';

const QRPage = () => {
  const [items, setItems] = useState([]);
  const qrRef = useRef();

  useEffect(() => {
    const fetchItems = async () => {
      const q = query(collection(db, 'menuItems'));
      const querySnapshot = await getDocs(q);
      setItems(querySnapshot.docs.map(doc => doc.data()));
    };

    fetchItems();
  }, []);

  // Convert the SVG QR code to Data URL for PDF
  const generatePDF = (qrURL) => {
    const qrCodeSVG = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // Create the PDF
      const pdf = new jsPDF();
      pdf.text('Scan the QR Code to view the menu:', 10, 10);
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 15, 40, 180, 160);
      pdf.save('menu.pdf');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData); // Convert SVG to base64
  };

  // Function to open print dialog with QR code
  const printQRCode = (qrURL) => {
    const qrCodeSVG = qrRef.current.querySelector('svg');
    const svgData = new XMLSerializer().serializeToString(qrCodeSVG);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = function() {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const dataUrl = canvas.toDataURL('image/png');

      const printWindow = window.open('', '_blank');
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

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  return (
    <div>
      <Navbar active="items" />
      <h2>Menu Items</h2>
      {items.map((item, index) => (
        <div key={index}>
                    <div ref={qrRef}>
            <QRCodeSVG value={`https://yourapp.com/menu/${item.userId}`} />
          </div>
          <button onClick={() => generatePDF(`https://yourapp.com/menu/${item.userId}`)}>
            Download PDF
          </button>
          <button onClick={() => printQRCode(`https://yourapp.com/menu/${item.userId}`)}>
            Print QR Code
          </button>
          <FacebookShareButton url={`https://yourapp.com/menu/${item.userId}`}>
            Share on Facebook
          </FacebookShareButton>
          <TwitterShareButton url={`https://yourapp.com/menu/${item.userId}`}>
            Share on Twitter
          </TwitterShareButton>
        </div>
      ))}
    </div>
  );
};

export default QRPage;
