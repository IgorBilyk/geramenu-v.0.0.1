import { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase/firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Toaster, toast } from "sonner";
import Button from "../../ui/Button";
import { successMessage } from "../../../handlers/toastHandler";

const AddMenu = ({ itemToEdit, onClose, onUpdateItems }) => {
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
    setVariants([...variants, { name: "", price: "", quantity: "", unit: "pcs" }]);
  };

  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  useEffect(() => {
    if (itemToEdit) {
      setItem({
        category: itemToEdit.category || "",
        name: itemToEdit.name || "",
        price: itemToEdit.price || "",
        description: itemToEdit.description || "",
        options: itemToEdit.options || "",
        image: itemToEdit.image || null,
        outOfStock: itemToEdit.outOfStock || false,
        quantity: itemToEdit.quantity || "",
        unit: itemToEdit.unit || "pcs",
      });
      setVariants(itemToEdit.variants || []);
    }
  }, [itemToEdit]);

  const handleUpload = async () => {
    setError("");

    if (!item.category || !item.name || !item.price ) {
      setError("Please fill out all required fields.");
      return;
    }
    if (!item.image) {
      setError("Please upload an image.");
      return;
    }
    if (variants.some((v) => !v.name || !v.price || !v.quantity)) {
      setError("Please fill out all variant fields.");
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const imageRef = ref(storage, `menuImages/${userId}/${item.image.name}`);
      await uploadBytes(imageRef, item.image);
      const imageUrl = await getDownloadURL(imageRef);

      const itemData = {
        ...item,
        image: imageUrl,
        userId,
        variants,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      };

      if (itemToEdit?.id) {
        const itemDoc = doc(db, "menuItems", itemToEdit.id);
        await setDoc(itemDoc, itemData, { merge: true });
      } else {
        await addDoc(collection(db, "menuItems"), itemData);
      }
      successMessage()

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
      onClose();
    } catch (error) {
      console.error("Error adding item:", error);
      setError("Failed to add item. Please try again.");
      toast.error("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Button title="Close" styles="bg-red-500 m-4" onPress={onClose} />

      <div className="flex flex-col items-center mt-20">
        {/* Modal container with scrollable content */}
        <div className="w-full max-w-md bg-white p-6 shadow-md rounded-md max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">Add Menu Item</h2>
          {error && <p className="text-red-500 mb-4 p-1">{error}</p>}

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Category"
              value={item.category || ""}
              onChange={(e) => setItem({ ...item, category: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="text"
              placeholder="Name"
              value={item.name || ""}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="number"
              placeholder="Price"
              value={item.price || ""}
              onChange={(e) => setItem({ ...item, price: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <textarea
              placeholder="Description"
              value={item.description || ""}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
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
                checked={item.outOfStock || false}
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
                value={item.quantity || ""}
                onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                className="w-full p-3 border rounded-md"
              />
              <select
                value={item.unit || "pcs"}
                onChange={(e) => setItem({ ...item, unit: e.target.value })}
                className="p-3 border rounded-md"
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="persons">pessoas</option>
              </select>
            </div>

            <div>
              <h3 className="text-xl font-semibold mt-4">Variants</h3>
              {variants.map((variant, index) => (
                <div key={index} className="flex flex-col mt-2">
                  <div>
                    <input
                      type="text"
                      placeholder="Variant Name"
                      value={variant.name}
                      onChange={(e) =>
                        handleVariantChange(index, "name", e.target.value)
                      }
                      className="w-full p-2 border rounded-md my-2"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      value={variant.price}
                      onChange={(e) =>
                        handleVariantChange(index, "price", e.target.value)
                      }
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={variant.quantity}
                      onChange={(e) =>
                        handleVariantChange(index, "quantity", e.target.value)
                      }
                      className="w-full p-2 border rounded-md my-2"
                    />
                    <select
                      value={variant.unit || "pcs"}
                      onChange={(e) =>
                        handleVariantChange(index, "unit", e.target.value)
                      }
                      className="p-2 border rounded-md my-2"
                    >
                      <option value="pcs">pcs</option>
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="persons">pessoas</option>
                    </select>
                  </div>
                  <button
                    onClick={() => handleRemoveVariant(index)}
                    className="bg-red-500 text-white p-2 rounded-md w-[30%] my-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddVariant}
                className="w-full py-2 mt-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Variant
              </button>
            </div>

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Add Item"}
            </button>

            <Toaster />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;
