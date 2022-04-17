import React from "react";
import styles from "./Liongems.module.scss";
import { IButton } from "@/models/button";
import Button from "@/components/Button";

import img from "@/public/icons/star.svg";

let buttonsList: Array<IButton> = [
  {
    image: {
      src: img,
    },
    label: "Premium Plans",
  },
  {
    image: {
      src: img,
    },
    label: "Get Liongems",
  },
  {
    image: {
      src: img,
    },
    label: "Browse skins",
  },
];

const LionGemsHeader = () => {
  return (
    <div className={`flex flex-col justify-center min-h-[1000px] bg-[#1B2137]`}>
      <div className={`grid lg:grid-cols-2 gap-4 sm:grid-cols-1 ${styles.section}`}>
        <img
          className={"object-contain"}
          src="https://cdn.discord.study/images/Group+222.png"
          alt="February collection image"
          loading={"lazy"}
        />
        <div className={"flex items-start justify-center md:ml-5 sm:ml-0 flex-col"}>
          <h1 className={`uppercase text-7xl font-bold text-amber-400 max-w-min`}>Premium</h1>
          <p className={"mt-5 leading-6 text-xl max-w-sm"}>
            Support the team and keep the project alive by getting some LionGems!
          </p>
          <p className={"mt-5 text-xl max-w-sm"}>
            Purchase colored skins, gift LionGems to your loved ones, and unlock special perks for your server or
            yourself!
          </p>
        </div>
      </div>
      <div className={"flex justify-center items-center gap-[34px] mt-[63px]"}>
        {buttonsList.map((button) => (
          <Button key={button.label} {...button} />
        ))}
      </div>
    </div>
  );
};

export default LionGemsHeader;
