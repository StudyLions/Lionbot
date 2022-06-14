module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        transparentBlack20: "#000000c9",
        black40: "#423C3C",
        black50: "#4D483C",
        red04: "#B03C3C",
        red05: "#9B2E2E",
        red19: "#BD4949",
        red20: "#E04C4C",
        red40: "#E66868",
        red50: "#E56868",
        cream40: "#C5C3BD",
        cream50: "#DBD4D4",
        cream60: "#e3cfb1",
        cream90: "#edeadf",
        gray15: "#4E4E4E",
        gray20: "#676767",
        orange0: "#E7A627",
        orange1: "#EFB052",
        orange3: "#d29a22",
        blue0: "#2E4C70",
        blue1: "#1B3859",
      },
    },
    screens: {
      xl: { max: "1279px" },
      // => @media (max-width: 1279px) { ... }

      lg: { max: "1023px" },
      // => @media (max-width: 1023px) { ... }

      mdlg: { max: "967px" },
      // => @media (max-width: 967px) { ... }

      md: { max: "767px" },
      // => @media (max-width: 767px) { ... }

      sm: { max: "639px" },
      // => @media (max-width: 639px) { ... }

      ex_sm: { max: "325px" },
      // => @media (max-width: 325px) { ... }
    },
    borderWidth: {
      DEFAULT: "0.5px",
      0: "0",
      2: "2px",
      3: "3px",
      4: "4px",
      6: "6px",
      8: "8px",
    },
  },
  variants: {},
  plugins: [],
};
