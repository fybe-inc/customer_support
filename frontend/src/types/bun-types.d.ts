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

declare module 'react' {
  export * from '@types/react';
  export interface FC<P = {}> {
    (props: P): ReactElement<any, any> | null;
    displayName?: string;
  }
  export interface FunctionComponent<P = {}> extends FC<P> {}
  export type ReactNode = ReactElement | string | number | Iterable<ReactNode> | ReactPortal | boolean | null | undefined;

  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;

  export interface FormEvent<T = Element> extends React.SyntheticEvent<T> {
    target: EventTarget & T;
  }
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
      nav: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      ul: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
      li: React.DetailedHTMLProps<React.HTMLAttributes<HTMLLIElement>, HTMLLIElement>;
      h1: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h2: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h3: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      h4: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
      p: React.DetailedHTMLProps<React.HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
      span: React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
      main: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      form: React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
      input: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
      textarea: React.DetailedHTMLProps<React.TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
      button: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
      label: React.DetailedHTMLProps<React.LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
      pre: React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
      a: React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
      img: React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
      select: React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
      option: React.DetailedHTMLProps<React.OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
      header: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      footer: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      section: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      article: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
      aside: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
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
