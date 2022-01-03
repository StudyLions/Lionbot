import Image from 'next/image'
import styles from "./index.module.scss"
import {default as cards} from './bot-cards-info.json'
import Layout from 'components/layout'

export default function Page() {
  return (
    <Layout>
      <div>
        <div className={styles.container_card}>
          <div className={`row flex-row ${styles.card}`}>
            <div className="col-md-6 col-sm-12">
              <div className={styles.title_blue}>Build the best Discord study community</div>

              <div className={styles.description_white}>
                <b>StudyLion</b> is the best, <b>open-source</b>, all-in-one solution that <b>every study community
                needs.</b>
              </div>
              <div className={`fst-italic ${styles.description_white}`}>
                Learn how to create a Discord co-working environment for your classmates or coworkers!
              </div>
              <div className={styles.description_white}>
                Start <a className={`text-decoration-none ${styles.link}`} href={'https://discord.studylions.com/invite'}
                         target={'_blank'}>inviting
                our StudyLion bot</a> to your Discord community and configuring it using our tutorials.
              </div>
            </div>
            <div className={`col-md-6 col-sm-12 ${styles.image_card}`}>
              <Image
                src={require('public/images/banner-1.png')}
                alt="Study bot lion discord logo"
              />
            </div>
          </div>
        </div>

        <div className={`text-center ${styles.trusted_by_2500}`}>Trusted by 2,500+ Study Servers</div>

        {cards.map((card, i) => (
          <div className={styles.container_card} key={card.title + i}>
            <div className={`row ${styles.card}`}>
              <div className="col-md-6 col-sm-12">
                <div className={styles.title_blue}>{card.title}</div>
                <div className={styles.description_white}>{card.description_1}</div>
                <div className={`${styles.description_white}`}>{card.description_2}</div>
              </div>
              <div className={`col-md-6 col-sm-12 ${styles.image_card}`}>
                <Image
                  src={require(`public/images/${card.image.src}`)}
                  alt={card.image.alt}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  )
}
