import React, { useState } from "react";
import Image from "next/image";

const SkinModal = (props) => {
  // Grab window width
  const windowWidth = window.innerWidth;
  // Define various classes later to be used
  let fluidHeight;
  let fluidWidth;
  let fluidWidthClass;
  let fluidImageContainer;
  let fluidInfoContainer;
  let modalWidth;
  let fluidJustify;

  // Calculate various classes depending on the window width
  if (windowWidth > 1921) {
    modalWidth = `w-5/12`;
    fluidWidth = 100;
    fluidHeight = 100;
    fluidWidthClass = "w-11/12";
    fluidJustify = `justify-between`;
    fluidImageContainer = "w-5/12";
    fluidInfoContainer = "w-6/12";
  } else if (windowWidth > 1280) {
    modalWidth = `w-9/12`;
    fluidWidth = 100;
    fluidHeight = 100;
    fluidWidthClass = "w-11/12";
    fluidJustify = `justify-between`;
    fluidImageContainer = "w-5/12";
    fluidInfoContainer = "w-6/12";
  } else if (windowWidth > 967) {
    modalWidth = `w-11/12`;
    fluidWidth = 100;
    fluidHeight = 100;
    fluidWidthClass = "w-11/12";
    fluidJustify = `justify-between`;
    fluidImageContainer = "w-5/12";
    fluidInfoContainer = "w-6/12";
  } else if (windowWidth > 767) {
    modalWidth = `w-11/12`;
    fluidWidth = 140;
    fluidHeight = 140;
    fluidWidthClass = "w-full";
    fluidJustify = `justify-center`;
    fluidImageContainer = "w-11/12";
    fluidInfoContainer = "w-11/12";
  } else if (windowWidth > 650) {
    modalWidth = `w-11/12`;
    fluidWidth = 100;
    fluidHeight = 100;
    fluidWidthClass = `w-full`;
    fluidJustify = `justify-center`;
    fluidImageContainer = "w-11/12";
    fluidInfoContainer = "w-11/12";
  } else {
    modalWidth = `w-full`;
    fluidWidth = 70;
    fluidHeight = 70;
    fluidWidthClass = `w-full`;
    fluidJustify = "justify-center";
    fluidImageContainer = "w-5/12";
    fluidInfoContainer = "w-6/12";
  }

  let thumbnailImageWidth = fluidWidth;
  let thumbnailImageHeight = fluidHeight;
  let mainImageWidth = 400;
  let mainImageHeight = 400;
  const [mainImage, setMainImage] = useState(props.imageOne);

  // #bc4a49
  return (
    <div className="fixed inset-0 overflow-auto flex justify-center items-center bg-transparentBlack20 z-50">
      <div
        className={`flex flex-wrap ${fluidJustify} items-stretch relative ${modalWidth} h-fit m-auto bg-slate-900 rounded-[30px] `}
      >
        <div
          className={` flex justify-center items-center ${fluidImageContainer} md:w-11/12 mx-0 my-0 sm:mx-auto sm:my-4 p-8 bg-slate-800 rounded-3xl`}
        >
          <Image
            src={mainImage}
            width={mainImageWidth}
            objectFit="contain"
            height={mainImageHeight}
            alt={props.label}
          />
        </div>
        <div
          className={`${fluidInfoContainer} md:w-11/12 mx-0 my-0 sm:mx-auto sm:my-4 flex flex-wrap  justify-between items-center`}
        >
          <div className={`flex flex-wrap ${fluidWidthClass} justify-between items-center my-3`}>
            <h1 className="text-center text-[#fff] text-3xl font-extrabold uppercase">{props.label}</h1>
            <div className="flex w-32 justify-between items-center">
              <Image
                src={require("@/public/icons/diamond-white.svg")}
                alt="Star icon"
                layout="fixed"
                height={40}
                width={35}
                objectFit="contain"
              />
              <p className="text-center font-black text-[#fff] text-2xl">
                {props.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="w-full mt-2 border-solid border-b rounded-xl border-[#fff]"></div>
          </div>
          {/* Thumbnails */}
          <div className={`${fluidWidthClass} flex flex-wrap justify-center items-center gap-[10px]`}>
            <img
              onClick={() => setMainImage(props.imageOne)}
              className="cursor-zoom-in"
              src={props.imageOneThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageTwo)}
              className="cursor-zoom-in"
              src={props.imageTwoThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageThree)}
              className="cursor-zoom-in"
              src={props.imageThreeThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageFour)}
              className="cursor-zoom-in"
              src={props.imageFourThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageFive)}
              className="cursor-zoom-in"
              src={props.imageFiveThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageSix)}
              className="cursor-zoom-in"
              src={props.imageSixThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageSeven)}
              className="cursor-zoom-in"
              src={props.imageSevenThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
            <img
              onClick={() => setMainImage(props.imageEight)}
              className="cursor-zoom-in"
              src={props.imageEightThumbnail}
              width={thumbnailImageWidth}
              height={thumbnailImageHeight}
              alt=""
            />
          </div>
          {/* Buttons / Guidance */}
          <div className={`${fluidWidthClass} flex flex-wrap justify-between items-stretch flex-col my-3`}>
            <p className="text-center text-lg p-2 mb-4 border-solid border-b border-l border-r border-t rounded-lg border-[#fff]">
              To purchase, use the command <span className="font-black">!skin</span>
            </p>
            <div className="flex flex-wrap justify-evenly items-center ex_sm:flex-col">
              <p className="flex flex-wrap justify-evenly items-center w-6/12 p-2 border-solid border-b border-l border-r border-t rounded-3xl border-[#fff] text-[#fff] font-medium text-sm uppercase">
                <Image
                  src={require("@/public/icons/diamond-white.svg")}
                  alt="Star icon"
                  layout="fixed"
                  height={20}
                  width={18}
                  objectFit="contain"
                />{" "}
                Get Liongems
              </p>
              <p className="flex flex-wrap justify-evenly items-center w-5/12 p-2 border-solid border-b border-l border-r border-t rounded-3xl border-[#fff] text-[#fff] font-semibold text-sm uppercase">
                <Image
                  src={require("@/public/icons/star-white.svg")}
                  alt="Star icon"
                  layout="fixed"
                  height={20}
                  width={18}
                  objectFit="contain"
                />{" "}
                Go Premium
              </p>
            </div>
          </div>
        </div>
        <button
          className="w-full mt-4 bg-blue0 h-[36px] rounded-2xl uppercase font-bold hover:bg-blue1"
          onClick={() => props.closeModal()}
        >
          Close
        </button>
      </div>
      {/* </div> */}
    </div>
  );
};

export default SkinModal;

