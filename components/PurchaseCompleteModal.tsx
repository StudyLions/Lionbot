import useOnClickOutside from "@/hooks/useOnClickOutside";
import React, {useRef} from "react";

interface IProps {
  closeModal: () => void
}

export function PurchaseCompleteModal(props: IProps) {
  const ref = useRef();
  useOnClickOutside(ref, () => props.closeModal());

  return <>
    <div className="fixed inset-0 flex justify-center items-center bg-transparentBlack20 z-10">
      <div ref={ref} className="relative w-[400px] h-[301px] m-auto bg-orange1 rounded-[30px]">
        <img src={'https://cdn.discord.study/images/purchase_complete.png'}
             className="absolute top-[-90px] left-[50%] -translate-x-[50%]" width={156} height={156}
             alt={'Payment failed.'}/>
        <h1 className="mt-[70px] text-center text-blue0 text-3xl font-extrabold uppercase">Purchase Complete</h1>
        <p className="text-center text-black50 text-base mt-[8px] px-[37px]">
          Thank you for supporting our project.
        </p>
        <p className="text-center text-black50 text-base mt-[10px] px-[37px]">
          The Gems will be added to your account in the next 24 hours. Make sure to open your DM on Discord
        </p>
        <div className="flex justify-between gap-[20px] mt-[20px] px-[37px]">
          <button className="w-full bg-blue0 h-[36px] rounded-2xl uppercase font-bold hover:bg-blue1">Browse skins
          </button>
          <button className="w-full bg-blue0 h-[36px] rounded-2xl uppercase font-bold hover:bg-blue1"
                  onClick={() => props.closeModal()}>
            Close
          </button>
        </div>
      </div>
    </div>
  </>;
}
