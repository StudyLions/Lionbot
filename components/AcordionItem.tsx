import React, { useState } from "react";
import Image from "next/image";

const greyColor = {
  color: "#B6B6B6",
};

interface IProps {
  question: string;
  answer: any;
}

export default function AcordionItem({ question, answer }: IProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <>
      <div className={"flex items-center justify-between md:gap-[20px] md:items-start"}>
        <button
          className={`font-bold text-[25px] leading-[50px] sm:leading-[30px] sm:text-[18px] cursor-pointer text-[#D0D0D0]
          text-left`}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {question}
        </button>
        <Image
          src={require("@/public/icons/arrow_blue.svg")}
          className={`ml-auto cursor-pointer ${isExpanded ? "rotate-0" : "-rotate-90"}`}
          alt="Blue arrow icon"
          layout="fixed"
          height={30}
          width={20}
          objectFit="contain"
          onClick={() => setIsExpanded(!isExpanded)}
        />
      </div>
      <p
        className={`text-[18px] sm:text-[16px] leading-[32px] w-5/6 sm:w-full mt-2 transition-all text-[#B6B6B6] ${
          isExpanded ? "opacity-100 h-full" : "opacity-0 h-0"
        }`}
        style={greyColor}
      >
        {answer}
      </p>
    </>
  );
}
