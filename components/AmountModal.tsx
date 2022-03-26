import {useEffect, useRef, useState} from "react";
import {Image} from 'next/image'
import useOnClickOutside from "@/hooks/useOnClickOutside";
import styles from "@/components/Layout/Header/Header.module.scss";

interface IProps {
  amount: number,
  tokens: string,
  tokens_bonus: string,
  image: string,
  onClickOutside: () => void
}

export function AmountModal(props: IProps) {
  const ref = useRef();
  const [quantity, setQuantity] = useState(0)
  useOnClickOutside(ref, () => props.onClickOutside());

  console.log('props', props)

  const QuantityCounter = () => {
    return <>
      <div className="flex alignCenter text-gray20 border-[1.5px] border-gray20 border-solid rounded-md">
        <button className="px-2 cursor-pointer font-medium text-[20px]"
                onClick={() => quantity && setQuantity(quantity - 1)}>-
        </button>
        <input className="w-16 h-[28px] text-center text-gray15 bg-transparent border-x-[1px] border-gray20 font-bold"
               disabled={true}
               value={quantity}/>
        <button className="px-2 cursor-pointer font-medium text-[20px]" onClick={() => setQuantity(quantity + 1)}>+
        </button>
      </div>
    </>
  }

  return <>
    <div className="fixed inset-0 flex justify-center items-center bg-transparentBlack20">
      <div ref={ref} className="w-[607px] h-[402px] m-auto flex">
        <div className="w-full px-[26px] py-[20px] bg-gradient-to-b from-cream60 to-cream90 rounded-l-[27px]">
          <h1 className="text-black20 text-[30px] font-bold">Purchase</h1>
          <img src={props.image} alt={props.tokens} className="w-fit mt-[30px]"/>
        </div>
        <div className="flex flex-col w-full pl-[16px] pr-[26px] pt-[20px] rounded-r-[27px] bg-cream90 flex flex-col">
          <h1 className="text-red20 text-[30px] font-bold">300</h1>
          <hr className="px-5 bg-cream40 h-[2px] mt-1 mb-3"/>
          <p className="text-gray20 text-[14px] leading-5 mb-7">
            Support the team and keep the project alive by getting some LionGems!
          </p>
          <p className="text-gray20 text-[14px] leading-5">
            Purchase colored skins, gift LionGems to your loved ones, and unlock special perks for your server or
            yourself!
          </p>
          <p className="text-gray20 font-medium mt-3 text-[12px]">+{props.tokens_bonus} bonus</p>
          <h3 className="text-gray15 font-medium mt-5 text-[16px]">Quantity</h3>
          <div className="flex justify-between mt-2">
            <QuantityCounter/>
            <h1 className="text-red50 font-bold text-[28px]">
              €{`${quantity > 1 ? (props.amount * quantity).toFixed(2) : props.amount}`}
            </h1>
          </div>
          <button className={`mt-auto mb-[35px] bg-orange0 h-[35px] rounded-3xl font-bold text-[23px]
          ${!quantity && 'opacity-50 cursor-not-allowed'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  </>
}
