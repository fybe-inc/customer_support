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
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement | null;
    displayName?: string;
  }
  export interface FC<P = {}> extends FunctionComponent<P> {}
  export type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactPortal | Iterable<ReactNode>;
  
  export interface FormEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
  
  export interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
    target: EventTarget & T;
  }
  export type ChangeEventHandler<T = Element> = (event: ChangeEvent<T>) => void;
  
  export interface SyntheticEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
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
