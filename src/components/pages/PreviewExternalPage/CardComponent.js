import React from "react";

import {
  Card,
  CardHeader,
  CardBody,
  Typography,
} from "@material-tailwind/react";

import { FaCheckCircle } from "react-icons/fa";
import { ImCross } from "react-icons/im";


import CustomButton from "../../ui/Button";


export default function CardComponent({
  item,
  external,
  setZoomedImage,
  openModal,
  handleDeleteItem,
}) {
  const { id, name, price, image, quantity, unit, description, variants } =
    item;
console.log("item", item);
  return (
    <Card
      className="sm:w-full my-4 px-5 shadow-lg rounded-lg lg:w-full"
      key={id}
    >
      <CardHeader
        shadow={false}
        floated={false}
        className="h-48 sm:h-56 bg-bgGreen"
      >
        <img
          src={image || ""}
          alt={name}
          className="h-full w-full object-cover rounded-t-lg cursor-pointer"
          onClick={() => setZoomedImage(image)} // Set zoomed image on click
        />
      </CardHeader>
      <CardBody className="py-0 text-bgGreen">
        <div className="mb-2 flex sm:flex-row items-center justify-between border-b-2 pb-2">
          <Typography
           
            className="font-medium text-lg sm:text-xl text-bgGreen"
          >
            {name}
          </Typography>
          <div className="text-center sm:text-right mt-2 sm:mt-0">
            <Typography color="blue-gray" className="font-medium text-base">
              {price}&#8364;
            </Typography>
            <div className="flex justify-center sm:justify-end mt-1">
              <Typography color="blue-gray" className="font-small mr-2 text-sm">
                {quantity}
              </Typography>
              <Typography color="blue-gray" className="font-small text-sm">
                {unit}
              </Typography>
            </div>
          </div>
        </div>
      </CardBody>

      {variants.length > 0 &&
        variants.map((item, index) => {
          return (
            <CardBody className="py-0 text-bgGreen" key={index}>
              <div className="mb-2 flex sm:flex-row items-center justify-between border-b-2 pb-2">
                <Typography
                  color="blue-gray"
                  className="font-medium text-lg sm:text-xl"
                >
                  {item.name}
                </Typography>
                <div className="text-center sm:text-right mt-2 sm:mt-0">
                  <Typography
                    color="blue-gray"
                    className="font-medium text-base"
                  >
                    {item.price}&#8364;
                  </Typography>
                  <div className="flex justify-center sm:justify-end mt-1">
                    <Typography
                      color="blue-gray"
                      className="font-small mr-2 text-sm"
                    >
                      {item.quantity}
                    </Typography>
                    <Typography
                      color="blue-gray"
                      className="font-small text-sm"
                    >
                      {item.unit}
                    </Typography>
                  </div>
                </div>
              </div>
            </CardBody>
          );
        })}
      <CardBody>
        <Typography color="blue-gray" className="font-small text-sm text-bgGreen">
          {description}
        </Typography>
      </CardBody>
      {external ? null : (
        <div className="flex flex-col sm:flex-row justify-around items-center gap-4 pb-4 px-4">
          <CustomButton
            title="Editar"
            onPress={() => openModal(item)}
            styles="w-full sm:w-auto bg-blue text-textWhite"
          />
          <CustomButton
            title="Remover"
            onPress={() => handleDeleteItem(item?.id)}
            styles="bg-red-500 w-full sm:w-auto bg-red text-textWhite"
          />
          {item.outOfStock? (
            <ImCross className="size-6 text-red-500"/>
          ) : (
            <FaCheckCircle className="size-6 text-rgb(53, 96, 97)"/>
          )}

        </div>
      )}
    </Card>
  );
}
