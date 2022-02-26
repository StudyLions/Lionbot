import styles from "@/components/Homepage/Homepage.module.scss";
import {Servers_list, Counters_list} from "constants/Homepage";

function HowToUse() {
  return <>
    <div className={styles.container_card} style={{backgroundColor: '#27559A'}}>
      <div className={`${styles.card}`} style={{flexDirection: "row-reverse"}}>
        <div className={`${styles.card_text}`}>
          <div className={styles.title_card}>
            <h3 style={{color: '#fff'}}>How to use</h3>
          </div>
          <div className={styles.description_white}>
            <p>Learn how to use and configure StudyLion on your server!</p>
          </div>
          <div className={`${styles.description_white}`}>
            <p>Tutorials are availabe for admins, moderators and users.</p>
          </div>
        </div>
        <img className={styles.card_image}
             src={'https://cdn.discord.study/images/Homepage_section1.png'} alt={'Discord Study how to use gif'}
             loading={"lazy"}
        />
      </div>
    </div>
  </>
}

function TrustedBy() {
  return <>
    <div className={styles.trustedBy_section}>
      <div className={styles.trustedBy_container}>
        <h1 className={styles.trustedBy_heading}>Trusted by 5,100+ study servers</h1>
        <div className={styles.trustedBy_servers}>
          {Servers_list.map((server, index) => (
            <div className={styles.server} key={server.title + index}>
              <img src={server.img.src} alt={server.img.alt}/>
              <p>{server.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className={styles.counters}>
      {Counters_list.map((counter, index) => (
        <div key={counter.name + index}>
          <h1 className={styles.number_counter}>{counter.number}{counter.last_char}</h1>
          <h1  className={styles.name_counter}>{counter.name}</h1>
        </div>
      ))}
    </div>
  </>
}

function JoinTheRevolution() {
  return <div className={styles.joinTheRevolutionToday_section}>
    <h1>Join the revolution today!</h1>
    <h2>Create a Discord co-working environment for your classmates or coworkers!</h2>
    <a className={styles.inviteTheBot_button}>Invite the bot</a>
  </div>
}

export default function HomepageBottomContent() {
  return <>
    <HowToUse/>
    <TrustedBy/>
    <JoinTheRevolution/>
  </>
}
