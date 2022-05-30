import React, { useRef } from "react";

import useOnClickOutside from "@/hooks/useOnClickOutside";
import createPaymentSession from "@/utils/createPaymentSession";
import { IBasket } from "@/models/donation";
import Image from "next/image";

interface IProps {
  closeModal: () => void;
}

export function PurchaseFailedModal(props: IProps) {
  const ref = useRef();
  useOnClickOutside(ref, () => props.closeModal());

  const retryPayment = () => {
    let basket: IBasket = JSON.parse(localStorage.getItem("basket"));
    if (basket) {
      createPaymentSession(basket.id, basket.quantity);
    }
  };

  return (
    <>
      <div className="fixed inset-0 flex justify-center items-center bg-transparentBlack20 z-[99]">
        <div
          ref={ref}
          className="relative w-[400px] m-auto bg-cream50 rounded-[30px] px-[37px]
        md:mx-[20px] pb-[20px]"
        >
          <div className="absolute top-[-90px] left-[50%] -translate-x-[50%]">
            <Image
              src={require("@/public/images/pages/donate/purchase_failed.png")}
              className=""
              width={156}
              height={156}
              alt={"Payment failed."}
            />
          </div>
          <h1 className="mt-[70px] text-center text-red05 text-3xl font-extrabold uppercase">Purchase Failed</h1>
          <p className="text-center text-black50 text-base mt-[8px]">
            We couldn&apos;t confirm your payment, please retry.
          </p>
          <p className="text-center text-black50 text-base mt-[10px]">
            If it&apos;s a mistake, please contact our support team at{" "}
            <span className="font-medium">contact@arihoresh.com</span>
          </p>
          <div className="flex justify-between gap-[20px] mt-[20px]">
            <button
              className="w-full bg-red19 h-[36px] rounded-2xl uppercase font-bold hover:bg-red04"
              onClick={() => retryPayment()}
            >
              Retry
            </button>
            <button
              className="w-full bg-red19 h-[36px] rounded-2xl uppercase font-bold hover:bg-red04"
              onClick={() => props.closeModal()}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
