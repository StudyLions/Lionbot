import React, { useState } from "react";
import Image from "next/image";
import SkinModal from "./SkinModal";
import { SkinsList } from "@/constants/SkinsList";
import styles from "./Skins.module.scss";

const SkinsBrowser = () => {
  const [isModalOpen, setIsOpenModal] = useState(false);
  const [data, setData] = useState(null);
  return (
    <div className={"flex flex-wrap justify-center items-center gap-[20px]  py-20"}>
      {SkinsList.map((skin) => (
        <div
          className={`flex flex-wrap w-3/12 lg:w-5/12 md:w-6/12 sm:w-11/12 justify-center items-center rounded-3xl p-2 ${styles.gradientBackground}`}
        >
          <div
            className="cursor-zoom-in flex flex-wrap justify-center items-center bg-gradient-to-b from-indigo-900 to-gray-900 p-4  rounded-3xl"
            key={skin.id}
            onClick={() => {
              setIsOpenModal(true);
              setData(skin);
            }}
          >
            <h2 className="text-3xl mb-3 text-gray-300">{skin.label}</h2>
            <Image
              src={skin.image.imageOne}
              alt={skin.label}
              objectFit="contain"
              className="my-3"
              width={600}
              height={600}
            />
            <div className="w-6/12 sm:w-8/12 flex flex-wrap justify-center items-center bg-red-500 my-2 p-2 rounded-3xl pulse">
              <Image
                src={require("@/public/icons/diamond-white.svg")}
                alt="Star icon"
                layout="fixed"
                height={20}
                width={20}
                objectFit="contain"
              />
              <p className="ml-4">{skin.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
          </div>
        </div>
      ))}
      {isModalOpen ? (
        <SkinModal
          label={data.label}
          imageOne={data.image.imageOne.default.src}
          imageTwo={data.image.imageTwo.default.src}
          imageThree={data.image.imageThree.default.src}
          imageFour={data.image.imageFour.default.src}
          imageFive={data.image.imageFive.default.src}
          imageSix={data.image.imageSix.default.src}
          imageSeven={data.image.imageSeven.default.src}
          imageEight={data.image.imageEight.default.src}
          imageOneThumbnail={data.image.imageOneThumbnail.default.src}
          imageTwoThumbnail={data.image.imageTwoThumbnail.default.src}
          imageThreeThumbnail={data.image.imageThreeThumbnail.default.src}
          imageFourThumbnail={data.image.imageFourThumbnail.default.src}
          imageFiveThumbnail={data.image.imageFiveThumbnail.default.src}
          imageSixThumbnail={data.image.imageSixThumbnail.default.src}
          imageSevenThumbnail={data.image.imageSevenThumbnail.default.src}
          imageEightThumbnail={data.image.imageEightThumbnail.default.src}
          price={data.price}
          closeModal={() => setIsOpenModal(false)}
        />
      ) : null}
    </div>
  );
};

export default SkinsBrowser;

