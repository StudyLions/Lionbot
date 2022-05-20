import React, { useState } from "react";
import Image from "next/image";
import SkinModal from "./SkinModal";

let skinsList = [
  {
    id: "original",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Original",
    price: 2500,
  },
  {
    id: "obsidian",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Obsidian",
    price: 2500,
  },
  {
    id: "platinum",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Platinum",
    price: 2500,
  },
  {
    id: "boston-blue",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Boston Blue",
    price: 2500,
  },
  {
    id: "cotton-candy",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Cotton Candy",
    price: 2500,
  },
  {
    id: "blue-bayoux",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Blue Bayoux",
    price: 2500,
  },
  {
    id: "bubble-gum",
    image: {
      imageOne: require("@/public/images/skins/platinum/platinum.png"),
    },
    label: "Bubble Gum",
    price: 2500,
  },
];

const SkinsBrowser = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState(null);

  const ExpandModal = (skin) => {
    setSelectedSkin(skin);
    setOpenModal(true);
  };

  return (
    <div className={"flex flex-wrap justify-center items-center gap-[34px] my-[63px]"}>
      {skinsList.map((skin) => (
        <div
          className="flex flex-wrap w-3/12 md:w-6/12 sm:w-11/12 justify-center items-center bg-gradient-to-b from-indigo-900 to-gray-900 py-2 px-5 rounded-2xl"
          key={skin.id}
          onClick={() => ExpandModal(skin)}
        >
          <h2 className="text-3xl mb-3">{skin.label}</h2>
          <Image
            src={skin.image.imageOne}
            alt={skin.label}
            layout="intrinsic"
            objectFit="contain"
            className="my-3"
            width={`600px`}
            height={`600px`}
          />
          <div className="w-4/12 flex flex-wrap justify-between items-center bg-red-400 my-2 p-2 rounded-3xl pulse">
            <Image
              src={require("@/public/icons/diamond-white.svg")}
              alt="Star icon"
              layout="fixed"
              height={40}
              width={35}
              objectFit="contain"
            />
            <p>{skin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkinsBrowser;

