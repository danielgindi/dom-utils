export default class DomEventsSink {
    constructor() {
        /**
         * @type {{el: EventTarget, name: string, handler: EventListenerOrEventListenerObject, useCapture: boolean}[]}
         * @private
         */
        this._events = [];
    }

    /**
     * @param {EventTarget} el
     * @param {string} eventName
     * @param {EventListenerOrEventListenerObject} handler
     * @param {boolean|AddEventListenerOptions} [optionsOrCapture=undefined]
     * @returns {DomEventsSink}
     */
    add(el, eventName, handler, optionsOrCapture) {
        let parts = eventName.split('.');
        let name = parts[0];
        let namespace = parts[1];

        el.addEventListener(name, handler, optionsOrCapture ? optionsOrCapture : false);
        let useCapture = optionsOrCapture === true || typeof optionsOrCapture === 'object' && optionsOrCapture.capture === true;
        this._events.push({ el: el, name: name, namespace: namespace, handler: handler, useCapture: useCapture });
        return this;
    }

    /**
     * @param {EventTarget} [el=undefined]
     * @param {string} [eventName=undefined]
     * @param {EventListenerOrEventListenerObject} [handler=undefined]
     * @param {boolean|EventListenerOptions} [optionsOrCapture=undefined]
     * @returns {DomEventsSink}
     */
    remove(el, eventName, handler, optionsOrCapture) {
        let parts = eventName ? eventName.split('.') : '';
        let name = parts[0];
        let namespace = parts[1];

        let useCapture = optionsOrCapture === true || typeof optionsOrCapture === 'object' && optionsOrCapture.capture === true;

        let keep = [];
        let remove = [];

        if (el || name || namespace || handler || optionsOrCapture !== undefined) {
            for (let item of this._events) {
                if ((el && item.el !== el) ||
                    (name && item.name !== name) ||
                    (namespace && item.namespace !== namespace) ||
                    (handler && item.handler !== handler) ||
                    (optionsOrCapture !== undefined && item.useCapture !== useCapture)) {
                    keep.push(item);
                } else {
                    remove.push(item);
                }
            }
        } else {
            remove = this._events;
        }

        this._events = keep;

        for (let item of remove) {
            item.el.removeEventListener(item.name, item.handler, item.useCapture);
        }
        return this;
    }
}
