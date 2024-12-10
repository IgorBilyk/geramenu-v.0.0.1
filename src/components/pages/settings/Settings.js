import { useState, useEffect } from "react";
import { db, storage, auth } from "../../../firebase/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import Navbar from "../../ui/Navbar";
import { successMessage, warningMessage } from "../../../handlers/toastHandler";

import { Toaster } from "sonner";

const Settings = () => {
  const [formData, setFormData] = useState({
    restaurantName: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    wifi: "",
    wifiPassword: "",
    workingHours: {
      lunchOpen: "",
      lunchClose: "",
      dinnerOpen: "",
      dinnerClose: "",
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
    try {
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
      successMessage("Informações foram adicionadas!");
    } catch (error) {
      warningMessage("Algo correu errado, tente novamente!");
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <Navbar />
      <div className="flex justify-center items-center flex-col">
        <h2 className="text-2xl font-bold my-20">Meu Restaurante</h2>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 w-full sm:w-2/3 p-6 bg-white shadow-md rounded-md"
        >
          <div>
            <label className="block mb-2">Restaurant Nome:</label>
            <input
              type="text"
              name="restaurantName"
              value={formData.restaurantName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Morada:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Número:</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              required
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
            <label className="block mb-2">Website:</label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Wi-Fi Rede:</label>
            <input
              type="text"
              name="wifi"
              value={formData.wifi}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2">Wi-Fi Senha:</label>
            <input
              type="text"
              name="wifiPassword"
              value={formData.wifiPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-2 font-bold">Horário:</label>
            <h3>Almoço:</h3>
            <div className="flex gap-4">
              <input
                type="time"
                name="lunchOpen"
                value={formData.workingHours.lunchOpen}
                onChange={handleWorkingHoursChange}
                className="p-2 border rounded-md"
                pattern="[0-2][0-9]:[0-5][0-9]"
              />
              <span>as</span>
              <input
                type="time"
                name="lunchClose"
                value={formData.workingHours.lunchClose}
                onChange={handleWorkingHoursChange}
                className="p-2 border rounded-md"
              />
            </div>
            <h3 className="mt-4">Jantar:</h3>
            <div className="flex gap-4">
              <input
                type="time"
                name="dinnerOpen"
                value={formData.workingHours.dinnerOpen}
                onChange={handleWorkingHoursChange}
                className="p-2 border rounded-md"
              />
              <span>as</span>
              <input
                type="time"
                name="dinnerClose"
                value={formData.workingHours.dinnerClose}
                onChange={handleWorkingHoursChange}
                className="p-2 border rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block mb-2">Encerrado:</label>
            <div className="flex flex-wrap gap-2">
              {[
                "Domingo",
                "Segunda-feira",
                "Terça-feira",
                "Quarta-feira",
                "Quinta-feira",
                "Sexta-feira",
                "Sábado",
              ].map((day) => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    value={day}
                    checked={formData.workingHours.closedDays.includes(day)}
                    onChange={handleClosedDaysChange}
                    className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium">{day}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="block mb-2">Descrição:</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md"
              rows="4"
            ></textarea>
          </div>
          <div>
            <label className="block mb-2">Imagem (opcional):</label>
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              className="w-full"
            />
          </div>
          <button
            type="submit"
            className="bg-bgGreen text-textWhite px-6 py-2 rounded-md"
          >
            Guardar
          </button>
          <Toaster />
        </form>
      </div>
    </div>
  );
};

export default Settings;
