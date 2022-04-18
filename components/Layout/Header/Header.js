import React from "react";
import Link from "next/link";

import styles from "./Header.module.scss";
import { LoginButtonAndMenuDropdown } from "@/components/Layout/Header/LoginButtonAndMenuDropdown";
import { SupportUsDropdown } from "@/components/Layout/Header/SupportUsDropdown";
import { NavigationPaths } from "constants/types";
import Banner from "@/components/Layout/Header/Banner";

export default function Header() {
  return (
    <div className={"flex flex-col bg-[#1B2137]"}>
      <header className={`${styles.navbar}`}>
        <Link href={NavigationPaths.Home}>
          <a className={styles.studyLion}>StudyBot</a>
        </Link>
        <div className={styles.navbar_links}>
          <p className={styles.navbar_item}>
            <a
              href={"https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot"}
              target={"_blank"}
              rel="noreferrer"
            >
              Invite the bot
            </a>
          </p>
          <p className={styles.navbar_item}>
            <a
              href={"https://izabellakis.notion.site/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707"}
              target={"_blank"}
              rel="noreferrer"
            >
              Tutorials
            </a>
          </p>
          <p className={styles.navbar_item}>Anki Addon</p>
          <SupportUsDropdown />
        </div>

        <LoginButtonAndMenuDropdown />
      </header>
      <Banner />
    </div>
  );
}
