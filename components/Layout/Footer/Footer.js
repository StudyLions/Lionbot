import styles from './Footer.module.scss'
import {LegalItems, MenuItems} from 'constants/Footer'

export default function Footer() {
  return <div style={{background: '#1B1B1B'}}>
    <footer className={styles.containerFooter}>
      <div className={styles.aboutProject}>
        <h1 className={styles.title}>StudyLion</h1>
        <p className={styles.description}>
          Is a project made by students for students.
          <br/><br/>
          We are based in Israel, Tel Aviv. You can contact us by sending an email to contact@discord.study, we will get
          back to you as soon as possible.
          <br/><br/>
          Discord.Study is not affiliated with Discord Inc. in any way.
        </p>
        <p className={styles.copyright}>© 2022 Ari Horesh, All Rights Reserved</p>
      </div>

      <div className={styles.menuContainer}>
        <h1 className={styles.title}>Menu</h1>
        {MenuItems.map((item, index) => (
          <a className={styles.item} href={item.link.href} target={item.link.target} key={item.title + index} rel="noreferrer">{item.title}</a>
        ))}
      </div>

      <div className={styles.legalContainer}>
        <h1 className={styles.title}>Legal</h1>
        {LegalItems.map((item, index) => (
          <a className={styles.item} href={item.href} key={item.title + index}>{item.title}</a>
        ))}
      </div>
    </footer>
  </div>
}
