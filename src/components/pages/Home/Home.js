import { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebase";
import { auth } from "../../../firebase/firebase";
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
/* import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react"; */
import { successMessage } from "../../../handlers/toastHandler";
import CardComponent from "../PreviewExternalPage/CardComponent";

const Home = () => {
  const { userId } = useParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [zoomedImage, setZoomedImage] = useState(null); // State for zoomed image
  const categoryRefs = useRef({});
  const topRef = useRef(null);

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
          <Navbar />
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
        <div className="grid md:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category}
              ref={(el) => (categoryRefs.current[category] = el)}
              data-category={category}
              className="my-8"
            >
              <div className="flex justify-center items-center flex-col">
                {items
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
                    /*  <Card
                    clasName="w-full sm:w-80 md:w-96 my-4 px-5 mx-auto shadow-lg rounded-lg border"
                    key={item.id}
                  >
                    <CardHeader
                      shadow={false}
                      floated={false}
                      className="h-48 sm:h-56 bg-gray-300"
                    >
                      <img
                        src={item?.image || ""}
                        alt={item.name}
                        className="h-full w-full object-cover rounded-t-lg cursor-pointer"
                        onClick={() => setZoomedImage(item.image)} // Set zoomed image on click
                      />
                    </CardHeader>
                    <CardBody>
                      <div className="mb-2 flex flex-col sm:flex-row items-center justify-between border-b-2 pb-2">
                        <Typography color="blue-gray" className="font-medium text-lg sm:text-xl">
                          {item.name}
                        </Typography>
                        <div className="text-center sm:text-right mt-2 sm:mt-0">
                          <Typography color="blue-gray" className="font-medium text-base">
                            {item.price}&#8364;
                          </Typography>
                          <div className="flex justify-center sm:justify-end mt-1">
                            <Typography
                              color="blue-gray"
                              className="font-small mr-2 text-sm"
                            >
                              {item.quantity}
                            </Typography>
                            <Typography color="blue-gray" className="font-small text-sm">
                              {item.unit}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                    <div className="flex flex-col sm:flex-row justify-around gap-4 pb-4 px-4">
                      <CustomButton
                        title="Editar"
                        onPress={() => openModal(item)}
                        styles="w-full sm:w-auto"
                      />
                      <CustomButton
                        title="Remover"
                        onPress={() => handleDeleteItem(item?.id)}
                        styles="bg-red-500 w-full sm:w-auto"
                      />
                    </div>
                  </Card> */
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={scrollToTop}
        className="fixed bottom-4 right-4 p-3 rounded-full bg-bgGreen text-textWhite shadow-lg hover:bg-blue-600"
      >
        <FaArrowUp />
      </button>
      <Toaster />

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
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
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
