import Image from 'next/image';
import styles from './index.module.scss';
import {default as cards} from './bot-cards-info.json';
import Layout from 'components/layout';

export default function Page() {
  return (
    <Layout>
      <div>
        <div className={styles.container_card}>
          <div className={`row flex-row ${styles.card}`}>
            <div className="col-12 col-xl-6">
              <div className={styles.title_blue}>
                <h1>Build the best Discord study community with StudyLion</h1>{" "}
              </div>

              <div className={styles.description_white}>
                <p>
                  <b>StudyLion</b> is the best, <b>open-source</b>, all-in-one solution that{" "}
                  <b>every study community needs.</b>
                </p>
              </div>
              <div className={`fst-italic ${styles.description_white}`}>
                <p>Learn how to create a Discord co-working environment for your classmates or coworkers!</p>
              </div>
              <div className={styles.description_white}>
                <p>
                  <a className={`${styles.link}`} href={"https://discord.studylions.com/invite"}>
                    StudyLion Bot
                  </a>{" "}
                  in your Discord community for free with configuration tutorials? Yeap! For Free. Always.
                </p>
                <a
                  className={`d-flex justify-content-center text-decoration-none text-uppercase ${styles.link} ${styles.buttonLink}`}
                  href={"https://discord.studylions.com/invite"}
                  target={"_blank"}
                >
                  Claim StudyLion for Free!
                </a>
              </div>
            </div>
            <div className={`col-12 col-xl-6 ${styles.image_card}`}>
              <Image priority src={require("public/images/banner-1.png")} alt="Study bot lion discord logo" />
            </div>
          </div>
        </div>

        <div className={`text-center ${styles.trusted_by_2500}`}>
          <h2>Trusted by 4,500+ Study Servers</h2>
        </div>

        {cards.map((card, i) => (
          <div className={styles.container_card} key={card.title + i}>
            <div className={`row ${styles.card}`}>
              <div className="col-12 col-lg-6 d-flex flex-column align-items-start justify-content-center">
                <div className={styles.title_blue}>
                  <h3>{card.title}</h3>
                </div>
                <div className={styles.description_white}>
                  <p>{card.description_1}</p>
                </div>
                <div className={`${styles.description_white}`}>
                  <p>{card.description_2}</p>
                </div>
              </div>
              <div className={`col-12 col-lg-6 my-5 md-my-0 ${styles.image_card}`}>
                <Image src={require(`public/images/${card.image.src}`)} alt={card.image.alt} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
