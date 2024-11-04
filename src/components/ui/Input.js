import React from "react";

export default function Input({ label, onChangeHandler, styles }) {
  return (
    <div>
      <label className="block mb-2">{label}</label>
      <input
        type="text"
        name="restaurantName"
      /*   value={formData?.restaurantName}
        onChange={handleChange} */
        className={`w-full px-4 py-2 border rounded-md w-50% ${styles}`}
      />
    </div>
  );
}
