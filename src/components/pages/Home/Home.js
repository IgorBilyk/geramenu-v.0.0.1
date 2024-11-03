import { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebase";
import { auth } from "../../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

import { Toaster, toast } from "sonner";

import { useParams } from "react-router-dom";
import Navbar from "../../ui/Navbar";
import { FaArrowUp, FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import AddMenu from "../AddMenu/AddMenu";
import Button from "../../ui/Button";

const Home = () => {
  const { userId } = useParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // To track item for editing
  const categoryRefs = useRef({});
  const topRef = useRef(null);

  useEffect(() => {
    const fetchItems = async () => {
      const userId = auth?.currentUser?.uid || localStorage.getItem("userID");
      const itemsRef = collection(db, "menuItems");
      const q = query(itemsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const menuItems = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));

      setItems(menuItems);

      const uniqueCategories = [
        ...new Set(menuItems.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    };

    fetchItems();
  }, [userId]);

  const handleScrollToCategory = (category) => {
    const element = categoryRefs?.current[category];
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setActiveCategory(category);
  };

  const handleScroll = () => {
    const categoryElements = categories?.map(
      (category) => categoryRefs?.current[category]
    );

    categoryElements.forEach((element, index) => {
      const bounding = element.getBoundingClientRect();
      if (bounding.top >= 0 && bounding.top <= window.innerHeight / 2) {
        setActiveCategory(categories[index]);
      }
    });
  };

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const openModal = (item = null) => {
    setSelectedItem(item); // Set the selected item for editing
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "menuItems", itemId));
      toast.success("Item has been deleted!", {
        unstyled: true,
        classNames: {
          toast: "bg-white rounded-xl p-5",
          title: "text-green-300 text-xl",
          success: 'text-[#8FBC8B]',
        },
      })
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const handleUpdateItems = (newItem) => {
    if (selectedItem) {
      // Edit Mode: Update the existing item
      setItems((prevItems) =>
        prevItems.map((item) => (item.id === newItem.id ? newItem : item))
      );
    } else {
      // Add Mode: Add a new item
      setItems((prevItems) => [...prevItems, newItem]);
    }
    closeModal();
  };

  return (
    <div>
      <Navbar />
      <div ref={topRef}>
        <nav className="sticky top-0 left-0 w-full bg-gray-800 shadow-lg z-10">
          <div className="flex justify-center space-x-4 py-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleScrollToCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category
                    ? "bg-blue-500 text-white"
                    : "text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>
        <div className="container mx-auto pt-20 mt-20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Menu</h1>
            <Button title="Add Item" styles="" onPress={() => openModal()} />
          </div>
          {items.length === 0 && <p>No Items</p>}
          {categories.map((category) => (
            <div
              key={category}
              ref={(el) => (categoryRefs.current[category] = el)}
            >
              {/* <h2 className="text-2xl font-bold mb-4">{category}</h2> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items
                  ?.filter((item) => item.category === category)
                  ?.map((item) => (
                    <div key={item.id} className="border p-4 shadow rounded">
                      <div className="relative">
                        <div className="w-full h-48 overflow-hidden rounded-lg">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <FaEdit
                            onClick={() => openModal(item)}
                            className="text-gray-700 cursor-pointer"
                          />
                          <FaTrash
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-500 cursor-pointer"
                          />
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold mt-4">
                        {item.name}
                      </h3>
                      <p>{item.description}</p>
                      <p className="font-bold">${item.price}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
        >
          <FaArrowUp />
        </button>
        <Toaster />
        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <AddMenu
                itemToEdit={selectedItem}
                onClose={closeModal}
                onUpdateItem={handleUpdateItems}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
