// ============================================================
// AI-GENERATED FILE
// Created: 2026-03-24
// Purpose: Fix react-i18next v14 TypeScript augmentation that causes
//          "children prop expects a single child" errors on HTML elements
//          when using TypeScript 4.9. This overrides the children type
//          on HTML/SVG elements to accept any valid children pattern.
// ============================================================
import "react-i18next"

declare module "react-i18next" {
  interface CustomTypeOptions {
    allowObjectInHTMLChildren: true
  }
}

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    children?: any;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface SVGAttributes<T> {
    children?: any;
  }
}
