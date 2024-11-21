import React, { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";




import {
  FaArrowUp,
  FaFish,
  FaDrumstickBite,
  FaCarrot,
  FaLeaf,
} from "react-icons/fa";

import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";
import Navbar from "../../ui/Navbar";


const PreviewExternalPage = () => {
  const { userId } = useParams(); // Extract user ID from URL
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const topRef = useRef(null);

  const [zoomedImage, setZoomedImage] = useState(null); // State for zoomed image
  // Map categories to icons
  const categoryIcons = {
    Fish: FaFish,
    Meat: FaDrumstickBite,
    Vegetables: FaCarrot,
    Vegan: FaLeaf,
    // Add other categories and icons as needed
  };

  useEffect(() => {
    try {
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
    } catch (error) 
    {
      console.log(error)
    }
    console.log(userId)
  }, [userId]);

  const handleScrollToCategory = (category) => {
    setActiveCategory(category); // Update active category directly
  };

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
   <Link to="/" className="my-5"> <FaArrowLeft className="font-medium text-[2rem]"/></Link>
      <div ref={topRef}>
        {/* Navbar with category buttons */}
        <nav className="sticky top-0 left-0 w-full z-10 bg-gray-100">
          <div className="flex justify-center space-x-4 py-3">
            {categories.map((category) => (
              <button
                key={category} // Ensure unique key for each category button
                onClick={() => handleScrollToCategory(category)}
                className={`px-4 py-2 rounded-full ${
                  activeCategory === category
                    ? "bg-gray-800 text-white"
                    : "text-gray-700 font-bold"
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
            <div className="flex flex-col items-center">
              <h2 className="text-2xl font-bold mb-4">{activeCategory}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items
                  .filter(
                    (item) =>
                      item.category === activeCategory &&
                      item.outOfStock === false
                  )
                  .map((item) => (
          
                  <Card
  className="w-full max-w-screen-md mx-auto my-4 px-2 shadow-lg rounded-lg border"
  key={item.id}
>
  <CardHeader shadow={false} floated={false} className="h-auto">
    <img
      src={item.image}
      alt={item.name}
      className="w-full h-auto object-cover rounded-lg cursor-pointer"
      onClick={() => setZoomedImage(item.image)} // Set zoomed image on click
    />
  </CardHeader>
  <CardBody>
    <div className="mb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between border-b-2 pb-2">
      <Typography color="blue-gray" className="font-medium">
        {item.name}
      </Typography>
      <div className="mt-2 sm:mt-0">
        <Typography color="blue-gray" className="font-medium">
          {item.price}&#8364;
        </Typography>
        <div className="flex mt-1">
          <Typography
            color="blue-gray"
            className="font-small mr-2"
          >
            {item.quantity}
          </Typography>
          <Typography color="blue-gray" className="font-small">
            {item.unit}
          </Typography>
        </div>
      </div>
    </div>

    {item.variants && item.variants.length > 0 && (
      <div className="mt-4">
        <Typography
          color="blue-gray"
          className="font-medium mb-2"
        >
          Variantes:
        </Typography>
        <div>
          {item.variants.map((variant, index) => (
            <div
              key={index}
              className="flex justify-between mb-2"
            >
              <Typography
                color="gray"
                className="font-medium"
              >
                {variant.name}
              </Typography>
              <Typography
                color="gray"
                className="font-medium"
              >
                {variant.price}&#8364; - {variant.quantity}{" "}
                {variant.unit}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    )}

    {item.description && (
      <Typography
        variant="small"
        color="gray"
        className="font-normal opacity-75 mt-4"
      >
        {item.description}
      </Typography>
    )}
  </CardBody>
</Card>

                  ))}
              </div>
            </div>
          )}
        </div>
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
        {/* Scroll-to-top button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-[120px] right-4 p-3 rounded-full bg-gray-800 text-white shadow-lg"
        >
          <FaArrowUp />
        </button>
      </div>
    </div>
  );
};

export default PreviewExternalPage;
