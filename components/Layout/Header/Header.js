import React from "react";
import Link from "next/link";

import styles from "./Header.module.scss";
import { LoginButtonAndMenuDropdown } from "@/components/Layout/Header/LoginButtonAndMenuDropdown";
import { PremiumDropdown } from "@/components/Layout/Header/PremiumDropdown";
import { NavigationPaths } from "constants/types";
import Banner from "@/components/Layout/Header/Banner";
import Image from "next/image";

export default function Header() {
  return (
    <div className={"fixed lg:relative top-0 inset-x-0 z-50 flex flex-col bg-[#1B2137]"}>
      <header className={`${styles.navbar}`}>
        <Link href={NavigationPaths.Home}>
          <a className={styles.studyLion}>LionBot</a>
        </Link>
        <div className={styles.navbar_links}>
          <p className={"text-[18px] font-semibold leading-[25px] tracking-[0.2em] uppercase cursor-pointer"}>
            <a
              href={"https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot"}
              target={"_blank"}
              rel="noreferrer"
            >
              Invite the bot
            </a>
          </p>
          <p className={"text-[18px] font-semibold leading-[25px] tracking-[0.2em] uppercase cursor-pointer"}>
            <a
              href={"https://izabellakis.notion.site/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707"}
              target={"_blank"}
              rel="noreferrer"
            >
              Tutorials
            </a>
          </p>
          <Link href={"/coming-soon"}>
            <a className={"text-[18px] font-semibold leading-[25px] tracking-[0.2em] uppercase cursor-pointer"}>
              Anki Addon
            </a>
          </Link>

          <Link href={"/liongems"}>
            <a
              className={
                "alignCenter gap-[10px] text-[18px] text-[#FFB636] font-semibold leading-[25px] tracking-[0.2em] uppercase cursor-pointer"
              }
            >
              <Image
                src={require("@/public/icons/diamond-yellow.svg")}
                priority
                alt="Star icon"
                layout="fixed"
                height={30}
                width={25}
                objectFit="contain"
              />
              LionGems
            </a>
          </Link>
          <PremiumDropdown />
        </div>
        <LoginButtonAndMenuDropdown />
      </header>
      <Banner />
    </div>
  );
}
