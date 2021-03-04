# @danielgindi/dom-utils

A collection of dom utilities. So you can work natively with the dom without dom frameworks.

All functions have appropriate JSDocs.  

* `lib/Css.js`: A set of css helpers
  * `getCssProps(el: Element, props: string[]): Object<string, string>`
  * `setCssProps(el: ElementCSSInlineStyle, props: Object<string, string>)`
  * `getElementWidth(el: Element, paddings: boolean = false, borders: boolean = false, margins: boolean = false): number`
  * `getElementHeight(el: Element, paddings: boolean = false, borders: boolean = false, margins: boolean = false): number`
  * `getPseudoElementWidth(el: Element, pseudo: string, paddings: boolean = false, borders: boolean = false, margins: boolean = false): number`
  * `getPseudoElementHeight(el: Element, pseudo: string, paddings: boolean = false, borders: boolean = false, margins: boolean = false): number`
  * `setElementWidth(el: Element, value: number, paddings: boolean = false, borders: boolean = false, margins: boolean = false)`
  * `setElementHeight(el: Element, value: number, paddings: boolean = false, borders: boolean = false, margins: boolean = false)`
  * `getElementOffset(el: Element): {top: number, left: number}`
  * `anchoredPosition(el: Element, xSpec: 'left'|'center'|'right'|'start'|'end'|string|number, ySpec: 'top'|'center'|'bottom'|string|number, size: {width: number: height: number}, rtl?: boolean): {left: number, top: number, right: number, bottom: number, xSpec: string|number, ySpec: string|number}`

* `lib/Dom.js`: A set of dom helpers
  * `createElement(tag: tag, attrs: Object<string, string>, children: Node|Node[]): Element`
  * `setElementAttrs(el: Element, attrs: Object<string, string>)`
  * `closestUntil(el: Element, selector: string, until?: Node): Node|null`
  * `prev(el: Element, selector: string): Element|null`
  * `next(el: Element, selector: string): Element|null`

* `lib/DomCompat.js`: A set of compatibility functions, for several functions which are not available on all browsers
  * `getRootNode(el: Node): Node|null`
  * `closest(el: Element, selector: string):Node|null`
  * `remove(el: Element)`
  * `before(before: ChildNode, ...nodes: (Node|string)[])`
  * `after(after: ChildNode, ...nodes: (Node|string)[])`
  * `prepend(parent: ParentNode, ...nodes: (Node|string)[])`
  * `append(parent: ParentNode, ...nodes: (Node|string)[])`
  * `scopedSelector(el: Element, selector: Element): Element|null`
  * `scopedSelectorAll(el: Element, selector: Element): NodeListOf<Element>`
  * `toggleClass(el: Element, className: string, toggle?: boolean): boolean`

* `lib/DomEventsSink.js`: A class for registering/unregistering event listeners
  * `add(el: EventTarget, eventName: string, handler: EventListenerOrEventListenerObject, optionsOrCapture?: boolean|AddEventListenerOptions): DomEventsSink`  
    event names support namespacing, where `'event.namespace'`.
  * `remove(el?: EventTarget, eventName?: string, handler?: EventListenerOrEventListenerObject, optionsOrCapture?: boolean|AddEventListenerOptions): DomEventsSink`  
    specify any argument as a filter for what to remove. specify '.namespace' event name in order to remove everything for a specific namespace.

* `Touches.js`: Touch helpers
  * `bindTouchTap(el: Element, options: { distance: number = 9, handler: function(event: TouchEvent) }): { unbind: Function }`  
    This little function will manage touch events to detect a single tap.

* `ScrollHelper.js`: scroll helpers
  * You can use `getScrollLeft`/`setScrollLeft` to normalize the behavior of `scrollLeft` across the quirks of different browsers.
  * You can use `getScrollHorz`/`setScrollHorz` to record and restore `scrollLeft` positions on RTL elements, or to switch between ltr/rtl modes without loosing scroll position.
  * `calculateScrollLeftForValue(el: Element, left: number, rtl?: boolean|undefined): number`  
    Calculates a native `scrollLeft` value for the specific element in the current browser.  
    The input value is a standard `scrollLeft` value (taken with `getScrollLeft`).  
    You will use this function instead of `setScrollLeft` if you want to animate to this value, or other kinds of manipulation.
    `rtl` is optional, you can pass it if you already have the 'direction' of the element and want to avoid that extra calculation.
  * `getScrollLeft(el: Element, rtl?: boolean|undefined): number`  
    Fetches the `scrollLeft` value from an element, and normalizes across the different scroll methods to a unified method.  
    You can later use `setScrollLeft` to set a value back to the element.  
    `rtl` is optional, you can pass it if you already have the 'direction' of the element and want to avoid that extra calculation.
  * `setScrollLeft(el: Element, value: number, rtl?: boolean|undefined)`  
    Sets the `scrollLeft` on an element.  
    `rtl` is optional, you can pass it if you already have the 'direction' of the element and want to avoid that extra calculation.  
    This function uses `calculateScrollLeftForValue(...)` to calculate the native `scrollLeft`.
  * `calculateScrollHorzForValue(el: Element, left: number, rtl?: boolean|undefined): number`  
    Calculates a native `scrollLeft` value for an element, from an rtl-aware `scrollLeft` (i.e from `getScrollHorz()`).
    You will use this function instead of `setScrollHorz` if you want to animate to this value, or other kinds of manipulation.
    `rtl` is optional, you can pass it if you already have the 'direction' of the element and want to avoid that extra calculation.
  * `getScrollHorz(el: Element, rtl?: boolean|undefined): number`  
    Gets an rtl-aware `scrollLeft` value from an element. The value will behave like a standard `scrollLeft`,
    except that for an rtl element it will have an rtl meaning, instead of being some crazy number.  
    `rtl` is optional, you can pass it if you already have the 'direction' of the element and want to avoid that extra calculation.
  * `setScrollHorz(el: Element, value: number, rtl?: boolean|undefined)`  
    Sets the `scrollLeft` on an element, with an rtl-aware value.  
    `rtl` is optional, you can pass it if you already have the 'direction' of the element and want to avoid that extra calculation.  
    This function uses `calculateScrollHorzForValue(...)` to calculate the native `scrollLeft`.

---

## Me
* Hi! I am Daniel Cohen Gindi. Or in short- Daniel.
* danielgindi@gmail.com is my email address.
* That's all you need to know.

## Help

If you want to help, you could:
* Test the code under different conditions and browsers
* Create demos/docs pages
* [![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=45T5QNATLCPS2)

## License

All the code here is under MIT license. Which means you could do virtually anything with the code.
I will appreciate it very much if you keep an attribution where appropriate.

    The MIT License (MIT)
    
    Copyright (c) 2013 Daniel Cohen Gindi (danielgindi@gmail.com)
    
    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:
    
    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.
    
    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE.
