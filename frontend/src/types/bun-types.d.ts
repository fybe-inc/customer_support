/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="@types/node" />

declare module 'react' {
  export type FC<P = {}> = FunctionComponent<P>;
  
  export type ReactNode = string | number | boolean | null | undefined | ReactElement | ReactPortal | Iterable<ReactNode>;
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P & { children?: ReactNode };
    key: Key | null;
  }

  export interface ReactPortal {
    children: ReactNode;
    containerInfo: any;
    implementation: any;
    key: Key | null;
  }

  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement | null;
    displayName?: string;
  }
  
  export type Key = string | number;
  export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null);
  
  export interface HTMLAttributes<T> {
    className?: string;
    onClick?: (event: MouseEvent<T>) => void;
    onChange?: (event: ChangeEvent<T>) => void;
    onSubmit?: (event: FormEvent<T>) => void;
    value?: string;
    type?: string;
    required?: boolean;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    [key: string]: any;
  }

  export type FormEvent<T = Element> = React.FormEvent<T>;
  export type FormEventHandler<T = Element> = React.FormEventHandler<T>;
  
  export interface HTMLFormElement extends HTMLElement {
    acceptCharset: string;
    action: string;
    autocomplete: string;
    elements: HTMLFormControlsCollection;
    encoding: string;
    enctype: string;
    length: number;
    method: string;
    name: string;
    noValidate: boolean;
    target: string;
    submit(): void;
    reset(): void;
    checkValidity(): boolean;
    reportValidity(): boolean;
    requestSubmit(submitter?: HTMLElement): void;
  }
  
  export interface HTMLFormControlsCollection {
    [index: number]: Element;
    length: number;
    namedItem(name: string): Element | null;
  }

  export interface ChangeEvent<T = Element> {
    target: EventTarget & T;
  }

  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }

  // React Hooks
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
      [elemName: string]: any;
    }
  }
}
