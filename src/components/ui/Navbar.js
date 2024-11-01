import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import { useState } from "react";

const Navbar = ({ active }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // State to control the menu visibility

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
    localStorage.removeItem("userID");
  };

  const handleNavigateToSettings = () => {
    navigate("/settings");
  };

  const handleNavigateToPreview = () => {
    const userId = auth?.currentUser?.uid || localStorage.getItem("userID");
    navigate(`/previewint/${userId}`);
  };

  const handleNavigateToItemList = () => {
    navigate("/items");
  };

  return (
    <nav className="bg-blue-500 text-white py-4 px-6 flex justify-between items-center fixed top-0 w-full z-1">
      <div className="flex items-center justify-between w-full">
        <Link to="/" className="text-2xl font-bold">
          Menu Management
        </Link>
        <button
          className=" text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)} // Toggle the menu visibility
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            ></path>
          </svg>
        </button>
      </div>
      
      {/* Overlay Menu */}
      <div
        className={`fixed top-0 left-0 w-full h-full bg-blue-600 bg-opacity-90 flex flex-col items-center justify-center space-y-4 transform ${
          isOpen ? "translate-y-0" : "-translate-y-full"
        } transition-transform duration-300 ease-in-out z-20`}
      >
        <button
          className="absolute top-4 right-6 text-white text-2xl focus:outline-none"
          onClick={() => setIsOpen(false)} 
        >
          &times;
        </button>
        {active !== "items" && (
          <button
            onClick={() => {
              handleNavigateToItemList();
              setIsOpen(false);
            }}
            className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Generate QR Code
          </button>
        )}
        {active !== "settings" && (
          <button
            onClick={() => {
              handleNavigateToSettings();
              setIsOpen(false);
            }}
            className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Settings
          </button>
        )}
        <button
          onClick={() => {
            handleNavigateToPreview();
            setIsOpen(false);
          }}
          className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Preview
        </button>
        <button
          onClick={() => {
            handleSignOut();
            setIsOpen(false);
          }}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
