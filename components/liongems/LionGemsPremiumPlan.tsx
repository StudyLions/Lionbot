import styles from "./Liongems.module.scss";
import numberWithCommas from "@/utils/numberWithCommas";
import { IPremiumPlan } from "@/models/premiumPlan";
import Button from "@/components/Button";
import img from "@/public/icons/star.svg";

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
    <div className={"min-w-[364px] bg-white rounded-[30px]"}>
      <div className={`alignCenter min-h-[130px] rounded-t-[30px] ${styles.premiumPlan_gradient}`}>
        <div className={"font-semibold text-[50px] leading-[42px]"}>{numberWithCommas(card.lionGems)}</div>
      </div>
      <div className={"alignCenter mt-[30px] text-[40px] leading-[42px] text-[#333030] uppercase font-bold"}>
        {card.typeSubscription}
      </div>
      <div className={"alignCenter mt-[20px] text-[#989595] text-[25px] mb-[30px] font-extralight"}>Subscription</div>
    </div>
  );
};

const LionGemsPremiumPlan = () => {
  return (
    <div className={"flex flex-col py-[150px] mx-auto"}>
      <h1 className={"font-bold text-[70px] landing-[66px] uppercase text-center"}>Premium Plans</h1>
      <p className={"text-center mt-[20px] text-[#B6B6B6] text-[20px] leading-[42px]"}>
        You can use LionGems to purchase Premium subscirption for your server!{" "}
      </p>
      <div className={"alignCenter gap-[40px] mt-[20px]"}>
        {PremiumCards.map((card: IPremiumPlan) => (
          <PremiumCard key={card.typeSubscription} {...card} />
        ))}
      </div>
      <div className={"alignCenter flex-col"}>
        <p className={"mt-[30px] max-w-[550px] text-center mt-[20px] text-[#B6B6B6] text-[20px] leading-[42px]"}>
          To purchase and manage your subscription please use the “premium” command and access the interface.
        </p>
        <div className={"mt-[20px]"}>
          <Button image={img} label={"Get Liongems"} />
        </div>
      </div>
    </div>
  );
};

export default LionGemsPremiumPlan;
