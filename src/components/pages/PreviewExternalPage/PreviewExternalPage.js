import React, { useState, useEffect, useRef, useCallback } from "react";
import { db } from "../../../firebase/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { useParams } from "react-router-dom";
import { FaArrowUp } from "react-icons/fa";
import CardComponent from "./CardComponent";

const ITEMS_PER_PAGE = 10;

const PreviewExternalPage = () => {
  const { userId } = useParams();
  const [itemsCache, setItemsCache] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [zoomedImage, setZoomedImage] = useState(null); // For zoomed image

  const containerRef = useRef();

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

    fetchRestaurantData();
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
          fetchCategoryItems(initialCategory, 0);
        }
      } catch (error) {
        console.error("Failed to fetch categories or items:", error);
      }
    };

    fetchCategoriesAndItems();
  }, [userId]);

  // Fetch items for a specific category with pagination
  const fetchCategoryItems = async (category, offset) => {
    if (itemsCache[category]?.length > offset) {
      console.log("From Cache");
      setVisibleItems((prev) => [
        ...prev,
        ...itemsCache[category].slice(offset, offset + ITEMS_PER_PAGE),
      ]);
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
        [category]: [...(prev[category] || []), ...fetchedItems],
      }));

      setVisibleItems((prev) => [
        ...prev,
        ...fetchedItems.slice(offset, offset + ITEMS_PER_PAGE),
      ]);
      console.log("From DB");
    } catch (error) {
      console.error("Failed to fetch category items:", error);
    } finally {
      setIsFetching(false);
    }
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setScrollOffset(0);
    setVisibleItems([]);
    if (itemsCache[category]?.length) {
      console.log("from cache");
      setVisibleItems(itemsCache[category].slice(0, ITEMS_PER_PAGE));
    } else {
      fetchCategoryItems(category, 0);
      console.log("from db");
    }
  };

  // Handle lazy loading on scroll
  const handleScroll = useCallback(() => {
    if (
      containerRef.current &&
      containerRef.current.scrollTop + containerRef.current.clientHeight >=
        containerRef.current.scrollHeight - 100 &&
      !isFetching
    ) {
      setScrollOffset((prevOffset) => {
        const newOffset = prevOffset + ITEMS_PER_PAGE;
        fetchCategoryItems(activeCategory, newOffset);
        return newOffset;
      });
    }
  }, [activeCategory, isFetching]);

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  return (
    <div>
      {/* Restaurant Info */}
      {restaurantInfo && (
        <div className="w-full p-4 rounded-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">
                {restaurantInfo.restaurantName}
              </h2>
              <p>{restaurantInfo.address}</p>
            </div>
          </div>
        </div>
      )}

      {/* Categories */}
      <nav className="sticky top-0 bg-gray-100 z-10">
        <div className="flex overflow-x-auto py-2">
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
              {category}
            </button>
          ))}
        </div>
      </nav>

      {/* Items */}
      <div
        ref={containerRef}
        className="container mx-auto h-[70vh] overflow-y-auto"
      >
        {visibleItems.map((item) => (
          <CardComponent
            key={item.id}
            item={item}
            external="true"
            setZoomedImage={(image) => setZoomedImage(image)}
          />
        ))}
        {isFetching && <p>Loading more items...</p>}
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
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
        }
      >
        <FaArrowUp />
      </button>
    </div>
  );
};

export default PreviewExternalPage;
