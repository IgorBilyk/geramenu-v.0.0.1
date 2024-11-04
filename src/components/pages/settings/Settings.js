import { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Navbar from "../../ui/Navbar";
const Settings = () => {
  const [formData, setFormData] = useState({
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    workingHours: {
      open: "",
      close: "",
      closedDays: [],
    },
    description: "",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const userId = auth?.currentUser?.uid || localStorage.getItem("userID");

  // Fetch restaurant info on load
  useEffect(() => {
    const fetchRestaurantInfo = async () => {
      if (!userId) return;
      const docRef = doc(db, "restaurants", userId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFormData(docSnap.data());
      }
    };

    fetchRestaurantInfo();
  }, [userId]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle working hours change
  const handleWorkingHoursChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      workingHours: { ...prev.workingHours, [name]: value },
    }));
  };

  // Handle closed days selection
  const handleClosedDaysChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        closedDays: checked
          ? [...prev.workingHours.closedDays, value]
          : prev.workingHours.closedDays.filter((day) => day !== value),
      },
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = formData.imageUrl;
    if (imageFile) {
      const imageRef = ref(storage, `restaurants/${userId}/image.jpg`);
      await uploadBytes(imageRef, imageFile);
      imageUrl = await getDownloadURL(imageRef);
    }

    await setDoc(doc(db, "restaurants", userId), {
      ...formData,
      imageUrl,
    });
    alert("Settings updated successfully!");
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center flex-col">
        <h2 className="text-2xl font-bold my-20">Restaurant Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-4 w-[100%] sm:w-[60%] p-4">
     
          <div>
            <label className="block mb-2">Restaurant Name:</label>
            <input
              type="text"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Address:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Phone:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Working Hours:</label>
            <div className="space-y-2">
              <input
                type="time"
                name="open"
                value={formData.workingHours.open}
                onChange={handleWorkingHoursChange}
                className="px-4 py-2 border rounded-md mr-4"
              />
              <input
                type="time"
                name="close"
                value={formData.workingHours.close}
                onChange={handleWorkingHoursChange}
                className="px-4 py-2 border rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2">Closed Days:</label>
            {[
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
            ].map((day) => (
              <label key={day} className="inline-flex items-center mr-4">
                <input
                  type="checkbox"
                  value={day}
                  checked={formData.workingHours.closedDays.includes(day)}
                  onChange={handleClosedDaysChange}
                  className="mr-2"
                />
                {day}
              </label>
            ))}
          </div>
          <div>
            <label className="block mb-2">Description:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              rows="4"
            ></textarea>
          </div>
          <div>
            <label className="block mb-2">Upload Image (optional):</label>
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
          >
            Save Settings
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
