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

  useEffect(() => {
    if (itemToEdit) {
      // Set default values for missing fields in itemToEdit to prevent undefined values
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

      toast.success("Item has been added!", {
        unstyled: true,
        classNames: {
          toast: "bg-white rounded-xl p-5",
          title: "text-green-300 text-xl",
          success: "text-[#8FBC8B]",
        },
      });
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
      <Button title="Close" styles="bg-red-500 m-4" onPress={onClose}/>

      <div className="flex flex-col items-center mt-20">
        <div className="w-full max-w-md bg-white p-6 shadow-md rounded-md">
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
              </select>
            </div>

            {/* Variants handling omitted for brevity */}

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
