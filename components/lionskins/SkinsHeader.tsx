import React from "react";
import styles from "../liongems/Liongems.module.scss";
import { IButton } from "@/models/button";
import Button from "@/components/Button";

import diamond_red from "@/public/icons/diamond-red.svg";
import { SkinModal } from "./SkinModal";

let buttonsList = [
  {
    image: {
      src: diamond_red,
    },
    label: "Original",
    scrollingElement: "original",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Obsidian",
    scrollingElement: "obsidian",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Platinum",
    scrollingElement: "platinum",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Boston Blue",
    scrollingElement: "boston-blue",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Cotton Candy",
    scrollingElement: "cotton-candy",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Blue Bayoux",
    scrollingElement: "blue-bayoux",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Bubble Gum",
    scrollingElement: "bubble-gum",
  },
];

const SkinsHeader = () => {
  return (
    <div className={`flex flex-col justify-center pt-[150px] md:pt-[30px]`}>
      <div className={`flex flex-row gap-[30px] md:flex-col ${styles.section}`}>
        <img
          className={"object-contain h-[400px] lg:h-[320px]"}
          src="https://cdn.discord.study/images/Group+222.png"
          alt="February collection image"
          loading={"lazy"}
          height={400}
        />
        <div className={"flex items-start justify-center md:ml-5 sm:ml-0 flex-col"}>
          <h1 className={`uppercase text-[50px] font-bold text-amber-400`}>Lion Skins</h1>
          <p className={"mt-5 max-w-sm md:max-w-full"}>
            Support the team and keep the project alive by getting some colored skins!
          </p>
          <p className={"mt-5 max-w-sm md:max-w-full"}>
            Purchased colored skins can be used across discord servers. Purchase once, use forever.
          </p>
        </div>
      </div>
      <div className={"flex flex-wrap justify-center items-center gap-[34px] mt-[63px]"}>
        {buttonsList.map((button) => (
          <button key={button.label} onClick={() => console.log(button.label)} {...button}>
            <img src={button.image.src} /> {button.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SkinsHeader;

