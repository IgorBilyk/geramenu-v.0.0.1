import React, { useState, useEffect, useRef } from "react";
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

const PreviewExternalPage = () => {
  const { userId } = useParams();
  const [itemsCache, setItemsCache] = useState({});
  const [visibleItems, setVisibleItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [zoomedImage, setZoomedImage] = useState(null); // For zoomed image
  const [isInfoExpanded, setIsInfoExpanded] = useState(false); // To toggle expansion

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
          fetchCategoryItems(initialCategory);
        }
      } catch (error) {
        console.error("Failed to fetch categories or items:", error);
      }
    };

    fetchCategoriesAndItems();
  }, [userId]);

  // Fetch items for a specific category
  const fetchCategoryItems = async (category) => {
    if (itemsCache[category]) {
      // Load from cache
      console.log("From Cache");
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
      console.log("From DB");
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


  return (
    <div>
      {/* Restaurant Info */}
      {restaurantInfo && (
        <div
          className={`w-full z-20 p-4 rounded-md transition-transform ${
            isInfoExpanded ? "h-auto" : "min-h-[80px]"
          }`}
        >
          <div
            className="cursor-pointer flex justify-between items-center"
            onClick={toggleInfoExpansion}
          >
            <div className="flex items-center gap-4 text-bgGreen">
              {restaurantInfo.imageUrl && (
                <img
                  src={restaurantInfo.imageUrl}
                  alt="Restaurant"
                  className="w-16 h-16 object-cover rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {restaurantInfo.restaurantName}
                </h2>
                <p className="text-sm text-bgGreen">{restaurantInfo.address}</p>
                <p>
                  <strong>Tel: </strong>
                  <a href={`tel:${restaurantInfo.phone}`}>
                    {restaurantInfo.phone}
                  </a>
                </p>
                <p>
                  {" "}
                  <strong>Website: </strong>
                  <a href={restaurantInfo.website} target="_blank">
                    {restaurantInfo.website}
                  </a>
                </p>
              </div>
            </div>
            <button className="text-sm font-medium text-bgGreen">
              {isInfoExpanded ? "Mostrar menos" : "Mostrar mais"}
            </button>
          </div>
          {isInfoExpanded && (
            <div className="mt-4 text-bgGreen">
              <p>
                <strong>Email:</strong> {restaurantInfo.email}
              </p>
              <p>
                <strong>WiFi:</strong> {restaurantInfo.wifi}
              </p>
              <p>
                <strong>WiFi Password:</strong> {restaurantInfo.wifiPassword}
              </p>
              <p>
                <strong>Horas:</strong>
              </p>
              <ul>
                <li>
                  Almoço: {restaurantInfo.workingHours.lunchOpen} -{" "}
                  {restaurantInfo.workingHours.lunchClose}
                </li>
                <li>
                  Jantar: {restaurantInfo.workingHours.dinnerOpen} -{" "}
                  {restaurantInfo.workingHours.dinnerClose}
                </li>
              </ul>
              <p>
                <strong>Encerrado:</strong>{" "}
                {restaurantInfo.workingHours.closedDays.join(", ")}
              </p>
              <p>
                <strong>Descrição:</strong> {restaurantInfo.description}
              </p>
            </div>
          )}
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
          containerRef.current.scrollTo({ top: 0, behavior: "smooth" })
        }
      >
        <FaArrowUp />
      </button>
    </div>
  );
};

export default PreviewExternalPage;
