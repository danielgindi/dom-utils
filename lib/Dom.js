import { setCssProps } from './Css.js';

/**
 * @param {string} tag
 * @param {Object<string, string>} [attrs]
 * @param {Node|Node[]} [children]
 * @returns {Element}
 */
const createElement = function (tag, attrs, children) {
    let el = document.createElement(tag);

    if (attrs && typeof attrs === 'object')
        setElementAttrs(el, attrs);

    if (children) {
        if (children instanceof Node) {
            el.appendChild(children);
        }
        else if (Array.isArray(children)) {
            for (let child of children)
                el.appendChild(child);
        }
    }

    return el;
};

/**
 * @param {Element} el
 * @param {Object<string, string>} attrs
 */
const setElementAttrs = function (el, attrs) {
    for (let [key, value] of Object.entries(attrs)) {
        if (value === null || value === undefined)
            continue;

        if (key === 'innerHTML')
            el.innerHTML = String(value);
        else if (key === 'css' && 'style' in el)
            setCssProps(el, value);
        else if (key === 'readOnly' || key === 'tabIndex' || key === 'textContent')
            el[key] = value;
        else el.setAttribute(key, String(value));
    }
};

/**
 * @param {Element} el
 * @param {string} selector
 * @param {Node} [until]
 * @returns {Node|null}
 */
const closestUntil = function (el, selector, until) {
    if ('closest' in el && !until)
        return el.closest(selector);

    const matches = Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    do {
        if (matches.call(el, selector))
            return el;

        if (until && el === until)
            return null;

        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);

    return null;
};

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {Element|null}
 */
const prev = function (el, selector) {
    if (!el) return null;

    const matches = Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    do {
        if (matches.call(el, selector))
            return el;

        el = el.previousElementSibling || el.previousSibling;
    } while (el !== null && el.nodeType === 1);

    return null;
};

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {null|Element}
 */
const next = function (el, selector) {
    if (!el) return null;

    const matches = Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    do {
        if (matches.call(el, selector))
            return el;

        el = el.nextElementSibling || el.nextSibling;
    } while (el !== null && el.nodeType === 1);

    return null;
};

const unwrapChildren = function (el) {
    let parent = el.parentNode;
    while (el.firstChild)
        parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
};

export {
    createElement,
    setElementAttrs,
    closestUntil,
    prev,
    next,
    unwrapChildren,
};
