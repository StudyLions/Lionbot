import { useRef } from "react";
import { useOnScreen } from "@/hooks/useOnScreen";

import styles from "@/components/Homepage_content/Homepage.module.scss";
import { Counters_list, Servers_list } from "constants/Homepage";
import UseAnimatedNumberCounter from "../../hooks/useAnimatedNumberCounter";
import Image from "next/image";
import hand_click_svg from "@/public/icons/hand_click.svg";
import Button from "@/components/Button";
import useWindowSize from "@/hooks/useWindowSize";

function HowToUse() {
  return (
    <div className={"flex flex-col items-center py-[5%] lg:px-[30px] justify-center max-w-[1280px] mx-auto"}>
      <h3 className={"text-[#EEC73C] text-[58px] md:text-[35px] uppercase font-bold"}>How to use</h3>
      <div className={"relative w-full h-[330px] my-[50px] md:h-[230px]"}>
        <Image
          src={"https://cdn.discord.study/images/how_to_use.png"}
          alt="How to use discord bot."
          layout={"fill"}
          objectFit={"contain"}
        />
      </div>
      <p className={"text-[20px] max-w-[600px] text-center"}>
        Learn how to use and configure StudyLion on your server! Tutorials are availabe for admins, moderators and
        users.
      </p>
      <div className={"mt-[30px] mb-[100px]"}>
        <Button
          image={hand_click_svg}
          label={"Tutorials"}
          href={"https://izabellakis.notion.site/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707"}
          target={"_blank"}
        />
      </div>
    </div>
  );
}

function StudyLionCommunities() {
  const ref = useRef();
  const { width } = useWindowSize();
  const onScreen = useOnScreen(ref, width > 1024 ? "-50px" : "1024px");

  return (
    <>
      <div className={"bg-[#34267d] pt-[100px] pb-[80px]"}>
        <div className={`${styles.communities_container}`}>
          <h1 className={"text-[55px] md:text-[35px] md:px-[30px] font-bold uppercase text-center pb-[60px]"}>
            Trusted by 5,100+ study servers
          </h1>
          <div className={styles.communities_servers}>
            {Servers_list.map((server, index) => (
              <div className={styles.server} key={server.name + index}>
                <img src={server.img.src} alt={server.img.alt} loading={"lazy"} />
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
              {onScreen ? (
                <>
                  <UseAnimatedNumberCounter number={`${counter.number}`} duration={1} />
                  {counter.last_char}
                </>
              ) : null}
            </h1>
            <h1 className={styles.name_counter}>{counter.name}</h1>
          </div>
        ))}
      </div>
    </>
  );
}

function Participation() {
  return (
    <div className={styles.participation_section}>
      <h1>Join the revolution today!</h1>
      <h2>Create a Discord co-working environment for your classmates or coworkers!</h2>
      <a
        className={styles.inviteTheBot_button}
        href={"https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot"}
        target={"_blank"}
        rel="noreferrer"
      >
        Invite the bot
      </a>
    </div>
  );
}

export default function HomepageBottomContent() {
  return (
    <>
      <HowToUse />
      <StudyLionCommunities />
      <Participation />
    </>
  );
}
