import { useState, useEffect, useRef } from "react";
import { db, auth } from "../../../firebase/firebase";

import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";

import { Toaster } from "sonner";
import { useParams } from "react-router-dom";
import Navbar from "../../ui/Navbar";
import { FaArrowUp } from "react-icons/fa";
import AddMenu from "../AddMenu/AddMenu";

import CustomButton from "../../ui/Button";

import { successMessage } from "../../../handlers/toastHandler";
import CardComponent from "../PreviewExternalPage/CardComponent";






const Home = () => {
  const [userId, setUserId] = useState(
    auth?.currentUser?.uid || localStorage.getItem("userID")
  );
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null); // State for zoomed image
  const categoryRefs = useRef({});
  const topRef = useRef(null);

  /* window.location.assign(session.url); */

  useEffect(() => {
    const userId = auth?.currentUser?.uid || localStorage.getItem("userID");
    const itemsRef = collection(db, "menuItems");
    const q = query(itemsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const menuItems = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setItems(menuItems);

      const uniqueCategories = [
        ...new Set(menuItems.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    });

    return () => unsubscribe();
  }, [userId]);

  const handleScrollToCategory = (category) => {
    const element = categoryRefs?.current[category];
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setActiveCategory(category);
  };

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const openModal = (item = null) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Tem certeza de que deseja remover este item?")) {
      await deleteDoc(doc(db, "menuItems", itemId));
      successMessage("Item foi removido!");
    }
  };

  // Set up IntersectionObserver to highlight the active category as you scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const category = entry.target.getAttribute("data-category");
            setActiveCategory(category);
          }
        });
      },
      {
        threshold: 0.5, // Adjust as needed for visibility
      }
    );

    // Observe each category section
    Object.values(categoryRefs.current).forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    // Cleanup on unmount
    return () => observer.disconnect();
  }, [categories]);

  return (
    <div>
      <div ref={topRef}>
        <div className="sticky top-0 z-10">
          <Navbar userId={userId} />
          <nav className="sticky top-[64px] z-40 bg-gray shadow-lg px-4 py-2">
            <div className="flex flex-wrap justify-center gap-2 md:gap-4 py-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleScrollToCategory(category)}
                  className={`px-4 py-2 rounded-xl border-2 ${
                    activeCategory === category
                      ? "bg-bgGreen text-textWhite"
                      : "text-bgGreen"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </nav>
          <div className="container mx-auto pt-">
            <div className="flex justify-end items-center mb-8 mx-2">
              <CustomButton
                title="Adicionar"
                onPress={() => openModal()}
                styles="m-5 bg-bgGreen text-textWhite"
              />
            </div>
          </div>
        </div>

        {items.length === 0 && (
          <p className="text-center font-medium">No Items</p>
        )}

        {items.length > 0 && (
          <h1 className="text-4xl font-bold mx-[100px]">Ementa</h1>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((category) =>
            /*         <div
          key={category}
          ref={(el) => (categoryRefs.current[category] = el)}
          data-category={category}
          className="my-8"
        >
          <div className="flex flex-col"> */
            items
              .filter((item) => item.category === category)
              .map((item) => (
                <CardComponent
                  item={item}
                  key={item.id}
                  setZoomedImage={setZoomedImage}
                  openModal={openModal}
                  handleDeleteItem={handleDeleteItem}
                  external={false}
                />
              ))
            /*     </div>
        </div> */
          )}
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-bgGreen text-textWhite shadow-lg hover:bg-blue-600"
      >
        <FaArrowUp />
      </button>
      <div className="bg-bgGreen">
        <Toaster />
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded shadow-lg max-w-md w-full">
            <AddMenu
              itemToEdit={selectedItem}
              onClose={closeModal}
              availableCategories={categories}
            />
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-bgGreen bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setZoomedImage(null)} // Close on click
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default Home;
