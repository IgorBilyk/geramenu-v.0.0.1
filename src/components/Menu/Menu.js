// Menu.js
import { useState } from 'react';
import { db, storage, auth } from '../../firebase/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Menu = () => {
  const [item, setItem] = useState({ category: '', name: '', price: '', description: '', options: '', image: null });
  const navigate = useNavigate();

  const handleUpload = async () => {
    try {
      const imageRef = ref(storage, `images/${item.image.name}`);
      await uploadBytes(imageRef, item.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, 'menuItems'), {
        ...item,
        image: imageUrl,
        userId: auth.currentUser.uid, // Store user's unique ID
      });

      alert('Item added successfully!');
    } catch (error) {
      console.error('Error adding item:', error.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div>
      <button onClick={handleSignOut}>Sign Out</button>
      <h2>Add Menu Item</h2>
      <input type="text" placeholder="Category" onChange={(e) => setItem({ ...item, category: e.target.value })} />
      <input type="text" placeholder="Name" onChange={(e) => setItem({ ...item, name: e.target.value })} />
      <input type="number" placeholder="Price" onChange={(e) => setItem({ ...item, price: e.target.value })} />
      <textarea placeholder="Description" onChange={(e) => setItem({ ...item, description: e.target.value })}></textarea>
      <input type="file" onChange={(e) => setItem({ ...item, image: e.target.files[0] })} />
      <button onClick={handleUpload}>Add Item</button>
    </div>
  );
};

export default Menu;
