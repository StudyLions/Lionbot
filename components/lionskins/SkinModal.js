import React from "react";
import Image from "next/image";

const SkinModal = (props) => {
  return (
    <>
      <div className="fixed inset-0 flex justify-center items-center bg-transparentBlack20 z-50">
        <div className="flex relative w-[60%] h-[800px] m-auto bg-orange1 rounded-[30px] sm:h-fit">
          <div className="flex justify-center items-center w-6/12">
            <img src={props.imageOne} className="" width={600} height={600} alt={"Payment failed."} />
          </div>
          <div className="flex flex-col w-6/12">
            <div className="flex flex-wrap w-11/12 justify-between items-center my-3">
              <div className="flex w-11/12 justify-between items-center my-3">
                <h1 className="text-center text-blue0 text-3xl font-extrabold uppercase">{props.label}</h1>
                <div className="flex w-2/12 justify-between items-center">
                  <Image
                    src={require("@/public/icons/diamond-red.svg")}
                    alt="Star icon"
                    layout="fixed"
                    height={40}
                    width={35}
                    objectFit="contain"
                  />
                  <p className="text-center text-black50 text-2xl text-red-800">
                    {props.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap w-11/12">
                <img src={props.imageTwo} width={200} height={200} alt="" />
              </div>
            </div>
            <div className="flex justify-between gap-[20px] mt-[20px] px-[37px] ex_sm:flex-col md:pb-[20px]">
              <button
                className="w-full bg-blue0 h-[36px] rounded-2xl uppercase font-bold hover:bg-blue1"
                onClick={() => props.closeModal()}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkinModal;
