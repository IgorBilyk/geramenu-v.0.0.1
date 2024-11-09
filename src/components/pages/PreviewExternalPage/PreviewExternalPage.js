import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
import { FaArrowUp, FaFish, FaDrumstickBite, FaCarrot, FaLeaf } from "react-icons/fa";

const PreviewExternalPage = () => {
  const { userId } = useParams(); // Extract user ID from URL
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const topRef = useRef(null);

  // Map categories to icons
  const categoryIcons = {
    Fish: FaFish,
    Meat: FaDrumstickBite,
    Vegetables: FaCarrot,
    Vegan: FaLeaf,
    // Add other categories and icons as needed
  };

  useEffect(() => {
    const fetchItems = async () => {
      const itemsRef = collection(db, "menuItems");
      const q = query(itemsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const menuItems = querySnapshot.docs.map((doc) => ({
        id: doc.id, // Use document ID as a unique key
        ...doc.data(),
      }));

      setItems(menuItems);

      const uniqueCategories = [
        ...new Set(menuItems.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);

      // Set initial active category to the first one, if available
      if (uniqueCategories.length > 0) {
        setActiveCategory(uniqueCategories[0]);
      }
    };

    fetchItems();
  }, [userId]);

  const handleScrollToCategory = (category) => {
    setActiveCategory(category); // Update active category directly
  };

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div ref={topRef}>
        {/* Navbar with category buttons */}
        <nav className="fixed top-0 left-0 w-full z-10 bg-gray-300">
          <div className="flex justify-center space-x-4 py-3">
            {categories.map((category) => (
              <button
                key={category} // Ensure unique key for each category button
                onClick={() => handleScrollToCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category
                    ? "bg-blue-500 text-white"
                    : "text-gray-700"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        {/* Content displaying items from only the active category */}
        <div className="container mx-auto pt-20 mt-20">
          <h1 className="text-4xl font-bold mb-8">Menu</h1>
          {activeCategory && (
            <div>
              <h2 className="text-2xl font-bold mb-4">{activeCategory}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items
                  .filter((item) => item.category === activeCategory)
                  .map((item) => (
                    <div key={item.id} className="border p-4 shadow rounded">
                      <div className="w-full h-60 overflow-hidden rounded-lg">
                        <img
                          src={`${item.image}`}
                          alt={item.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <h3 className="text-xl font-semibold mt-4">{item.name}</h3>
                      <p>{item.description}</p>
                      <p className="font-bold">${item.price}</p>

                      {/* Category Icon at the bottom */}
                      <div className="flex justify-end mt-4">
                        {categoryIcons[activeCategory] && (
                          <span className="text-2xl text-gray-500">
                            {React.createElement(categoryIcons[activeCategory])}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* Scroll-to-top button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
        >
          <FaArrowUp />
        </button>
      </div>
    </div>
  );
};

export default PreviewExternalPage;
