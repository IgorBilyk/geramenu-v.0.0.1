import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";

const Navbar = ({ active }) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut(auth);
    navigate("/");
    localStorage.removeItem('userID')
  };

  const handleNavigateToSettings = () => {
    navigate("/settings");
  };

  const handleNavigateToPreview = () => {
    const userId = auth?.currentUser?.uid || localStorage.getItem("userID")
    navigate(`/previewint/${userId}`);
  };
  const handleNavigateToItemList = () => {
    navigate("/items"); // Redirect to the ItemList component
  };

  return (
    <nav className="bg-blue-500 text-white py-4 px-6 flex justify-between items-center fixed top-0 w-[100%]">
      <div>
        <Link to="/" className="text-2xl font-bold">
          Menu Management
        </Link>
      </div>
      <div className="space-x-4">
        {active == "items" ? (
          ""
        ) : (
          <button
            onClick={handleNavigateToItemList}
            className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Generate QR Code
          </button>
        )}
        {active == "settings" ? (
          ""
        ) : (
          <button
            onClick={handleNavigateToSettings}
            className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Settings
          </button>
        )}
        <button
          onClick={handleNavigateToPreview}
          className="bg-white text-blue-500 px-4 py-2 rounded-md hover:bg-gray-100"
        >
          Preview
        </button>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
