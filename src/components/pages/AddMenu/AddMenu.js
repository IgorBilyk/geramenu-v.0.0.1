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

const AddMenu = ({ itemToEdit, onClose, onUpdateItems, availableCategories }) => {
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
  const [imagePreview, setImagePreview] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

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
      if (itemToEdit.image) {
        setImagePreview(itemToEdit.image); // Assuming `itemToEdit.image` is a URL
      }
    }
  }, [itemToEdit]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItem({ ...item, image: file });
      setImagePreview(URL.createObjectURL(file)); // Update preview for the selected file
    }
  };

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
console.log('image from add Item',item.image)
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
      successMessage("Item added successfully!");

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
      setImagePreview(null); // Reset image preview

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

  // Handle category input change with autocomplete
  const handleCategoryChange = (e) => {
    const input = e.target.value;
    setItem({ ...item, category: input });

    if (input) {
      const filtered = availableCategories.filter((cat) =>
        cat.toLowerCase().includes(input.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories([]);
    }
  };

  const selectCategory = (category) => {
    setItem({ ...item, category });
    setFilteredCategories([]);
  };

  return (
    <div className="min-h-[80%] ">
      <Button title="Close" styles="bg-red-500" onPress={onClose} />

      <div className="flex flex-col items-center mt-5">
        <div className="w-full max-w-md bg-white p-6 shadow-md rounded-md max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">Adicionar Menu Item</h2>
          {error && <p className="text-red-500 mb-4 p-1">{error}</p>}

          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Categoria"
                value={item.category || ""}
                onChange={handleCategoryChange}
                className="w-full p-3 border rounded-md"
              />
              {filteredCategories.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto">
                  {filteredCategories.map((cat, index) => (
                    <li
                      key={index}
                      onClick={() => selectCategory(cat)}
                      className="p-2 hover:bg-gray-200 cursor-pointer"
                    >
                      {cat}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <input
              type="text"
              placeholder="Nome"
              value={item.name || ""}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="number"
              placeholder="Preço"
              value={item.price || ""}
              onChange={(e) => setItem({ ...item, price: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <textarea
              placeholder="Descrição (Opcional)"
              value={item.description || ""}
              onChange={(e) => setItem({ ...item, description: e.target.value })}
              className="w-full p-3 border rounded-md"
            ></textarea>
          {/*   <input
              type="file"
              onChange={(e) => setItem({ ...item, image: e.target.files[0] })}
              className="w-full p-3 border rounded-md"
            /> */}
               <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-md"
            />
            {imagePreview && (
              <div className="mt-3">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md"
                />
              </div>
            )}
                <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Quantidade"
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
                <option value="pessoas">pessoas</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.outOfStock || false}
                onChange={(e) =>
                  setItem({ ...item, outOfStock: e.target.checked })
                }
                className="mr-2"
              />
              
              <label>Não em Stock</label>
            </div>

            <h3 className="text-xl font-semibold mt-4">Opções</h3>
            {variants.map((variant, index) => (
              <div key={index} className="border p-3 rounded-md mt-2 space-y-2">
                <input
                  type="text"
                  placeholder="Nome"
                  value={variant.name}
                  onChange={(e) => handleVariantChange(index, "name", e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="number"
                  placeholder="Preço"
                  value={variant.price}
                  onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
                <div className="flex">
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={variant.quantity}
                    onChange={(e) => handleVariantChange(index, "quantity", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                  <select
                    value={variant.unit}
                    onChange={(e) => handleVariantChange(index, "unit", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="pcs">pcs</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="pessoas">pessoas</option>
                  </select>
                </div>
                <button
                  onClick={() => handleRemoveVariant(index)}
                  className="bg-red-500 text-white p-2 rounded-lg hover:underline text-sm mt-1"
                >
                  Remover Opção
                </button>
              </div>
            ))}
            <button
              onClick={handleAddVariant}
              className="w-full mt-3 bg-green-500 text-white rounded-md py-2"
            >
              + Adicionar Opção
            </button>

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Uploading..." : "Adicionar Item"}
            </button>

            <Toaster />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddMenu;
