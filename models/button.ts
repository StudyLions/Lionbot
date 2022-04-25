export interface IButton {
  image?: {
    src?: string;
    height?: number;
    width?: number;
  };
  label: string;
  href?: string;
  target?: "_blank" | "_self";
  scrollingElement?: string;
}
