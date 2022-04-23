import React, { useState } from "react";
import Image from "next/image";

import styles from "@/components/Layout/Header/Header.module.scss";

const supportLinks = [
  {
    title: "Perks",
    href: "",
  },
  {
    title: "Premium Plans",
    href: "",
  },
  {
    title: "Shop",
    href: "",
  },
  {
    title: "FAQ",
    href: "",
  },
];

export function PremiumDropdown() {
  const [expanded, setExpanded] = useState(false);

  const ButtonDropDown = () => (
    <div className={`alignCenter ${styles.navbar_item}`} style={{ gap: "0 5px" }}>
      <Image
        src={require("@/public/icons/star.svg")}
        priority
        alt="Star icon"
        layout="fixed"
        height={30}
        width={25}
        objectFit="contain"
      />
      <p
        className={"text-[18px] text-[#FFB636] font-semibold leading-[25px] tracking-[0.2em] uppercase cursor-pointer"}
      >
        Premium
      </p>
      <Image
        src={require("@/public/icons/arrow.svg")}
        className={`${expanded ? styles.toggle_down : styles.toggle_up}`}
        priority
        alt="Arrow right icon"
        layout="fixed"
        height={12}
        width={15}
        objectFit="contain"
      />
    </div>
  );

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={styles.supportUSButton}
    >
      <ButtonDropDown />
      {expanded && (
        <div className={styles.dropdown}>
          {supportLinks.map((link, key) => (
            <a className={styles.dropdown_link} key={link.title + key}>
              {link.title}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
