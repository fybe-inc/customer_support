/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R> {
    toBeInTheDocument(): R;
    toHaveTextContent(text: string): R;
  }
}
