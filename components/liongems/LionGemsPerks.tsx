import { PerksData } from "@/constants/PerksData";
import { ReactNode } from "react";

const LionGemsPerks = () => {
  return (
    <div className={"min-h-[1000px] bg-gradient-to-b from-[#BE414B] to-[#1B2137]"}>
      <div className={"max-w-[1120px] h-full mx-auto"}>
        <h1 className={"uppercase font-bold text-7xl text-center pt-[67px] pb-[50px]"}>Perks</h1>
        <div className={"flex flex-row"}>
          <div className={"w-1/2"}>
            <img src={"https://cdn.discord.study/images/LionPic.png"} alt="LionPet gift card" />
          </div>
          <div className={"w-1/2 flex flex-col"}>
            {PerksData.map((perk: string, index: number) => {
              return (
                <>
                  <div className={"flex flex-row gap-5 py-[10px]"}>
                    <img src={"https://cdn.discord.study/images/yellow_checkbox.svg"} alt="LionPet gift card" />
                    <div
                      className={"font-medium text-[20px] leading-[32px] text-[#F3F3F3]"}
                      key={index}
                      dangerouslySetInnerHTML={{ __html: perk }}
                    />
                  </div>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LionGemsPerks;
