import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import useOnClickOutside from "@/hooks/useOnClickOutside";
import useWindowSize from "@/hooks/useWindowSize";
import { NavigationPaths } from "@/constants/types";

const SkinModal = (props) => {
  const { width } = useWindowSize();
  const ref = useRef();
  useOnClickOutside(ref, () => props.closeModal());

  // create an event listener

  // Define various classes later to be used
  let fluidHeight;
  let fluidWidth;
  let fluidWidthClass;
  let fluidImageContainer;
  let fluidInfoContainer;
  let modalWidth;
  let fluidJustify;

  const handleRefresh = () => {
    // Grab window width
    if (width >= 1920) {
      modalWidth = `w-[1000px]`;
      fluidWidth = 90;
      fluidHeight = 90;
      fluidWidthClass = "w-11/12";
      fluidJustify = `justify-between`;
      fluidImageContainer = "w-6/12";
      fluidInfoContainer = "w-6/12";
    } else if (width > 1280 && width < 1919) {
      modalWidth = `w-8/12`;
      fluidWidth = 100;
      fluidHeight = 100;
      fluidWidthClass = "w-11/12";
      fluidJustify = `justify-between`;
      fluidImageContainer = "w-5/12";
      fluidInfoContainer = "w-7/12";
    } else if (width > 967) {
      modalWidth = `w-11/12`;
      fluidWidth = 100;
      fluidHeight = 100;
      fluidWidthClass = "w-11/12";
      fluidJustify = `justify-between`;
      fluidImageContainer = "w-5/12";
      fluidInfoContainer = "w-7/12";
    } else if (width > 767) {
      modalWidth = `w-11/12`;
      fluidWidth = 140;
      fluidHeight = 140;
      fluidWidthClass = "w-full";
      fluidJustify = `justify-center`;
      fluidImageContainer = "w-11/12";
      fluidInfoContainer = "w-11/12";
    } else if (width > 650) {
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
      fluidInfoContainer = "w-7/12";
    }
  };

  handleRefresh();
  // Calculate various classes depending on the window width

  let thumbnailImageWidth = fluidWidth;
  let thumbnailImageHeight = fluidHeight;
  let mainImageWidth = 400;
  let mainImageHeight = 400;
  const [mainImage, setMainImage] = useState(props.imageOne);

  // #bc4a49
  return (
    <div className="fixed inset-0 overflow-auto flex justify-center items-center bg-transparentBlack20 z-50">
      <div
        ref={ref}
        className={`flex flex-wrap ${fluidJustify} items-stretch relative ${modalWidth} h-fit m-auto bg-slate-900 rounded-3xl`}
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
          className={`${fluidInfoContainer} md:w-11/12 mx-0 my-0 sm:mx-auto sm:my-4 p-4 flex flex-wrap justify-center items-center`}
        >
          <div className={`flex flex-wrap ${fluidWidthClass} justify-between items-center my-3`}>
            <h1 className="text-center text-[#fff] text-3xl font-extrabold uppercase">{props.label}</h1>
            <div className="flex w-fitContent justify-between items-center">
              <Image
                src={require("@/public/icons/diamond-white.svg")}
                alt="Star icon"
                layout="fixed"
                height={30}
                width={30}
                objectFit="contain"
              />
              <p className="text-center ml-2 font-black text-[#fff] text-2xl">
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
            <p className="text-center p-2 mb-4 border-solid border-b border-l border-r border-t rounded-lg border-[#fff]">
              To purchase, use the command <span className="font-black">!skin</span>
            </p>
            <div className="flex flex-wrap justify-evenly items-center ex_sm:flex-col">
              <a
                href={NavigationPaths.donate + "#premiumPlans"}
                className="flex flex-wrap justify-evenly items-center w-6/12 p-2 border-solid border-b border-l border-r border-t rounded-3xl border-[#fff] text-[#fff] font-medium text-sm uppercase"
              >
                <Image
                  src={require("@/public/icons/diamond-white.svg")}
                  alt="Star icon"
                  layout="fixed"
                  height={20}
                  width={18}
                  objectFit="contain"
                />{" "}
                Get Liongems
              </a>
              <a
                href={NavigationPaths.donate + "#getLionsGems"}
                className="flex flex-wrap justify-evenly items-center w-5/12 p-2 border-solid border-b border-l border-r border-t rounded-3xl border-[#fff] text-[#fff] font-semibold text-sm uppercase"
              >
                <Image
                  src={require("@/public/icons/star-white.svg")}
                  alt="Star icon"
                  layout="fixed"
                  height={20}
                  width={18}
                  objectFit="contain"
                />{" "}
                Go Premium
              </a>
            </div>
          </div>
        </div>
        <div
          className="absolute mdlg:fixed mdlg:bg-indigo-400 mdlg:p-2 mdlg:rounded-md right-5 top-2 cursor-pointer"
          onClick={() => props.closeModal()}
        >
          <Image
            src={require("@/public/icons/close-white.svg")}
            alt="Close icon"
            height={16}
            width={16}
            objectFit="contain"
          />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};

export default SkinModal;

