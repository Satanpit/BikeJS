interface Document {
    /**
     * Register custom element
     */
    registerElement(name: string, prototype?: Object): HTMLElement;
}

interface HTMLElement {
    /**
     * Set shadow DOM in this element
     */
    createShadowRoot(): DocumentFragment
}

interface NotifierNotify {
    new(): Object;
    (): any;

    prototype: {
        notify(): any;
        performChange(): any;
    }
}

interface Object {
    observe(beingObserved: any, callback: (update: any, changes?: any) => any) : void;

    getNotifier(beingObserved: any): NotifierNotify

    deliverChangeRecords(callback: Function): void

    unobserve(observer: Function, callback?: Function): void

    setPrototypeOf(object: Object, prototype: Object): void
}

interface Array {
    observe(beingObserved: any, callback: (update: any, changes?: any) => any) : void;

    getNotifier(beingObserved: any): NotifierNotify

    deliverChangeRecords(callback: Function): void

    unobserve(observer: Function, callback?: Function): void
}