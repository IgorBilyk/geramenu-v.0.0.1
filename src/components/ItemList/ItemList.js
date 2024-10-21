// ItemsList.js
import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import {QRCodeSVG} from 'qrcode.react';
import jsPDF from 'jspdf';
import { FacebookShareButton, TwitterShareButton } from 'react-share';

const ItemsList = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const fetchItems = async () => {
      const q = query(collection(db, 'menuItems'));
      const querySnapshot = await getDocs(q);
      setItems(querySnapshot.docs.map(doc => doc.data()));
    };

    fetchItems();
  }, []);

  const generatePDF = (qrURL) => {
    const pdf = new jsPDF();
    pdf.text('Scan the QR Code to view the menu:', 10, 10);
    pdf.addImage(qrURL, 'JPEG', 15, 40, 180, 160);
    pdf.save('menu.pdf');
  };

  return (
    <div>
      <h2>Menu Items</h2>
      {items.map((item, index) => (
        <div key={index}>
          <h3>{item.name}</h3>
          <QRCodeSVG value={`https://yourapp.com/menu/${item.userId}`} />
          <button onClick={() => generatePDF(`https://yourapp.com/menu/${item.userId}`)}>Download PDF</button>
          <FacebookShareButton url={`https://yourapp.com/menu/${item.userId}`}>Share on Facebook</FacebookShareButton>
          <TwitterShareButton url={`https://yourapp.com/menu/${item.userId}`}>Share on Twitter</TwitterShareButton>
        </div>
      ))}
    </div>
  );
};

export default ItemsList;
