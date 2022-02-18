import React from 'react';

import styles from "./Header.module.scss"
import {DiscordLoginButton} from "@/components/Header/DiscordLoginButton";
import {SupportUsButton} from "@/components/Header/SupportUsButton";

export default function Header() {


  return (
    <header className={styles.navbar}>
      <h1 className={styles.studyLion}>StudyBot</h1>
      <div className={styles.links}>
        <p className={styles.link}>
          Invite the bot
        </p>
        <p className={styles.link}>
          Tutorials
        </p>
        <p className={styles.link}>
          Anki Addon
        </p>
        <SupportUsButton/>
      </div>

      <DiscordLoginButton/>
    </header>
  )
}
