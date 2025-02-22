/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="@types/node" />

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "react" {
  import * as React from "react";
  export = React;
}

declare module "next/link" {
  import { LinkProps } from "next/dist/client/link";
  const Link: React.FC<LinkProps>;
  export default Link;
}
