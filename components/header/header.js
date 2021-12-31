import {signIn, signOut, useSession} from "next-auth/react"
import React, {useState} from 'react';
import Image from "next/image";

import {default as popup_links} from './popup_links.json'
import styles from "./header.module.scss"

export default function Header() {
  const {data: session, status} = useSession()
  const loading = status === "loading"

  const [expanded, setExpanded] = useState(false);

  function togglExpand() {
    setExpanded(!expanded);
  }

  function close() {
    setExpanded(false);
  }


  return (
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>

      <nav className={`navbar navbar-expand-lg ${styles.navbar}`}>
        <Image className="navbar-brand"
               src={require('public/images/StudyLion_1.png')}
               alt="Study bot lion discord logo"
               height="50px"
               width="200px"
               objectFit={'contain'}
        />
        <ul className={`navbar-nav mr-auto mt-2 mt-lg-0 ${styles.navbar_nav}`}>
          <li className="nav-item">
            <a className={`text-decoration-none nav-link ${styles.nav_link}`}
               href={'https://discord.studylions.com/invite'}
               target={'_blank'}>
              Invite Bot
            </a>
          </li>

          <li className="nav-item">
            <a className={`text-decoration-none nav-link ${styles.nav_link}`}
               href={'https://www.notion.so/izabellakis/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707'}
               target={'_blank'}>
              Tutorials
            </a>
          </li>

          <li className="nav-item">
            <a className={`nav-link ${styles.nav_link}`} href="#">Anki Addon</a>
          </li>

          <li className="nav-item">
            <a className={`nav-link ${styles.nav_link}`} href="#">Premium</a>
          </li>
        </ul>
        <div className={styles.content_right}>
          <div className={styles.signedInStatus}>
            <div
              className={`nojs-show ${
                !session && loading ? styles.loading : styles.loaded
              }`}
            >
              {!session && (
                <>
                  <a className={`${styles.button_login_discord}`}
                     onClick={(e) => {
                       e.preventDefault()
                       signIn("discord")
                     }}
                  >
                    <Image
                      src={require('public/icons/discord.svg')}
                      alt="Discord icon"
                      width={25}
                      height={25}
                    />
                    <span className={`${styles.text_discord}`}>
                      Log in with Discord
                     </span>
                  </a>
                </>
              )}
              {session && (
                <>
                  <div className="row">
                    <div className={`col-6 ${styles.study_button}`}>
                      Study
                    </div>

                    <div className={`col-6 ${styles.options_menu}`}>
                      {session.user.image && (
                        <>
                          <span
                            style={{backgroundImage: `url('${session.user.image}')`}}
                            className={styles.avatar}
                            onClick={(e) => {
                              togglExpand();
                            }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
        {session && expanded && (
          <>
            <div className={`${styles.popup}`} onMouseLeave={close}>
              {popup_links.map((link, i) =>(
                <a
                  key={link.title + i}
                  href={link.href}
                  className={`${styles.button_link}`}
                  onClick={(e) => {
                    if(link.title === 'Logout'){
                      e.preventDefault();
                      signOut();
                    }
                  }}
                >
                  {link.title}
                </a>
              ))}
            </div>
          </>
        )}
      </nav>
    </header>
  )
}
