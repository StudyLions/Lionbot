import React, { useState } from "react";

import useOnClickOutside from "@/hooks/useOnClickOutside";

const SkinModal = (props) => {
  const ref = useRef();
  useOnClickOutside(ref, () => props.closeModal());

  return (
    <>
      <div className="fixed inset-0 flex justify-center items-center bg-transparentBlack20 z-50">
        <div className="relative w-[400px] h-[301px] m-auto bg-orange1 rounded-[30px] sm:h-fit">
          <img
            src={"https://cdn.discord.study/images/purchase_complete.png"}
            className="absolute top-[-90px] left-[50%] -translate-x-[50%]"
            width={156}
            height={156}
            alt={"Payment failed."}
          />
          <h1 className="mt-[70px] text-center text-blue0 text-3xl font-extrabold uppercase">{props.label}</h1>
          <p className="text-center text-black50 text-base mt-[10px] px-[37px]">Price for this skin is {props.price}</p>
          <div className="flex justify-between gap-[20px] mt-[20px] px-[37px] ex_sm:flex-col md:pb-[20px]">
            <button
              className="w-full bg-blue0 h-[36px] rounded-2xl uppercase font-bold hover:bg-blue1"
              onClick={() => exitModal(true)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SkinModal;

