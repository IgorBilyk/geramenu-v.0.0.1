import { useState } from "react";
import { db, storage, auth } from "../../../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../../ui/Navbar";

const Menu = () => {
  const [item, setItem] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    options: "",
    image: null,
  });
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!item.image) {
      alert("Please upload an image.");
      return;
    }

    setLoading(true); // Set loading state
    try {
      const imageRef = ref(storage, `images/${item.image.name}`);
      await uploadBytes(imageRef, item.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "menuItems"), {
        ...item,
        image: imageUrl,
        userId: auth.currentUser.uid, // Store user's unique ID
      });

      alert("Item added successfully!");
      setItem({
        category: "",
        name: "",
        price: "",
        description: "",
        options: "",
        image: null,
      }); // Clear form fields
    } catch (error) {
      console.error("Error adding item:", error.message);
    } finally {
      setLoading(false); // Remove loading state
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="menu" />

      {/* Add Menu Item Form */}
      <div className="flex flex-col items-center mt-10">
        <div className="w-full max-w-md bg-white p-6 shadow-md rounded-md">
          <h2 className="text-2xl font-semibold mb-6">Add Menu Item</h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Category"
              value={item.category}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="text"
              placeholder="Name"
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => setItem({ ...item, price: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <textarea
              placeholder="Description"
              value={item.description}
              onChange={(e) =>
                setItem({ ...item, description: e.target.value })
              }
              className="w-full p-3 border rounded-md"
            ></textarea>
            <input
              type="file"
              onChange={(e) => setItem({ ...item, image: e.target.files[0] })}
              className="w-full p-3 border rounded-md"
            />

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Add Item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;
