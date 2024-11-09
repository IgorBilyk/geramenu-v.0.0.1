import { useState, useEffect, useRef } from "react";
import { db } from "../../../firebase/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useParams } from "react-router-dom";
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
  CardFooter,
  Typography,
  Tooltip,
  IconButton,
  Button,
} from "@material-tailwind/react";

const PreviewExternalPage = () => {
  const { userId } = useParams(); // Extract user ID from URL
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const categoryRefs = useRef({});
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
      const menuItems = querySnapshot.docs.map((doc) => doc.data());

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

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  const scrollToTop = () => {
    topRef.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div>
      <div ref={topRef}>
        <nav className="fixed top-20 left-0 w-full bg-white shadow-lg z-10">
          <div className="flex justify-center space-x-4 py-3">
            {categories.map((category) => (
              <button
                key={category}
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

        <div className="container mx-auto pt-20 mt-20">
          <h1 className="text-4xl font-bold mb-8">Menu</h1>
          {categories.map((category) => (
            <div
              key={category}
              ref={(el) => (categoryRefs.current[category] = el)}
            >
              <h2 className="text-2xl font-bold mb-4">{category}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items
                  ?.filter((item) => item.category === category)
                  ?.map((item, index) => (
                    <Card className="w-96" key={item.id}>
                      <CardHeader
                        shadow={false}
                        floated={false}
                        className="h-96"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </CardHeader>
                      <CardBody>
                        <div className="mb-2 flex items-center justify-between border-b-2">
                          <Typography color="blue-gray" className="font-medium">
                            {item.name}
                          </Typography>
                          <div>
                            <Typography
                              color="blue-gray"
                              className="font-medium"
                            >
                              {item.price}&#8364;
                            </Typography>
                            <div className="flex">
                              <Typography
                                color="blue-gray"
                                className="font-small mr-2"
                              >
                                {item.quantity}
                              </Typography>
                              <Typography
                                color="blue-gray"
                                className="font-small"
                              >
                                {item.unit}
                              </Typography>
                            </div>
                          </div>
                        </div>

                        {/* Conditionally render variants */}
                        {item.variants && item.variants.length > 0 && (
                          <div className="mt-4">
                            <Typography
                              color="blue-gray"
                              className="font-medium mb-2"
                            >
                              Variants:
                            </Typography>
                            <div>
                              {item.variants.map((variant, index) => (
                                <div
                                  key={index}
                                  className="flex justify-between mb-2"
                                >
                                  <Typography
                                    color="gray"
                                    className="font-normal"
                                  >
                                    {variant.name}
                                  </Typography>
                                  <Typography
                                    color="gray"
                                    className="font-normal"
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
                            className="font-normal opacity-75"
                          >
                            {item.description}
                          </Typography>
                        )}
                      </CardBody>
                    </Card>
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
      </div>
    </div>
  );
};

export default PreviewExternalPage;
