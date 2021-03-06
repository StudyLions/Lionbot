import React, { useState } from "react";
import Image from "next/image";

import styles from "@/components/Layout/Header/Header.module.scss";
import Link from "next/link";

const supportLinks = [
  {
    title: "Perks",
    href: "/coming-soon",
  },
  {
    title: "Premium Plans",
    href: "/coming-soon",
  },
  {
    title: "Shop",
    href: "/coming-soon",
  },
  {
    title: "FAQ",
    href: "/coming-soon",
  },
];

export function PremiumDropdown() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={styles.supportUSButton}
    >
      <div className={`alignCenter gap-[5px]`}>
        <Image
          src={require("@/public/icons/star.svg")}
          alt="Star icon"
          layout="fixed"
          height={30}
          width={25}
          objectFit="contain"
        />
        <p className={"text-[#FFB636] font-semibold leading-[25px] tracking-[0.2em] uppercase cursor-pointer"}>
          Premium
        </p>
        <Image
          src={require("@/public/icons/arrow.svg")}
          className={`${expanded ? styles.toggle_down : styles.toggle_up}`}
          alt="Arrow right icon"
          layout="fixed"
          height={12}
          width={15}
          objectFit="contain"
        />
      </div>
      {expanded && (
        <div className={styles.dropdown}>
          {supportLinks.map((link, key) => (
            <Link href={link.href} key={link.title + key}>
              <a className={styles.dropdown_link}>{link.title}</a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
