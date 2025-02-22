/// <reference types="react" />
/// <reference types="react-dom" />
/// <reference types="next" />
/// <reference types="@types/node" />

import { FC, ReactNode } from 'react';

declare global {
  namespace React {
    export { FC, ReactNode };
  }
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
