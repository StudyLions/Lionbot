import Image from "next/image";
import React from "react";

import AcordionItem from "@/components/AcordionItem";
import { questionsAnswers } from "@/constants/FAQ";
import { scrollTo } from "@/utils/scrollTo";

export default function LionGemsFAQSection() {
  return (
    <div className={`pb-[200px]`}>
      {/* FAQ Accordion Items*/}
      <div className={`max-w-[1000px] mx-auto relative pt-[100px]`}>
        <h1 className={`uppercase text-center font-bold text-[55px] sm:text-[45px] text-white pt-[50px]`}>FAQ</h1>
        {questionsAnswers.map((item) => {
          return (
            <div className={"my-7"} key={item.question}>
              <AcordionItem {...item} />
            </div>
          );
        })}
        {/*  Scroll to top button */}
        <div
          onClick={() => scrollTo({ id: "donate_page", duration: 1000 })}
          className={
            "absolute bottom-[-100px] right-[-10px] w-[70px] h-[70px] bg-[#595959] alignCenter rounded-[40px] " +
            "cursor-pointer rotate-[-90deg] lg:w-[60px] lg:h-[60px] lg:right-[10px]"
          }
        >
          <Image
            src={require("@/public/icons/arrow-gray.svg")}
            alt="Blue arrow icon"
            layout="fixed"
            height={35}
            width={20}
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
}
