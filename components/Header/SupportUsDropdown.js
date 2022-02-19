import styles from "@/components/Header/Header.module.scss";
import Image from "next/image";
import React, {useState} from "react";

const supportLinks = [
  {
    title: 'LIONGEMS',
    href: ''
  },
  {
    title: 'SKINS',
    href: ''
  }
]

export function SupportUsDropdown() {
  const [expanded, setExpanded] = useState(false);

  const ButtonDropDown = () => (
    <div
      className={`alignCenter ${styles.navbar_item}`}
      style={{gap: '0 5px'}}
    >
      <Image
        src={require('public/icons/star.svg')}
        priority
        alt="Star icon"
        layout="fixed"
        height={30}
        width={25}
        objectFit="contain"
      />
      <p style={{color: '#FFB636'}}>Support us</p>
      <span className={`${expanded ? styles.toggle_down : styles.toggle_up}`}>
              <Image
                src={require('public/icons/arrow.svg')}
                priority
                alt="Arrow right icon"
                layout="fixed"
                height={12}
                width={15}
                objectFit="contain"
              />
      </span>

    </div>
  )

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={styles.supportUSButton}
    >
      <ButtonDropDown/>
      {expanded && (
        <div className={styles.dropdown}>
          {supportLinks.map((link, key) =>
            <a className={styles.dropdown_link} key={link.title + key}>
              {link.title}
            </a>
          )}
        </div>
      )}
    </div>
  )
}
