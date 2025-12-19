/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module 'bootstrap' {
  export class Modal {
    constructor(element: Element, options?: any);
    static getInstance(element: Element): Modal | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }
  
  export class Tooltip {
    constructor(element: Element, options?: any);
    static getInstance(element: Element): Tooltip | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }

  export class Dropdown {
    constructor(element: Element, options?: any);
    static getInstance(element: Element): Dropdown | null;
    show(): void;
    hide(): void;
    toggle(): void;
    dispose(): void;
  }
}