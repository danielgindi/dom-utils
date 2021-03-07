/**
 * @param {Node} el
 * @returns {Node|null}
 */
const getRootNode = function (el) {
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
const closest = function (el, selector) {
    if ('closest' in el)
        return el.closest(selector);

    const matches = Element.prototype.matches ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.webkitMatchesSelector;

    do {
        if (matches.call(el, selector))
            return el;

        el = el.parentElement || el.parentNode;
    } while (el !== null && el.nodeType === 1);

    return null;
};

/**
 * @param {Element} el
 */
const remove = function (el) {
    if (!el) return;

    if ('remove' in el)
        el.remove();

    if (el.parentNode)
        el.parentNode.removeChild(el);
};

/**
 * @param {ChildNode} before
 * @param {(Node|string)[]} nodes
 */
const before = function (before, ...nodes) {
    if (nodes.length === 0) return;

    if ('before' in before) {
        before.before(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = isNode ? node : document.createTextNode(String(node));
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
const after = function (after, ...nodes) {
    if (nodes.length === 0) return;

    if ('after' in after) {
        after.after(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = isNode ? node : document.createTextNode(String(node));

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
const prepend = function (parent, ...nodes) {
    if (nodes.length === 0) return;

    if ('prepend' in parent) {
        parent.prepend(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = isNode ? node : document.createTextNode(String(node));

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
const append = function (parent, ...nodes) {
    if (nodes.length === 0) return;

    if ('append' in parent) {
        parent.append(...nodes);
    } else {
        if (nodes.length === 1) {
            let node = nodes[0];
            const isNode = node instanceof Node;
            node = isNode ? node : document.createTextNode(String(node));

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

let hasScopedQuerySelector = null;

const detectScopedSelectorFeature = () => {
    try {
        document.createElement('div').querySelector(':scope > div');
        hasScopedQuerySelector = true;
    } catch (err) {
        hasScopedQuerySelector = false;
    }
};

/**
 * @param {Element} el
 * @param {string} selector
 * @returns {Element|null}
 */
const scopedSelector = function (el, selector) {
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
const scopedSelectorAll = function (el, selector) {
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
const toggleClass = function (el, className, toggle) {
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
