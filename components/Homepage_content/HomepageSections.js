import { Homepage_sections_middle } from "constants/Homepage";
import styles from "./Homepage.module.scss";

export default function HomepageSections() {
  return Homepage_sections_middle.map((card, i) => (
    <div className={styles.container_card} key={card.title + i}>
      <div className={`${styles.card}`}>
        <div className={`${styles.card_text}`}>
          <div className={styles.title_card}>
            <h3>{card.title}</h3>
          </div>
          <div className={styles.description_white} dangerouslySetInnerHTML={{ __html: card.description }}></div>
        </div>
        <img className={styles.card_image} src={card.image.src} alt={card.image.alt} loading={"lazy"} />
      </div>
    </div>
  ));
}
