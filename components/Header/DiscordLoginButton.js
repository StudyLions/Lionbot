import styles from "@/components/Header/Header.module.scss";
import {signIn, signOut, useSession} from "next-auth/react";
import Image from "next/image";
import {default as popup_links} from "@/components/Header/popup_links.json";
import React, {useState} from "react";

export function DiscordLoginButton() {
  const {data: session, status} = useSession()
  const loading = status === "loading"
  const [expanded, setExpanded] = useState(false);

  return <>
    <div
      className={styles.content_right}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className={styles.signedInStatus}>
        <div
          className={`nojs-show ${
            !session && loading ? styles.loading : styles.loaded
          }`}
        >
          {!session ? (
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
                  layout="fixed"
                  height={30}
                  width={25}
                  objectFit="contain"
                />
                <span className={`${styles.text_discord}`}>
                  Log in with DISCORD
                </span>
              </a>
            </>
          ) : (
            <>
              {session.user.image && (
                <span
                  style={{backgroundImage: `url('${session.user.image}')`}}
                  className={styles.avatar}
                  onMouseEnter={(e) => setExpanded(!expanded)}
                />
              )}
            </>
          )}
        </div>

        {/* Dropdown menu */}
        {session && expanded && (
          <div className={`${styles.popup}`}>
            {popup_links.map((link, i) => (
              <a
                key={link.title + i}
                href={link.href}
                className={`${styles.button_link}`}
                onClick={(e) => {
                  if (link.title === 'Logout') {
                    e.preventDefault();
                    signOut();
                  }
                }}
              >
                {link.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  </>
}
