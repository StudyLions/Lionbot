import React from 'react';

import styles from "./Header.module.scss"
import {LoginButtonAndMenuDropdown} from "@/components/Header/LoginButtonAndMenuDropdown";
import {SupportUsDropdown} from "@/components/Header/SupportUsDropdown";

export default function Header() {
  return (
    <header className={`container ${styles.navbar}`}>
      <h1 className={styles.studyLion}>StudyBot</h1>
      <div className={styles.navbar_links}>
        <p className={styles.navbar_item}>
          <a href={'https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot'} target={'_blank'} rel="noreferrer">
            Invite the bot
          </a>
        </p>
        <p className={styles.navbar_item}>
          <a href={'https://izabellakis.notion.site/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707'} target={'_blank'} rel="noreferrer">
            Tutorials
          </a>
        </p>
        <p className={styles.navbar_item}>
          Anki Addon
        </p>
        <SupportUsDropdown/>
      </div>

      <LoginButtonAndMenuDropdown/>
    </header>
  )
}
