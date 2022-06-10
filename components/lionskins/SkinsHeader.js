import React from "react";

const SkinsHeader = () => {
  return (
    <div className={`flex flex-col justify-center pt-[150px] md:pt-[30px]`}>
      <div className={"flex items-center justify-center md:ml-5 sm:ml-0 "}>
        <h1 className={`uppercase text-[50px] font-bold text-white-900`}>Skin Collection</h1>
      </div>
    </div>
  );
};

export default SkinsHeader;
