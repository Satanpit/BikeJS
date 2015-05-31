interface Document {
    /**
     * Register custom element
     */
    registerElement(name: string, prototype?: Object): HTMLElement;
    currentScript: HTMLScriptElement;
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
        notify(changes?: Object): any;
        performChange(name, callback?: Function, scope?: any): any;
    }
}

interface Object {
    observe(beingObserved: Object, callback: Function, type: Array) : any;

    getNotifier(beingObserved: any): NotifierNotify

    deliverChangeRecords(callback: Function): void

    unobserve(observer: Object, callback?: Function): void

    setPrototypeOf(object: Object, prototype: Object): void
}

interface Array {
    observe(beingObserved: any, callback: (update: any, changes?: any) => any) : void;

    getNotifier(beingObserved: any): NotifierNotify

    deliverChangeRecords(callback: Function): void

    unobserve(observer: Function, callback?: Function): void
}