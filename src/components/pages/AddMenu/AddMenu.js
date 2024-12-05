import { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase/firebase";

import imageCompression from "browser-image-compression";

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

const placeholderImage = "https://via.placeholder.com/150";

const AddMenu = ({
  itemToEdit,
  onClose,
  onUpdateItems,
  availableCategories,
}) => {
  const [item, setItem] = useState({
    category: "",
    name: "",
    price: "",
    description: "",
    options: "",
    image: "https://via.placeholder.com/150",
    outOfStock: false,
    quantity: "",
    unit: "pcs",
  });

  const [imagePreview, setImagePreview] = useState(placeholderImage);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filteredCategories, setFilteredCategories] = useState([]);

  console.log(itemToEdit);
  // Initialize form for editing
  useEffect(() => {
    if (itemToEdit) {
      setItem({
        category: itemToEdit.category || "",
        name: itemToEdit.name || "",
        price: itemToEdit.price || "",
        description: itemToEdit.description || "",
        options: itemToEdit.options || "",
        image: itemToEdit.image || imagePreview,
        outOfStock: itemToEdit.outOfStock || false,
        quantity: itemToEdit.quantity || "",
        unit: itemToEdit.unit || "pcs",
      });
      setVariants(itemToEdit.variants || []);
      setImagePreview(itemToEdit.image || placeholderImage);
    }
  }, [itemToEdit]);

  // Handle file selection and preview
  const handleFileChange = async (e) => {
    /*  const file = e.target.files[0];
    const maxSizeMB = 3;

    if (file) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`Arquivo excede o tamanho máximo de ${maxSizeMB} MB.`);
        return;
      }
      setItem({ ...item, image: file });
      setImagePreview(URL.createObjectURL(file));
    } */
    const file = e.target.files[0];

    if (!file) return;

    const maxSizeMB = 3; // Maximum file size in MB before compression

    try {
      // Compression options
      const options = {
        maxSizeMB: 0.5, // Target size in MB (adjust as needed)
        maxWidthOrHeight: 1024, // Resize to fit within these dimensions
        useWebWorker: true, // Use web workers for faster compression
      };

      // Compress the image
      const compressedFile = await imageCompression(file, options);

      // Update state with compressed file
      setItem({ ...item, image: compressedFile });

      // Preview the compressed image
      const compressedPreview = URL.createObjectURL(compressedFile);
      setImagePreview(compressedPreview);
    } catch (error) {
      console.error("Error while compressing the image:", error);
      toast.error("Erro ao compactar imagem. Tente novamente.");
    }
  };

  // Add a new variant
  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { name: "", price: "", quantity: "", unit: "pcs" },
    ]);
  };

  // Remove a variant
  const handleRemoveVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Update specific fields of a variant
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  // Handle category autocomplete
  const handleCategoryChange = (e) => {
    const input = e.target.value;
    setItem({ ...item, category: input });

    setFilteredCategories(
      input
        ? availableCategories.filter((cat) =>
            cat.toLowerCase().includes(input.toLowerCase())
          )
        : []
    );
  };

  const selectCategory = (category) => {
    setItem({ ...item, category });
    setFilteredCategories([]);
  };

  // Upload item to Firestore and Storage
  /* const handleUpload = async () => {
    setError("");

    if (!item.category || !item.name || !item.price) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (variants.some((v) => !v.name || !v.price || !v.quantity)) {
      setError("Por favor, preencha todos os campos das variantes.");
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Usuário não autenticado.");

      let imageUrl = placeholderImage;

      if (item.image) {
        const imageRef = ref(
          storage,
          `menuImages/${userId}/${item.image.name}`
        );
        await uploadBytes(imageRef, item.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const itemData = {
        ...item,
        image: imageUrl,
        userId,
        variants,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      };

      if (itemToEdit?.id) {
        await setDoc(doc(db, "menuItems", itemToEdit.id), itemData, {
          merge: true,
        });
      } else {
        await addDoc(collection(db, "menuItems"), itemData);
      }

      successMessage("Item adicionado com sucesso!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Falha ao adicionar item. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }; */

  const handleUpload = async () => {
    setError("");

    if (!item.category || !item.name || !item.price) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (variants.some((v) => !v.name || !v.price || !v.quantity)) {
      setError("Por favor, preencha todos os campos das variantes.");
      return;
    }

    setLoading(true);

    try {
      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("Usuário não autenticado.");

      let imageUrl = itemToEdit?.image || placeholderImage; // Default to existing image if editing

      if (item.image && typeof item.image !== "string") {
        // If a new image is selected, upload it
        const imageRef = ref(
          storage,
          `menuImages/${userId}/${item.image.name}`
        );
        await uploadBytes(imageRef, item.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      const itemData = {
        ...item,
        image: imageUrl,
        userId,
        variants,
        createdAt: serverTimestamp(),
        modifiedAt: serverTimestamp(),
      };

      if (itemToEdit?.id) {
        // Editing an existing item
        await setDoc(doc(db, "menuItems", itemToEdit.id), itemData, {
          merge: true,
        });
      } else {
        // Adding a new item
        await addDoc(collection(db, "menuItems"), itemData);
      }

      successMessage("Item adicionado com sucesso!");
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Falha ao adicionar item. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Reset form fields
  const resetForm = () => {
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
    setImagePreview(placeholderImage);
    setVariants([]);
    setError("");
  };

  return (
    <div className="min-h-[100vh] min-w-[100%] bg-gray p-3 rounded-md flex items-center justify-center flex-col">
      <Button title="Fechar" styles="bg-red text-textWhite" onPress={onClose} />

      <div className="flex flex-col items-center mt-5">
        <div className="w-full max-w-md bg-textWhite p-6 shadow-md rounded-md max-h-[80vh] overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-6">
            {itemToEdit ? "Editar Item" : "Adicionar Item"}
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

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
                <ul className="absolute z-10 w-full bg-textWhite border mt-1 max-h-40 overflow-y-auto">
                  {filteredCategories.map((cat, index) => (
                    <li
                      key={index}
                      onClick={() => selectCategory(cat)}
                      className="p-2 hover:bg-bgGreen cursor-pointer"
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
              value={item.name}
              onChange={(e) => setItem({ ...item, name: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <input
              type="number"
              placeholder="Preço"
              value={item.price}
              onChange={(e) => setItem({ ...item, price: e.target.value })}
              className="w-full p-3 border rounded-md"
            />
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Quantidade"
                value={item.quantity}
                onChange={(e) => setItem({ ...item, quantity: e.target.value })}
                className="w-full p-3 border rounded-md"
                required
              />
              <select
                value={item.unit}
                onChange={(e) => setItem({ ...item, unit: e.target.value })}
                className="p-3 border rounded-md"
              >
                <option value="pcs">pcs</option>
                <option value="g">g</option>
                <option value="ml">ml</option>
                <option value="pessoas">pessoas</option>
              </select>
            </div>
            <textarea
              placeholder="Descrição (Opcional)"
              value={item.description}
              onChange={(e) =>
                setItem({ ...item, description: e.target.value })
              }
              className="w-full p-3 border rounded-md"
            />
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-3 border rounded-md"
            />
            <div className="mt-3">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-40 object-cover rounded-md"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={item.outOfStock}
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
                  onChange={(e) =>
                    handleVariantChange(index, "name", e.target.value)
                  }
                  className="w-full p-2 border rounded-md"
                />
                <input
                  type="number"
                  placeholder="Preço"
                  value={variant.price}
                  onChange={(e) =>
                    handleVariantChange(index, "price", e.target.value)
                  }
                  className="w-full p-2 border rounded-md"
                />
                <div className="flex">
                  <input
                    type="number"
                    placeholder="Quantidade"
                    value={variant.quantity}
                    onChange={(e) =>
                      handleVariantChange(index, "quantity", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                  <select
                    value={variant.unit}
                    onChange={(e) =>
                      handleVariantChange(index, "unit", e.target.value)
                    }
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
                  className="bg-red text-textWhite p-2 rounded-lg hover:underline text-sm mt-1"
                >
                  Remover Opção
                </button>
              </div>
            ))}

            <button
              onClick={handleAddVariant}
              className="w-full mt-3 bg-blue text-textWhite rounded-md py-2"
            >
              + Adicionar Opção
            </button>

            <button
              onClick={handleUpload}
              disabled={loading}
              className={`w-full py-3 bg-bgGreen text-textWhite rounded-md hover:bg-blue-600 ${
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
