import React from "react";
import styles from "./Liongems.module.scss";
import { IButton } from "@/models/button";
import Button from "@/components/Button";
import Image from "next/image";

import star_red from "@/public/icons/star-red.svg";
import diamond_red from "@/public/icons/diamond-red.svg";
import magnifying_glass from "@/public/icons/magnifying-glass.svg";

let buttonsList: Array<IButton> = [
  {
    image: {
      src: star_red,
    },
    label: "Premium Plans",
    scrollingElement: "premium-plans",
  },
  {
    image: {
      src: diamond_red,
    },
    label: "Get LionGems",
    scrollingElement: "liongems",
  },
  {
    image: {
      src: magnifying_glass,
    },
    label: "Browse skins",
    href: "/skins",
  },
];

const LionGemsHeader = () => {
  return (
    <div className={`flex flex-col justify-center pt-[150px] md:pt-[30px]`}>
      <div className={`flex flex-row gap-[30px] md:flex-col ${styles.section}`}>
        <Image
          className={"object-contain h-[400px] lg:h-[320px]"}
          src={require("@/public/images/pages/donate/lionbot_profile.webp")}
          alt="February collection image"
          loading={"lazy"}
          width={500}
          height={500}
        />
        <div className={"flex items-start justify-center md:ml-5 sm:ml-0 flex-col"}>
          <h1 className={`uppercase text-[50px] font-bold text-amber-400`}>Support us</h1>
          <p className={"mt-5 max-w-sm md:max-w-full"}>
            Support the team and keep the project alive by getting some LionGems!
          </p>
          <p className={"mt-5 max-w-sm md:max-w-full"}>
            Purchase colored skins, gift LionGems to your loved ones, and unlock special perks for your server or
            yourself!
          </p>
        </div>
      </div>
      <div className={"flex flex-wrap justify-center items-center gap-[34px] mt-[63px]"}>
        {buttonsList.map((button) => (
          <Button key={button.label} {...button} />
        ))}
      </div>
    </div>
  );
};

export default LionGemsHeader;
