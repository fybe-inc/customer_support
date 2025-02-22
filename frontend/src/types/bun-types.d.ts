/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="@types/node" />

declare module 'react' {
  export type FC<P = {}> = FunctionComponent<P>;
  export type ReactNode = 
    | string
    | number
    | boolean
    | null
    | undefined
    | ReactElement
    | Array<ReactNode>
    | { [key: string]: any };
  
  export interface FunctionComponent<P = {}> {
    (props: P, context?: any): ReactElement<any, any> | null;
    displayName?: string;
  }
  
  export interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
    type: T;
    props: P;
    key: Key | null;
  }
  
  export type Key = string | number;
  export type JSXElementConstructor<P> = ((props: P) => ReactElement<any, any> | null);
  
  export interface HTMLAttributes<T> {
    className?: string;
    onClick?: (event: any) => void;
    onChange?: (event: any) => void;
    onSubmit?: (event: any) => void;
    value?: string;
    type?: string;
    required?: boolean;
    rows?: number;
    [key: string]: any;
  }

  export interface FormEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }

  export interface ChangeEvent<T = Element> {
    target: EventTarget & T;
  }

  export interface MouseEvent<T = Element> {
    preventDefault(): void;
    stopPropagation(): void;
    target: EventTarget & T;
  }
}

declare module 'next/link' {
  import { ReactElement } from 'react';
  export interface LinkProps {
    href: string;
    className?: string;
    children?: React.ReactNode;
    [key: string]: any;
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
