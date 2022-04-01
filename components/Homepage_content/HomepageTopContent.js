import React from "react";
import styles from './Homepage.module.scss'

export default function HomepageTopContent() {
  return (
    <div>
      <div className={`${styles.section} ${styles.homepage_top_content}`}>
        <img src={'https://cdn.discord.study/images/Homepage_top_image.png'}
             className={styles.backgroundImage}
             alt={'Homepage_content top image.'}/>

        <div className={styles.sectionText}>
          <h1 className={styles.bigger_text}>Build the best Discord study community</h1>
          <p className={styles.smallerText}>
            StudyLion is the best, open-source, all-in-one solution that every study community needs.
            <br/> <br/>
            Learn how to create a Discord co-working environment for your classmates or coworkers!
          </p>
          <a className={styles.addToServerButton} target={'_blank'}
             href={'https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot'}
             rel="noreferrer">
            ADD TO SERVER
          </a>
        </div>
      </div>
    </div>
  )
}
