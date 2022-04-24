import React from "react";
import styles from "./Homepage.module.scss";
import Image from "next/image";

export default function HomepageTopContent() {
  return (
    <div>
      <div className={`${styles.section} ${styles.homepage_top_content}`}>
        <div className={"relative h-[1000px] w-full lg:hidden"}>
          <Image
            src={"https://cdn.discord.study/images/Homepage_top_image.png"}
            alt={"Homepage_content top image."}
            layout={"fill"}
            objectFit={"cover"}
            priority
          />
        </div>

        <div className={styles.sectionText}>
          <h1 className={styles.bigger_text}>MEET LEO: THE BEST DISCORD BOT</h1>
          <p className={styles.smallerText}>
            Leo is the best, open-source, all-in-one solution that every Discord community needs.
            <br /> <br />
            Activity tracking, clans, tamagotchi, economy, levels, ranking, leaderboards, productivity and moderation
            tools and so much more!
          </p>
          <a
            className={styles.addToServerButton}
            target={"_blank"}
            href={"https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot"}
            rel="noreferrer"
          >
            INVITE THE BOT
          </a>
        </div>
      </div>
    </div>
  );
}
