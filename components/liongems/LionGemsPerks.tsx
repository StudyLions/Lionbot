import { PerksData } from "@/constants/PerksData";
import Image from "next/image";

const LionGemsPerks = () => {
  return (
    <>
      <div className={"max-w-[1120px] h-full mx-auto pt-[100px]"}>
        <h1 className={"uppercase font-bold text-[55px] sm:text-[45px] text-center pt-[67px] pb-[50px]"}>Perks</h1>
        <div className={"flex flex-row md:flex-col"}>
          <div className={"w-1/2 md:w-full md:mb-[30px]"}>
            <Image
              width={500}
              height={500}
              objectFit={"contain"}
              className={"md:mx-auto"}
              src={require("@/public/images/pages/donate/lionbot_gift_wrapped.png")}
              alt="LionPet gift card"
            />
          </div>
          <div className={"w-1/2 flex flex-col md:w-full"}>
            {PerksData.map((perk: string, index: number) => (
              <div key={index} className={"flex flex-row gap-5 py-[10px]"}>
                <div className={"relative w-[40px] h-[40px]"}>
                  <Image
                    src={require("@/public/images/pages/donate/yellow_checkbox.svg")}
                    alt="LionPet gift card"
                    layout={"fill"}
                    objectFit={"contain"}
                  />
                </div>
                <div
                  className={"w-[calc(100%-50px)] text-[18px] leading-[32px] text-[#F3F3F3]"}
                  key={index}
                  dangerouslySetInnerHTML={{ __html: perk }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default LionGemsPerks;
