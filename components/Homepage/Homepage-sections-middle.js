import Image from "next/image"

import {HomepageSectionsContent} from "constants/HomepageSectionsContent";
import styles from "./Homepage.module.scss"

export default function HomepageSectionsMiddle() {
  return (
    HomepageSectionsContent.map((card, i) => (
      <div className={styles.container_card} key={card.title + i}>
        <div className={`${styles.card}`}>
          <div className={`${styles.card_text}`}>
            <div className={styles.title_card}>
              <h3>{card.title}</h3>
            </div>
            <div className={styles.description_white}>
              <p>{card.description_1}</p>
            </div>
            <div className={`${styles.description_white}`}>
              <p>{card.description_2}</p>
            </div>
          </div>

          <div className={styles.card_image}>
            <Image
              src={card.image.src} alt={card.image.alt}
              layout='fill'
              objectFit='contain'
            />
          </div>
        </div>
      </div>
    ))
  )
}
