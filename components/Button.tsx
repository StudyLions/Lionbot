import Link from "next/link";
import Image from "next/image";
import React from "react";
import { IButton } from "@/models/button";
import { scrollTo } from "@/utils/scrollTo";

const Button = ({ image, label, href = "#", target = "_self", scrollingElement }: IButton) => {
  return (
    <div onClick={() => scrollingElement && scrollTo({ id: scrollingElement, duration: 1000 })}>
      <Link href={href} passHref>
        <a
          target={target}
          className={
            "flex items-center justify-center h-[50px] gap-[10px] bg-white px-[20px] py-[10px] rounded-[24px] w-fit"
          }
        >
          {image && (
            <Image
              src={image.src}
              alt="Star icon"
              layout="fixed"
              height={image.height ? image.height : 30}
              width={image.width ? image.width : 25}
              objectFit="contain"
            />
          )}
          <span className={"text-[#BD4949] font-bold uppercase"}>{label}</span>
        </a>
      </Link>
    </div>
  );
};

export default Button;
