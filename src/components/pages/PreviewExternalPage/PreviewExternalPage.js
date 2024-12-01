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
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaArrowUp } from "react-icons/fa";

import CardComponent from "./CardComponent";

const PreviewExternalPage = () => {
  const { userId } = useParams(); // Extract user ID from URL
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [restaurantInfo, setRestaurantInfo] = useState(null); // For restaurant info
  const [isInfoExpanded, setIsInfoExpanded] = useState(false); // To toggle expansion
  const [zoomedImage, setZoomedImage] = useState(null); // For zoomed image
  const topRef = useRef(null);

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

  // Fetch menu items
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const itemsRef = collection(db, "menuItems");
        const q = query(itemsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const menuItems = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setItems(menuItems);

        const uniqueCategories = [
          ...new Set(
            menuItems
              .filter((item) => !item.outOfStock)
              .map((item) => item.category)
          ),
        ];
        setCategories(uniqueCategories);

        /*  console.log("from previewext", categories); */
        if (uniqueCategories.length > 0) {
          setActiveCategory(uniqueCategories[0]);
        }
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };

    fetchItems();
  }, [userId]);

  const toggleInfoExpansion = () => {
    setIsInfoExpanded(!isInfoExpanded);
  };

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };
  console.log(items);

  return (
    <div>
      {/*  <Link to="/" className="my-5">
        <FaArrowLeft className="font-medium text-[2rem] text-bgGreen" />
      </Link> */}

      {/* Restaurant Info Section */}
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
                <p><strong>Tel: </strong>
                  <a href={`tel:${restaurantInfo.phone}`}>
                    {restaurantInfo.phone}
                  </a>
                </p>
                <p>
                  {" "}
                  <strong>Website: </strong>
                  <a href={restaurantInfo.website} target="_blank">{restaurantInfo.website}</a>
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

      <div ref={topRef}>
        {/* Category Navigation */}
        <nav className="sticky top-[0%] left-0 w-full z-10 bg-gray-[400]">
          <div className="flex justify-center space-x-4 py-5 flex-nowrap overflow-x-auto overflow-y-hidden scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category
                    ? "bg-bgGreen text-textWhite"
                    : "text-bgGreen font-bold border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        {/* Menu Items */}
        <div className="container mx-auto pt-5 px-4 text-bgGreen">
          <h1 className="text-4xl font-bold mb-8 text-center">Menu</h1>
          {activeCategory && (
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4">{activeCategory}</h2>
              <div className="flex flex-col w-full">
                {items
                  .filter(
                    (item) =>
                      item.category === activeCategory &&
                      item.outOfStock === false
                  )
                  .map((item) => (
                    <CardComponent
                      key={item.id}
                      item={item}
                      external="true"
                      setZoomedImage={(image) => setZoomedImage(image)}
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
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

      <button
        onClick={scrollToTop}
        className="fixed bottom-[120px] right-4 p-3 rounded-full bg-bgGreen text-white shadow-lg"
      >
        <FaArrowUp className="text-textWhite" />
      </button>
    </div>
  );
};

export default PreviewExternalPage;
