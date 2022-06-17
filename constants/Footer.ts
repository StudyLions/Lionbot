import { NavigationPaths } from "./types";

export const MenuItems = [
  {
    title: "Source Code",
    link: {
      href: "https://github.com/StudyLions/StudyLion/",
      target: "_blank",
    },
  },
  {
    title: "Tutorials",
    link: {
      href: "https://izabellakis.notion.site/StudyLion-Bot-Tutorials-f493268fcd12436c9674afef2e151707",
      target: "_blank",
    },
  },
  {
    title: "Anki Addon",
    link: {
      href: "/coming-soon",
      target: "",
    },
  },
  {
    title: "Invite the bot",
    link: {
      href: "https://discordapp.com/api/oauth2/authorize?client_id=889078613817831495&permissions=8&scope=bot",
      target: "_blank",
    },
  },
  {
    title: "Support Us!",
    link: {
      href: NavigationPaths.donate,
      target: "",
    },
  },
];

export const LegalItems = [
  {
    title: "Contact",
    link: {
      href: "https://bot.studylions.com/privacy-policy/",
      target: "_blank",
    },
  },
  {
    title: "Privacy Policy",
    link: {
      href: NavigationPaths.privacyPolicy,
      target: "",
    },
  },
  {
    title: "Terms and Conditions",
    link: {
      href: NavigationPaths.termsAndConditions,
      target: "",
    },
  },
  {
    title: "Refund Policy",
    link: {
      href: NavigationPaths.termsAndConditions,
      target: "",
    },
  },
  {
    title: "Discord Server",
    link: {
      href: "https://discord.com/invite/studylions",
      target: "_blank",
    },
  },
];
