/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="@types/node" />

declare module 'next/link' {
  import { ReactElement, ComponentProps } from 'react';
  export interface LinkProps extends Omit<ComponentProps<'a'>, 'href'> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    children?: React.ReactNode;
  }
  export default function Link(props: LinkProps): ReactElement;
}

/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="@types/node" />

declare module 'next/link' {
  import { ReactElement, ComponentProps } from 'react';
  export interface LinkProps extends Omit<ComponentProps<'a'>, 'href'> {
    href: string;
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
    children?: React.ReactNode;
  }
  export default function Link(props: LinkProps): ReactElement;
}

declare global {
  namespace React {
    interface FC<P = {}> {
      (props: P): ReactNode | Promise<ReactNode>;
      displayName?: string;
    }
    interface FunctionComponent<P = {}> extends FC<P> {}
  }
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.HTMLAttributes<HTMLDivElement>;
      nav: React.HTMLAttributes<HTMLElement>;
      ul: React.HTMLAttributes<HTMLUListElement>;
      li: React.HTMLAttributes<HTMLLIElement>;
      h1: React.HTMLAttributes<HTMLHeadingElement>;
      h2: React.HTMLAttributes<HTMLHeadingElement>;
      h3: React.HTMLAttributes<HTMLHeadingElement>;
      h4: React.HTMLAttributes<HTMLHeadingElement>;
      p: React.HTMLAttributes<HTMLParagraphElement>;
      span: React.HTMLAttributes<HTMLSpanElement>;
      main: React.HTMLAttributes<HTMLElement>;
      form: React.HTMLAttributes<HTMLFormElement>;
      input: React.HTMLAttributes<HTMLInputElement>;
      textarea: React.HTMLAttributes<HTMLTextAreaElement>;
      button: React.HTMLAttributes<HTMLButtonElement>;
      label: React.HTMLAttributes<HTMLLabelElement>;
      pre: React.HTMLAttributes<HTMLPreElement>;
      a: React.HTMLAttributes<HTMLAnchorElement>;
      img: React.HTMLAttributes<HTMLImageElement>;
      select: React.HTMLAttributes<HTMLSelectElement>;
      option: React.HTMLAttributes<HTMLOptionElement>;
      header: React.HTMLAttributes<HTMLElement>;
      footer: React.HTMLAttributes<HTMLElement>;
      section: React.HTMLAttributes<HTMLElement>;
      article: React.HTMLAttributes<HTMLElement>;
      aside: React.HTMLAttributes<HTMLElement>;
      [elemName: string]: any;
    }
  }
}
