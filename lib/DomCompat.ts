/**
 * @param {Node} el
 * @returns {Node|null}
 */
const getRootNode = function (el: Node): Node | null {
    if (!el) return null;
    if ('getRootNode' in el)
        return el.getRootNode();

    while (el.parentNode)
        el = el.parentNode;

    return el;
};

/**
 * @param {Node} el
 * @param {string} selector
 * @returns {Node|null}
 */
const closest = function (el: Element, selector: string): Element | null {
    if ('closest' in el)
        return el.closest(selector);

    const matches = Element.prototype.matches ||
        (Element.prototype as Element & { msMatchesSelector?: typeof Element.prototype.matches }).msMatchesSelector ||
        (Element.prototype as Element & { webkitMatchesSelector?: typeof Element.prototype.matches }).webkitMatchesSelector;

    do {
        if (matches.call(el, selector))
            return el;

        el = (el.parentElement || el.parentNode) as Element;
    } while (el !== null && el.nodeType === 1);

    return null;
};

/**
 * @param {Element} el
 */
const remove = function (el: Element): void {
    if (!el) return;

    if (typeof (el as { remove?: () => void }).remove === 'function')
        el.remove();
    else if (el.parentNode)
        el.parentNode.removeChild(el);
};

/**
 * @param {ChildNode} before
 * @param {(Node|string)[]} nodes
 */
const before = function (before: ChildNode, ...nodes: (Node | string)[]): void {
    if (nodes.length === 0) return;

    if (typeof (before as { before?: (...nodes: (Node | string)[]) => void }).before === 'function') {
        before.before(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = (isNode ? node : document.createTextNode(String(node))) as Node;
            before.parentNode.insertBefore(node, before);
        } else {
            let docFrag = document.createDocumentFragment();

            for (const node of nodes) {
                const isNode = node instanceof Node;
                docFrag.appendChild(isNode ? node : document.createTextNode(String(node)));
            }

            before.parentNode.insertBefore(docFrag, before);
        }
    }
};

/**
 * @param {ChildNode} after
 * @param {(Node|string)[]} nodes
 */
const after = function (after: ChildNode, ...nodes: (Node | string)[]): void {
    if (nodes.length === 0) return;

    if (typeof (after as { after?: (...nodes: (Node | string)[]) => void }).after === 'function') {
        after.after(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = (isNode ? node : document.createTextNode(String(node))) as Node;

            if (after.nextSibling)
                after.parentNode.insertBefore(node, after.nextSibling);
            else after.parentNode.appendChild(node);
        } else {
            let docFrag = document.createDocumentFragment();

            for (const node of nodes) {
                const isNode = node instanceof Node;
                docFrag.appendChild(isNode ? node : document.createTextNode(String(node)));
            }

            if (after.nextSibling)
                after.parentNode.insertBefore(docFrag, after.nextSibling);
            else after.parentNode.appendChild(docFrag);
        }
    }
};

/**
 * @param {ParentNode|Element} parent
 * @param {(Node|string)[]} nodes
 */
const prepend = function (parent: ParentNode, ...nodes: (Node | string)[]): void {
    if (nodes.length === 0) return;

    if (typeof (parent as { prepend?: (...nodes: (Node | string)[]) => void }).prepend === 'function') {
        parent.prepend(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = (isNode ? node : document.createTextNode(String(node))) as Node;

            if (parent.firstChild)
                parent.insertBefore(node, parent.firstChild);
            else parent.appendChild(node);
        } else {
            let docFrag = document.createDocumentFragment();

            for (const node of nodes) {
                const isNode = node instanceof Node;
                docFrag.appendChild(isNode ? node : document.createTextNode(String(node)));
            }

            if (parent.firstChild)
                parent.insertBefore(docFrag, parent.firstChild);
            else parent.appendChild(docFrag);
        }
    }
};

/**
 * @param {ParentNode|Element} parent
 * @param {(Node|string)[]} nodes
 */
const append = function (parent: ParentNode, ...nodes: (Node | string)[]): void {
    if (nodes.length === 0) return;

    if (typeof (parent as { append?: (...nodes: (Node | string)[]) => void }).append === 'function') {
        parent.append(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = (isNode ? node : document.createTextNode(String(node))) as Node;

            parent.appendChild(node);
        } else {
            let docFrag = document.createDocumentFragment();

            for (const child of nodes) {
                const isNode = child instanceof Node;
                docFrag.appendChild(isNode ? child : document.createTextNode(String(child)));
            }

            parent.appendChild(docFrag);
        }
    }
};

let hasScopedQuerySelector: boolean | null = null;

const detectScopedSelectorFeature = () => {
    try {
        document.createElement('div').querySelector(':scope > div');
        hasScopedQuerySelector = true;
    } catch (ignored) {
        hasScopedQuerySelector = false;
    }
};

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {Element|null}
 */
const scopedSelector = function (el: Element, selector: string): Element | null {
    if (hasScopedQuerySelector === null) {
        detectScopedSelectorFeature();
    }

    if (hasScopedQuerySelector === true) {
        return el.querySelector(selector.replace(/((?:^|,)\s*)/g, '$1:scope '));
    } else {
        let id = el.id;
        const uniqueId = 'ID_' + Date.now();
        el.id = uniqueId;
        selector = selector.replace(/((?:^|,)\s*)/g, '$1#' + uniqueId);
        try {
            return el.querySelector(selector);
        } finally {
            this.id = id;
        }
    }
};

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {NodeListOf<Element>}
 */
const scopedSelectorAll = function (el: Element, selector: string): NodeListOf<Element> {
    if (hasScopedQuerySelector === null) {
        detectScopedSelectorFeature();
    }

    if (hasScopedQuerySelector === true) {
        return el.querySelectorAll(selector.replace(/((?:^|,)\s*)/g, '$1:scope '));
    } else {
        let id = el.id;
        const uniqueId = 'ID_' + Date.now();
        el.id = uniqueId;
        selector = selector.replace(/((?:^|,)\s*)/g, '$1#' + uniqueId);
        try {
            return el.querySelectorAll(selector);
        } finally {
            this.id = id;
        }
    }
};

/**
 * @param {Element} el
 * @param {string} className
 * @param {boolean?} [toggle]
 * @returns {boolean} `true` if the class name is now present
 */
const toggleClass = function (el: Element, className: string, toggle?: boolean): boolean {
    let classes = el.classList;

    if (toggle === undefined) {
        if (classes.contains(className)) {
            classes.remove(className);
            return false;
        }
        else {
            classes.add(className);
            return true;
        }
    } else {
        if (toggle) {
            classes.add(className);
            return true;
        }
        else {
            classes.remove(className);
            return false;
        }
    }
};

export {
    getRootNode,
    closest,
    remove,
    before,
    after,
    prepend,
    append,
    scopedSelector,
    scopedSelectorAll,
    toggleClass,
};
