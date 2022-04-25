import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

import { AmountModal } from "@/components/AmountModal";
import { PurchaseFailedModal } from "@/components/PurchaseFailedModal";
import { PurchaseCompleteModal } from "@/components/PurchaseCompleteModal";
import { DonationsData } from "@/constants/DonationsData";
import numberWithCommas from "@/utils/numberWithCommas";
import { IDonationItem } from "@/models/donation";
import styles from "./Liongems.module.scss";
import Button from "@/components/Button";
import magnifying_glass from "@/public/icons/magnifying-glass.svg";

export default function LionGemsBuySection() {
  const { data: session } = useSession();
  const [isAmountModalVisible, setIsAmountModalVisible] = useState(false);
  const [isPurchaseFailedVisible, setIsPurchaseFailedVisible] = useState(false);
  const [isPurchaseCompleteVisible, setIsPurchaseCompleteVisible] = useState(false);
  const [currentDonationData, setCurrentDonationData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    switch (router.query.payment) {
      case "success":
        setIsPurchaseCompleteVisible(true);
        break;
      case "failed":
        setIsPurchaseFailedVisible(true);
        break;
      default:
    }
    router.replace("/donate", undefined, { shallow: true });
  }, [router.query.payment]);

  const openAmountModal = (donationItem: IDonationItem) => {
    //Redirect user if is not logged.
    if (!session) {
      signIn("discord");
      return;
    }
    setCurrentDonationData(donationItem);
    setIsAmountModalVisible(true);
  };

  return (
    <>
      {isAmountModalVisible && (
        <AmountModal closeModal={() => setIsAmountModalVisible(false)} {...currentDonationData} />
      )}
      {isPurchaseFailedVisible && (
        <PurchaseFailedModal
          closeModal={() => {
            setIsPurchaseFailedVisible(false);
            localStorage.removeItem("basket");
          }}
        />
      )}
      {isPurchaseCompleteVisible && (
        <PurchaseCompleteModal
          closeModal={() => {
            setIsPurchaseCompleteVisible(false);
            localStorage.removeItem("basket");
          }}
        />
      )}

      <div className={`${styles.buySection}`}>
        <h1 className={`uppercase text-center pt-[50px] pb-[40px] font-bold text-7xl`} id={"liongems"}>
          Lion gems
        </h1>
        <div className={"grid grid-cols-3 gap-[70px] items-center place-items-center"}>
          {DonationsData.map((donationItem: IDonationItem, index) => (
            <div
              className={`rounded-3xl pt-3 h-fit flex flex-col w-full ${styles.donationCard}`}
              key={donationItem.amount + index}
            >
              <img src={donationItem.image} alt={`Tokens ${donationItem.tokens} image`} loading={"lazy"} />
              <p className={`text-4xl font-bold text-center ${styles.gems}`}>{numberWithCommas(donationItem.tokens)}</p>
              <p
                className={`text-2xl font-bold text-center mb-5 ${
                  +donationItem.tokens_bonus ? styles.gemsBonus : "text-transparent"
                }`}
              >
                +{numberWithCommas(donationItem.tokens_bonus)} bonus
              </p>
              <a
                onClick={() => openAmountModal(donationItem)}
                className={`rounded-full block text-2xl mx-5 mb-5 text-center py-1 font-bold cursor-pointer
                       bg-red20 hover:bg-red04`}
              >
                €{donationItem.amount}
              </a>
            </div>
          ))}
        </div>
        <div className={"alignCenter flex-col max-w-[750px] mx-auto leading-[42px] text-center"}>
          <p className={"pt-[37px]"}>
            Remember, LionGems can be used to purchase skins for yourself and get premium subscription for your own
            server, but you can also gift them to other members!
          </p>
          <p className={"font-bold"}>
            ✨To gift LionGems, use the <span className={"text-[#ffd469]"}>!gift</span> command✨
          </p>
          <div className={"mt-[30px] mb-[100px]"}>
            <Button image={magnifying_glass} label={"BROWSE SKINS"} href={"/coming-soon"} />
          </div>
        </div>
      </div>
    </>
  );
}
