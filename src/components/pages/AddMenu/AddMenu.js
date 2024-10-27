import { useState } from "react";
import { db, storage, auth } from "../../../firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Navbar from "../../ui/Navbar";

const AddMenu = () => {
  const [item, setItem] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    options: "",
    image: null,
    outOfStock: false,
    quantity: "",
    unit: "pcs",
  });
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddVariant = () => {
    setVariants([...variants, { name: "", price: "", quantity: "" }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  const handleUpload = async () => {
    setError("");

    // Validation
    if (!item.category || !item.name || !item.price || !item.description) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!item.image) {
      setError("Please upload an image.");
      return;
    }
    if (variants.some((v) => !v.price || !v.quantity)) {
      setError("Please fill out all variant fields.");
      return;
    }

    setLoading(true);

    try {
      const imageRef = ref(storage, `images/${item.image.name}`);
      await uploadBytes(imageRef, item.image);
      const imageUrl = await getDownloadURL(imageRef);

      await addDoc(collection(db, "menuItems"), {
        ...item,
        image: imageUrl,
        userId: auth.currentUser.uid,
        variants,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      });

      alert("Item added successfully!");
      setItem({
        category: "",
        name: "",
        price: "",
        description: "",
        options: "",
        image: null,
        outOfStock: false,
        quantity: "",
        unit: "pcs",
      });
      setVariants([]);
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar active="menu" />

      <div className="flex flex-col items-center mt-10">
        <div className="w-full max-w-md bg-white p-6 shadow-md rounded-md">
          <h2 className="text-2xl font-semibold mb-6">Add Menu Item</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

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
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.outOfStock}
                onChange={(e) =>
                  setItem({ ...item, outOfStock: e.target.checked })
                }
                className="mr-2"
              />
              <label>Out of Stock</label>
            </div>

            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                className="w-full p-3 border rounded-md"
              />
              <select
                value={item.unit}
                onChange={(e) => setItem({ ...item, unit: e.target.value })}
                className="p-3 border rounded-md"
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
              </select>
            </div>

            <h3 className="text-xl font-semibold mt-6">Variants</h3>
            {variants.map((variant, index) => (
              <div key={index} className="space-y-2">
                <input
                  type="text"
                  placeholder="Variant Name (optional)"
                  value={variant.name}
                  onChange={(e) =>
                    handleVariantChange(index, "name", e.target.value)
                  }
                  className="w-full p-3 border rounded-md"
                />
                <input
                  type="number"
                  placeholder="Price"
                  value={variant.price}
                  onChange={(e) =>
                    handleVariantChange(index, "price", e.target.value)
                  }
                  className="w-full p-3 border rounded-md"
                  required
                />
                <input
                  type="number"
                  placeholder="Quantity"
                  value={variant.quantity}
                  onChange={(e) =>
                    handleVariantChange(index, "quantity", e.target.value)
                  }
                  className="w-full p-3 border rounded-md"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(index)}
                  className="text-red-500 underline"
                >
                  Remove Variant
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={handleAddVariant}
              className="w-full bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 mt-4"
            >
              Add Variant
            </button>

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

export default AddMenu;
