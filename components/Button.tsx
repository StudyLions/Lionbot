import Link from "next/link";
import Image from "next/image";
import React from "react";
import { IButton } from "@/models/button";

const Button = ({ image, label }: IButton) => {
  return (
    <>
      <Link href={"#"}>
        <a
          className={"flex items-center justify-center h-[50px] gap-[10px] bg-white px-[20px] py-[10px] rounded-[24px]"}
        >
          {image && (
            <Image
              src={image.src}
              priority
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
    </>
  );
};

export default Button;
