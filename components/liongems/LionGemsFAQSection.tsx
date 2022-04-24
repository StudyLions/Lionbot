import Image from "next/image";
import React from "react";

import AcordionItem from "@/components/AcordionItem";
import { questionsAnswers } from "@/constants/FAQ";
import { scrollTo } from "@/utils/scrollTo";

export default function LionGemsFAQSection() {
  return (
    <div className={`pb-[200px]`}>
      {/* FAQ Accordion Items*/}
      <div className={`container relative`}>
        <h1 className={`uppercase text-center font-bold text-7xl mb-[60px] text-white`}>FAQ</h1>
        {questionsAnswers.map((item) => {
          return (
            <div className={"my-7"} key={item.question}>
              <AcordionItem {...item} />
            </div>
          );
        })}
        {/*  Scroll to top button */}
        <div
          onClick={() => scrollTo({ id: "liongems_page", duration: 1000 })}
          className={
            "absolute bottom-[-100px] right-[-150px] w-[80px] h-[80px] bg-[#595959] alignCenter rounded-[40px] " +
            "cursor-pointer rotate-[-90deg]"
          }
        >
          <Image
            src={require("@/public/icons/arrow-gray.svg")}
            alt="Blue arrow icon"
            layout="fixed"
            height={45}
            width={30}
            objectFit="contain"
          />
        </div>
      </div>
    </div>
  );
}
