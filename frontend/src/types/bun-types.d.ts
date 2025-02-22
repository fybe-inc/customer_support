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
  export type FormEvent<T = Element> = React.SyntheticEvent<T>;
  export type FormEventHandler<T = Element> = (event: FormEvent<T>) => void;
  export type ChangeEvent<T = Element> = React.SyntheticEvent<T>;
  export type ChangeEventHandler<T = Element> = (event: ChangeEvent<T>) => void;
  export type MouseEvent<T = Element> = React.SyntheticEvent<T>;
  export type MouseEventHandler<T = Element> = (event: MouseEvent<T>) => void;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  export function useCallback<T extends (...args: any[]) => any>(callback: T, deps: readonly any[]): T;
}
