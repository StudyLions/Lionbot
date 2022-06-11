import styles from "./Liongems.module.scss";
import numberWithCommas from "@/utils/numberWithCommas";
import { IPremiumPlan } from "@/models/premiumPlan";
import Button from "@/components/Button";
import diamond_red from "@/public/icons/diamond-red.svg";
import Image from "next/image";
import React from "react";

let PremiumCards: Array<IPremiumPlan> = [
  {
    lionGems: 4000,
    typeSubscription: "3 Months",
  },
  {
    lionGems: 12000,
    typeSubscription: "1 Year",
  },
  {
    lionGems: 1500,
    typeSubscription: "Monthly",
  },
];

const PremiumCard = (card) => {
  return (
    <div className={"min-w-[300px] bg-white rounded-[30px] lg:min-w-[30%] md:w-full md:max-w-[300px]"}>
      <div className={`alignCenter min-h-[100px] rounded-t-[30px] ${styles.premiumPlan_gradient}`}>
        <h3 className={"alignCenter gap-[10px] font-semibold text-[40px] leading-[35px]"}>
          <Image
            src={require("@/public/icons/diamond-white.svg")}
            alt="Star icon"
            layout="fixed"
            height={40}
            width={35}
            objectFit="contain"
          />
          {numberWithCommas(card.lionGems)}
        </h3>
      </div>
      <div className={"alignCenter mt-[30px] text-[30px] leading-[20px] text-[#333030] uppercase font-bold"}>
        {card.typeSubscription}
      </div>
      <div className={"alignCenter mt-[20px] text-[#989595] text-[20px] mb-[30px] font-extralight"}>Subscription</div>
    </div>
  );
};

const LionGemsPremiumPlan = () => {
  return (
    <div id="premiumPlans" className={"flex flex-col pt-[100px] mx-auto"}>
      <h1
        className={"font-bold text-[55px] sm:text-[45px] landing-[66px] uppercase text-center pt-[67px]"}
        id={"premium-plans"}
      >
        Premium PLANS
      </h1>
      <p className={"text-center mt-[10px] leading-[42px]"}>
        You can use LionGems to purchase Premium subscription for your server!{" "}
      </p>
      <div className={"alignCenter md:flex-wrap gap-[40px] pt-[40px]"}>
        {PremiumCards.map((card: IPremiumPlan) => (
          <PremiumCard key={card.typeSubscription} {...card} />
        ))}
      </div>
      <div className={"alignCenter flex-col"}>
        <p className={"mt-[50px] text-center text-[20px] leading-[42px]"}>To purchase and manage your subscription</p>
        <p className={"font-bold"}>
          use the <span className={"text-[#FFD469]"}>!premium </span>command and access the interface.
        </p>
        <div className={"mt-[30px]"}>
          <Button image={diamond_red} label={"Get LionGems"} scrollingElement={"liongems"} />
        </div>
      </div>
    </div>
  );
};

export default LionGemsPremiumPlan;
