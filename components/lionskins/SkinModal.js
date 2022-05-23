import React, { useState } from "react";
import Image from "next/image";

const SkinModal = (props) => {
  let thumbnailImageWidth = 100;
  let thumbnailImageHeight = 100;
  let mainImageWidth = 400;
  let mainImageHeight = 400;
  const [mainImage, setMainImage] = useState(props.imageOne);

  console.log("Here are your props:", props);
  return (
    <>
      <div className="fixed inset-0 flex justify-center items-center bg-transparentBlack20 z-50">
        <div className="flex justify-between items-stretch relative w-[1024px] h-[600px] m-auto bg-gray-100 rounded-[30px] sm:h-fit">
          <div className="flex justify-center items-center w-6/12 mr-12 bg-gray-200 rounded-3xl">
            <img src={mainImage} width={mainImageWidth} height={mainImageHeight} alt={props.label} />
          </div>
          <div className="flex flex-col justify-center items-stretch w-6/12">
            <div className="flex flex-wrap w-11/12 justify-between items-center my-3">
              <div className="flex w-11/12 justify-between items-center my-3">
                <h1 className="text-center text-[#bc4a49] text-3xl font-extrabold uppercase">{props.label}</h1>
                <div className="flex w-32 justify-between items-center">
                  <Image
                    src={require("@/public/icons/diamond-red.svg")}
                    alt="Star icon"
                    layout="fixed"
                    height={40}
                    width={35}
                    objectFit="contain"
                  />
                  <p className="text-center font-black text-[#bc4a49] text-2xl text-rose-700">
                    {props.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex flex-wrap">
                <div className="flex flex-wrap gap-[5px]">
                  <img
                    onClick={() => setMainImage(props.imageTwo)}
                    src={props.imageTwo}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageThree)}
                    src={props.imageThree}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageFour)}
                    src={props.imageFour}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageFive)}
                    src={props.imageFive}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageSix)}
                    src={props.imageSix}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageSeven)}
                    src={props.imageSeven}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageEight)}
                    src={props.imageEight}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageNine)}
                    src={props.imageNine}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageTen)}
                    src={props.imageTen}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                  <img
                    onClick={() => setMainImage(props.imageEleven)}
                    src={props.imageEleven}
                    width={thumbnailImageWidth}
                    height={thumbnailImageHeight}
                    alt=""
                  />
                </div>
              </div>
              {/* Buttons / Guidance */}
              <div className="flex flex-wrap justify-between items-stretch ex_sm:flex-col my-3">
                <p className="w-7/12 text-center text-lg p-2 border-solid border-2 rounded-3xl border-[#bc4a49] text-slate-900">
                  To purchase, use the command <span className="text-[#bc4a49]">!skin</span>
                </p>
                <div className="w-40 flex flex-wrap ex_sm:flex-col">
                  <p className="flex flex-wrap justify-between items-center w-11/12 p-1 mb-2 border-solid border-2 rounded-3xl border-[#bc4a49] text-[#bc4a49] font-black text-sm uppercase">
                    <Image
                      src={require("@/public/icons/diamond-red.svg")}
                      alt="Star icon"
                      layout="fixed"
                      height={20}
                      width={18}
                      objectFit="contain"
                    />{" "}
                    Get Premium
                  </p>
                  <p className="flex flex-wrap justify-between items-center w-11/12 p-1 border-solid border-2 rounded-3xl border-[#bc4a49] text-[#bc4a49] font-semibold text-sm uppercase">
                    <Image
                      src={require("@/public/icons/diamond-red.svg")}
                      alt="Star icon"
                      layout="fixed"
                      height={20}
                      width={18}
                      objectFit="contain"
                    />{" "}
                    Get Liongems
                  </p>
                </div>
              </div>
              {/* <button
                  className="w-full bg-blue0 h-[36px] rounded-2xl uppercase font-bold hover:bg-blue1"
                  onClick={() => props.closeModal()}
                >
                  Close
                </button> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkinModal;

