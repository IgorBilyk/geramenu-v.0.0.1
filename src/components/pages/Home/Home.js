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
import { Toaster, toast } from "sonner";
import { useParams } from "react-router-dom";
import Navbar from "../../ui/Navbar";
import { FaArrowUp, FaEdit, FaTrash } from "react-icons/fa";
import AddMenu from "../AddMenu/AddMenu";
import CustomButton from "../../ui/Button";

import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
  Tooltip,
  IconButton,
  Button as btn,
  Button
} from "@material-tailwind/react";

const Home = () => {
  const { userId } = useParams();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
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
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setIsModalOpen(false);
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteDoc(doc(db, "menuItems", itemId));
      toast.success("Item has been deleted!");
    }
  };

  return (
    <div>
      <Navbar />
      <div ref={topRef}>
        <nav className="sticky top-[64px] z-40 bg-gray-800 shadow-lg px-4 py-2">
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 py-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleScrollToCategory(category)}
                className={`px-4 py-2 rounded-xl border-2 ${
                  activeCategory === category
                    ? "bg-blue-400 text-white"
                    : "text-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </nav>

        <div className="container mx-auto pt-20">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Menu</h1>
            <CustomButton title="Add Item" onPress={openModal} />
          </div>

          {items.length === 0 && <p>No Items</p>}

          <div className="grid md:grid-cols-2 ">
            {categories.map((category) => (
              <div
                key={category}
                ref={(el) => (categoryRefs.current[category] = el)}
                className="my-8"
              >
                {/* Update grid here */}
                <div
                  className="flex justify-center"
                >
                  {items
                    .filter((item) => item.category === category)
                    .map((item) => (
                  
                      <Card className="w-96">
                      <CardHeader shadow={false} floated={false} className="h-96">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </CardHeader>
                      <CardBody>
                        <div className="mb-2 flex items-center justify-between">
                          <Typography color="blue-gray" className="font-medium">
                            {item.name}
                          </Typography>
                          <Typography color="blue-gray" className="font-medium">
                          {item.price}&#8364;	
                          </Typography>
                        </div>
                        <Typography
                          variant="small"
                          color="gray"
                          className="font-normal opacity-75"
                        >
                         {item.description}
                        </Typography>
                      </CardBody>
                      <CardFooter className="pt-0">
                      {/*   <Button
                          ripple={false}
                          fullWidth={true}
                          className="bg-blue-gray-900/10 text-blue-gray-900 shadow-none hover:scale-105 hover:shadow-none focus:scale-105 focus:shadow-none active:scale-100"
                        >
                          Add to Cart
                        </Button> */}
                      </CardFooter>
                    </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600"
        >
          <FaArrowUp />
        </button>
        <Toaster />

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
              <AddMenu itemToEdit={selectedItem} onClose={closeModal} />
            </div>
          </div>
        )}
      </div>
      
      
    </div>
  );
};

export default Home;
