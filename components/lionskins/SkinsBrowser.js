import React from "react";
import Image from "next/image";

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

function SkinsBrowser() {
  return (
    <div className={"flex flex-wrap justify-center items-center gap-[34px] mt-[63px]"}>
      {skinsList.map((skin) => (
        <div key={skin.id} onClick={() => console.log(skin.label)} {...skin}>
          <h2>{skin.label}</h2>
          <Image
            src={skin.image.imageOne}
            alt={skin.label}
            layout="fixed"
            height={600}
            width={600}
            objectFit="contain"
          />
          <div className="price__holder">
            <Image
              src={require("@/public/icons/diamond-white.svg")}
              alt="Star icon"
              layout="fixed"
              height={40}
              width={35}
              objectFit="contain"
            />
            <p>{skin.price}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SkinsBrowser;
