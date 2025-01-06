import React from "react";

export default function RestaurantInfo({
  restaurantInfo,
  isInfoExpanded,
  toggleInfoExpansion,
}) {
  return (
    <div>
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
              {restaurantInfo?.imageUrl && (
                <img
                  src={restaurantInfo?.imageUrl}
                  alt="Restaurant"
                  className="w-16 h-16 object-cover rounded-full"
                />
              )}
              <div>
                <h2 className="text-xl font-bold">
                  {restaurantInfo?.restaurantName}
                </h2>
                <p className="text-sm text-bgGreen">
                  {restaurantInfo?.address}
                </p>
                <p>
                  <strong>Tel: </strong>
                  <a href={`tel:${restaurantInfo?.phone}`}>
                    {restaurantInfo?.phone}
                  </a>
                </p>
                <p>
                  <strong>Website: </strong>
                  <a href={restaurantInfo?.website} target="_blank">
                    {restaurantInfo?.website}
                  </a>
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
                <strong>Email:</strong> {restaurantInfo?.email}
              </p>
              <p>
                <strong>WiFi:</strong> {restaurantInfo?.wifi}
              </p>
              <p>
                <strong>WiFi Password:</strong> {restaurantInfo?.wifiPassword}
              </p>
              <p>
                <strong>Horas:</strong>
              </p>
              <ul>
                <li>
                  Almoço: {restaurantInfo?.workingHours?.lunchOpen} -{" "}
                  {restaurantInfo?.workingHours?.lunchClose}
                </li>
                <li>
                  Jantar: {restaurantInfo?.workingHours?.dinnerOpen} -{" "}
                  {restaurantInfo?.workingHours?.dinnerClose}
                </li>
              </ul>
              <p>
                <strong>Encerrado:</strong>{" "}
                {restaurantInfo?.workingHours?.closedDays.join(", ")}
              </p>
              <p>
                <strong>Descrição:</strong> {restaurantInfo?.description}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
