import React from "react";

export default function CustomButton({ title, styles,onPress}) {
  return (
    <div>
      <button className={`bg-bgGreen px-5 py-2 rounded-lg text-white hover:opacity-80 ${styles}` }onClick={onPress}>
        {title}
      </button>
    </div>
  );
}
