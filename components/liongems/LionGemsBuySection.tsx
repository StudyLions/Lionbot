import { useRouter } from "next/router";
import { useEffect, useState } from "react";

import { AmountModal } from "@/components/AmountModal";
import { PurchaseFailedModal } from "@/components/PurchaseFailedModal";
import { PurchaseCompleteModal } from "@/components/PurchaseCompleteModal";
import { DonationsData } from "@/constants/DonationsData";
import numberWithCommas from "@/utils/numberWithCommas";
import { IDonationItem } from "@/models/donation";
import styles from "./Liongems.module.scss";
import Button from "@/components/Button";
import magnifying_glass from "@/public/icons/magnifying-glass.svg";
import Image from "next/image";

export default function LionGemsBuySection() {
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
        <h1
          className={`uppercase text-center pt-[50px] pb-[40px] font-bold text-[55px] sm:text-[45px]`}
          id={"liongems"}
        >
          Lion gems
        </h1>
        <div
          className={"grid grid-cols-3 sm:grid-cols-1 gap-[30px] items-center place-items-center max-w-[800px] mx-auto"}
        >
          {DonationsData.map((donationItem: IDonationItem, index) => (
            <div
              className={`p-[10px] rounded-[25px] cursor-pointer ${styles.container_donationCard}`}
              onClick={() => openAmountModal(donationItem)}
              key={donationItem.amount + index}
            >
              <div className={`rounded-[25px] pt-3 h-fit flex flex-col w-full ${styles.donationCard}`}>
                <Image
                  width={300}
                  height={300}
                  className={"max-h-[200px] px-[20px] object-contain"}
                  src={donationItem.image}
                  alt={`Tokens ${donationItem.tokens} image`}
                  loading={"lazy"}
                />
                <p className={`text-4xl font-bold text-center ${styles.gems}`}>
                  {numberWithCommas(donationItem.tokens)}
                </p>
                <p
                  className={`text-[18px] text-center mb-5 ${
                    +donationItem.tokens_bonus ? styles.gemsBonus : "text-transparent"
                  }`}
                >
                  +{numberWithCommas(donationItem.tokens_bonus)} bonus
                </p>
                <a
                  className={`rounded-3xl block text-2xl mx-5 mb-5 text-center py-1 font-bold bg-red20 hover:bg-red04`}
                >
                  €{donationItem.amount}
                </a>
              </div>
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
          <div className={"mt-[30px]"}>
            <Button image={magnifying_glass} label={"BROWSE SKINS"} href={"/skins"} />
          </div>
        </div>
      </div>
    </>
  );
}
