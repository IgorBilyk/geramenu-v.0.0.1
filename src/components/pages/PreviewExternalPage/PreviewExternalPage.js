import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { FaArrowUp } from "react-icons/fa";
import CardComponent from "./CardComponent";
import RestaurantInfo from "./RestaurantInfo";

const PreviewExternalPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [itemsCache, setItemsCache] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // For zoomed image
  const [isInfoExpanded, setIsInfoExpanded] = useState(false); // To toggle expansion

  const containerRef = useRef();

  // Check and set user ID in the URL if missing
  useEffect(() => {
    if (!userId) {
      const currentUserId = auth?.currentUser?.uid || localStorage.getItem("userID");
      if (currentUserId) {
        navigate(`/preview/${currentUserId}`, { replace: true });
      } else {
        console.error("User ID is missing and cannot be set.");
      }
    }
  }, [userId, navigate]);

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const docRef = doc(db, "restaurants", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRestaurantInfo(docSnap.data());
        }
      } catch (error) {
        console.error("Failed to fetch restaurant data:", error);
      }
    };

    if (userId) {
      fetchRestaurantData();
    }
  }, [userId]);

  // Fetch categories and items for the initial active category
  useEffect(() => {
    const fetchCategoriesAndItems = async () => {
      try {
        const itemsRef = collection(db, "menuItems");
        const q = query(itemsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        const menuItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const uniqueCategories = [
          ...new Set(
            menuItems
              .filter((item) => !item.outOfStock)
              .map((item) => item.category)
          ),
        ];

        setCategories(uniqueCategories);

        if (uniqueCategories.length > 0) {
          const initialCategory = uniqueCategories[0];
          setActiveCategory(initialCategory);
          fetchCategoryItems(initialCategory);
        }
      } catch (error) {
        console.error("Failed to fetch categories or items:", error);
      }
    };

    if (userId) {
      fetchCategoriesAndItems();
    }
  }, [userId]);

  // Fetch items for a specific category
  const fetchCategoryItems = async (category) => {
    if (itemsCache[category]) {
      // Load from cache
      setVisibleItems(itemsCache[category]);
      return;
    }

    setIsFetching(true);
    try {
      const itemsRef = collection(db, "menuItems");
      const q = query(
        itemsRef,
        where("userId", "==", userId),
        where("category", "==", category),
        where("outOfStock", "==", false)
      );
      const querySnapshot = await getDocs(q);

      const fetchedItems = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setItemsCache((prev) => ({
        ...prev,
        [category]: fetchedItems,
      }));

      setVisibleItems(fetchedItems);
    } catch (error) {
      console.error("Failed to fetch category items:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    if (category === activeCategory) return; // Prevent redundant re-fetch
    setActiveCategory(category);
    setVisibleItems([]);

    if (itemsCache[category]) {
      // Load from cache
      setVisibleItems(itemsCache[category]);
    } else {
      fetchCategoryItems(category);
    }
  };

  const toggleInfoExpansion = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };

  console.log(categories,'------', visibleItems)
  return (
    <div className="p-3 lg:w-[75%] lg:m-auto font-[1rem]">
      {/* Restaurant Info */}
      <Link to="/" className="bg-bgGreen text-textWhite rounded-lg p-2">
        Home
      </Link>
      <RestaurantInfo
        toggleInfoExpansion={toggleInfoExpansion}
        isInfoExpanded={isInfoExpanded}
        restaurantInfo={restaurantInfo}
      />

      {/* Categories */}
      <nav className="sticky top-0 bg-gray-100 z-10">
        <div className="flex overflow-x-auto py-2 px-2 space-x-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`px-4 py-2 ${
                activeCategory === category
                  ? "bg-bgGreen text-textWhite rounded-lg"
                  : ""
              }`}
            >
              {category} {visibleItems.length > 0 && visibleItems[0].category === category && `(${visibleItems.length})` }
            </button>
          ))}
        </div>
      </nav>

      {/* Items */}
      <div
        ref={containerRef}
        className="container mx-auto h-[70vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {visibleItems.map((item) => (
          <CardComponent
            key={item.id}
            item={item}
            external="true"
            setZoomedImage={(image) => setZoomedImage(image)}
          />
        ))}
        {isFetching && <p>Loading items...</p>}
      </div>

      {/* Zoomed Image */}
      {zoomedImage && (
        <div
          className="fixed inset-0 bg-bgGreen bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setZoomedImage(null)}
        >
          <img
            src={zoomedImage}
            alt="Zoomed"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Scroll to Top */}
      <button
        onClick={() =>
          containerRef?.current.scrollTo({ top: 0, behavior: "smooth" })
        }
        className="fixed bottom-4 right-4 bg-bgGreen text-white p-2 rounded-full shadow-lg"
      >
        <FaArrowUp />
      </button>
    </div>
  );
};

export default PreviewExternalPage;
