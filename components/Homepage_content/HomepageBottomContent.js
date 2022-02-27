import {useRef} from "react";
import {useOnScreen} from "@/hooks/useOnScreen";

import styles from "@/components/Homepage_content/Homepage.module.scss";
import {Counters_list, Servers_list} from "constants/Homepage";
import AnimatedNumberCounter from "@/components/AnimatedNumberCounter";

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

function StudyLionCommunities() {
  const ref = useRef();
  const onScreen = useOnScreen(ref, "-50px");

  return <>
    <div className={styles.communities_section}>
      <div className={styles.communities_container}>
        <h1 className={styles.communities_heading}>Trusted by 5,100+ study servers</h1>
        <div className={styles.communities_servers}>
          {Servers_list.map((server, index) => (
            <div className={styles.server} key={server.name + index}>
              <img src={server.img.src} alt={server.img.alt} loading={"lazy"}/>
              <p>{server.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className={styles.counters}>
      {Counters_list.map((counter, index) => (
        <div key={counter.name + index}>
          <h1 ref={ref} className={styles.number_counter}>
            {onScreen ?
              <>
                <AnimatedNumberCounter number={`${counter.number}`} duration={1}/>
                {counter.last_char}
              </>
              : null }
          </h1>
          <h1 className={styles.name_counter}>{counter.name}</h1>
        </div>
      ))}
    </div>
  </>
}

function Participation() {
  return <div className={styles.participation_section}>
    <h1>Join the revolution today!</h1>
    <h2>Create a Discord co-working environment for your classmates or coworkers!</h2>
    <a className={styles.inviteTheBot_button}>Invite the bot</a>
  </div>
}

export default function HomepageBottomContent() {
  return <>
    <HowToUse/>
    <StudyLionCommunities/>
    <Participation/>
  </>
}
