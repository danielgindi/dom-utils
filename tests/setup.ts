import { JSDOM } from 'jsdom';

export const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    pretendToBeVisual: true,
});

Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    Node: dom.window.Node,
    Element: dom.window.Element,
    HTMLElement: dom.window.HTMLElement,
    getComputedStyle: dom.window.getComputedStyle.bind(dom.window),
});

export function resetDom(): void {
    document.body.replaceChildren();
}

export function dispatchTouch(
    element: Element,
    name: string,
    identifier: number,
    pageX: number,
    pageY: number,
): void {
    const event = new dom.window.Event(name, { bubbles: true });
    Object.defineProperty(event, 'changedTouches', {
        value: [{ identifier, pageX, pageY }],
    });
    element.dispatchEvent(event);
}
