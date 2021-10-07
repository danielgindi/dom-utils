/**
 * @param {Element} el
 * @param {string[]} props
 * @returns {Object<string, string>}
 */
const getCssProps = function (el, props) {
    const style = getComputedStyle(el);
    let res = {};
    for (let prop of props) {
        let val = style[prop];

        if ((prop === 'width' || prop === 'height') && val === 'auto' && el instanceof HTMLElement) {
            val = el['offset' + prop.substr(0, 1).toUpperCase() + prop.substr(1)];

            if (style.boxSizing !== 'border-box') {
                if (prop === 'width') {
                    val -= parseFloat(style.paddingLeft || 0);
                    val -= parseFloat(style.paddingRight || 0);
                    val -= parseFloat(style.borderLeftWidth || 0);
                    val -= parseFloat(style.borderRightWidth || 0);
                } else {
                    val -= parseFloat(style.paddingTop || 0);
                    val -= parseFloat(style.paddingBottom || 0);
                    val -= parseFloat(style.borderTopWidth || 0);
                    val -= parseFloat(style.borderBottomWidth || 0);
                }
                if (val < 0)
                    val = 0;
            }
        }

        res[prop] = val;
    }
    return res;
};

/**
 * @param {ElementCSSInlineStyle} el
 * @param {Object<string, string>} props
 */
const setCssProps = function (el, props) {
    for (let [key, value] of Object.entries(props))
        el.style[key] = (value === undefined || value === null) ? '' : String(value);
};

const generateGetElementSizeFn = function (pseudo, dim, dimCased, startDim, endDim) {
    return (...args) => {
        let /**Element|ElementCSSInlineStyle*/el = args[0],
            /**string*/pseudoSelector,
            /**boolean*/paddings,
            /**boolean*/borders,
            /**boolean*/margins;

        if (pseudo) {
            pseudoSelector = args[1];
            paddings = !!args[2];
            borders = !!args[3];
            margins = !!args[4];
        } else {
            paddings = !!args[1];
            borders = !!args[2];
            margins = !!args[3];
        }

        if ((/**@type Window*/el) === window) {
            return (/**@type Window*/el).document.documentElement[`client${dimCased}`];
        }
        else if (el.nodeType === 9) { // document
            const doc = (/**@type Document*/el).documentElement;
            const body = (/**@type Document*/el).body;

            return Math.max(
                body[`scroll${dimCased}`],
                doc[`scroll${dimCased}`],
                body[`offset${dimCased}`],
                doc[`offset${dimCased}`],
                doc[`client${dimCased}`],
            );
        }
        else {
            let value;
            let style;
            let includesPadding = false, includesBorders = false;

            if (!pseudo && ('getBoundingClientRect' in el)) {
                value = el.getBoundingClientRect()[dim];
                includesPadding = true;
                includesBorders = true;
            }

            if (value === undefined || margins || includesPadding !== paddings || includesBorders !== borders) {
                style = pseudo ? getComputedStyle(el, pseudoSelector) : getComputedStyle(el);
            }

            if (value === undefined) {
                let raw = style[dim];
                if (raw === 'auto') { // computedStyle is no good here, probably an 'inline' element
                    value = el[`client${dimCased}`]; // take clientWidth/clientHeight (damn it, it's rounded)
                    includesPadding = true;
                } else {
                    value = parseFloat(raw);
                }

                if (style.boxSizing === 'border-box') {
                    includesPadding = true;
                    includesBorders = true;
                }
            }

            if (paddings !== includesPadding) {
                let totalPadding = parseFloat(style[`padding-${startDim}`] || 0) +
                    parseFloat(style[`padding-${endDim}`] || 0);
                if (paddings) value += totalPadding;
                else value -= totalPadding;
            }

            if (borders !== includesBorders) {
                let totalBorders = parseFloat(style[`border-${startDim}-width`] || 0) +
                    parseFloat(style[`border-${endDim}-width`] || 0);
                if (borders) value += totalBorders;
                else value -= totalBorders;
            }

            if (value < 0)
                value = 0;

            if (margins) {
                let totalMargins = parseFloat(style[`margin-${startDim}`] || 0) +
                    parseFloat(style[`margin-${endDim}`] || 0);
                value += totalMargins;
            }

            return value;
        }
    };
};

const generateSetElementSizeFn = (dim, dimCased, startDim, endDim) => {
    return (/**Element|ElementCSSInlineStyle*/el,
            /**number*/value,
            paddings = false, borders = false, margins = false) => {

        if ((/**@type Window*/el) === window) {
            return;
        }

        if (el.nodeType === 9) { // document
            return;
        }

        const style = getComputedStyle(el);

        let includesPaddingAndBorders = false;

        if (style.boxSizing === 'border-box') {
            includesPaddingAndBorders = true;
        }

        paddings = !!paddings;
        borders = !!borders;
        margins = !!margins;

        if (margins)
            value -= (parseFloat(style[`margin-${startDim}`]) || 0) + (parseFloat(style[`margin-${endDim}`]) || 0);

        if (paddings !== includesPaddingAndBorders) {
            let totalPadding = parseFloat(style[`padding-${startDim}`] || 0) +
                parseFloat(style[`padding-${endDim}`] || 0);
            if (paddings) value -= totalPadding;
            else value += totalPadding;
        }

        if (borders !== includesPaddingAndBorders) {
            let totalBorders = (parseFloat(style[`border-${startDim}-width`]) || 0) +
                (parseFloat(style[`border-${endDim}-width`]) || 0);
            if (borders) value -= totalBorders;
            else value += totalBorders;
        }

        if (value < 0)
            value = 0;

        el.style[dim] = value + 'px';
    };
};

/**
 * Gets the width of an element, with fractions
 * @function getElementWidth
 * @param {Element} el
 * @param {boolean} [paddings=false] - include paddings
 * @param {boolean} [borders=false] - include borders
 * @param {boolean} [margins=false] - include margins
 * @returns {number}
 */
const getElementWidth = generateGetElementSizeFn(false, 'width', 'Width', 'left', 'right');

/**
 * Gets the width of an element, with fractions
 * @function getElementHeight
 * @param {Element} el
 * @param {boolean} [paddings=false] - include paddings
 * @param {boolean} [borders=false] - include borders
 * @param {boolean} [margins=false] - include margins
 * @returns {number}
 */
const getElementHeight = generateGetElementSizeFn(false, 'height', 'Height', 'top', 'bottom');

/**
 * Gets the width of an element, with fractions
 * @function getPseudoElementWidth
 * @param {Element} el
 * @param {string} pseudo
 * @param {boolean} [paddings=false] - include paddings
 * @param {boolean} [borders=false] - include borders
 * @param {boolean} [margins=false] - include margins
 * @returns {number}
 */
const getPseudoElementWidth = generateGetElementSizeFn(true, 'width', 'Width', 'left', 'right');

/**
 * Gets the width of an element, with fractions
 * @function getPseudoElementHeight
 * @param {Element} el
 * @param {string} pseudo
 * @param {boolean} [paddings=false] - include paddings
 * @param {boolean} [borders=false] - include borders
 * @param {boolean} [margins=false] - include margins
 * @returns {number}
 */
const getPseudoElementHeight = generateGetElementSizeFn(true, 'height', 'Height', 'top', 'bottom');

/**
 * Sets the width of an element
 * @function setElementWidth
 * @param {Element} el
 * @param {number} value
 * @param {boolean} [paddings=false] - include paddings
 * @param {boolean} [borders=false] - include borders
 * @param {boolean} [margins=false] - include margins
 */
const setElementWidth = generateSetElementSizeFn('width', 'Width', 'left', 'right');

/**
 * Sets the width of an element, with fractions
 * @function setElementHeight
 * @param {Element} el
 * @param {number} value
 * @param {boolean} [paddings=false] - include paddings
 * @param {boolean} [borders=false] - include borders
 * @param {boolean} [margins=false] - include margins
 */
const setElementHeight = generateSetElementSizeFn('height', 'Height', 'top', 'bottom');

/**
 * Find offset of an element relative to the document, considering scroll offsets
 * @param {Element} el
 * @returns {{top: number, left: number}}
 */
const getElementOffset = el => {
    if (!el.getClientRects().length) {
        return { top: 0, left: 0 };
    }

    let rect = el.getBoundingClientRect();
    let view = el.ownerDocument.defaultView;

    return {
        top: rect.top + view.pageYOffset,
        left: rect.left + view.pageXOffset,
    };
};

/**
 * Calculates the anchored position relative to this element. <br />
 * The return value will include an `left`/`top` position on left/top axis, <br />
 *   an `right`/`bottom` position which is the exact opposite, <br />
 *   and the `xSpec`/`ySpec` after normalizing rtl based values (`'start'`/`'end'`).
 * @param {Element} el? - the target element to base the calculations on. If `size` and `rtl` are specified - then this argument is optional.
 * @param {'left'|'center'|'right'|'start'|'end'|string|number} xSpec - horizontal anchor specification (could be either `'left'|'center'|'right'|'start'|'end'` or a percentage `'50%'` or a fixed decimal `Number`)
 * @param {'top'|'center'|'bottom'|string|number} ySpec - vertical anchor specification (could be either `'top'|'center'|'bottom'` or a percentage `'50%'` or a fixed decimal `Number`)
 * @param {{width: number, height: number}?} size - can be specified if already known, to avoid extra dom calculations. This is the outer size of the element, including padding and borders.
 * @param {boolean?} [rtl] - if not specified and values like `'start'`/`'end'` are use, then `rtl` is auto detected
 * @returns {{left: number, top: number, right: number, bottom: number, xSpec: string|number, ySpec: string|number}}
 */
const anchoredPosition = function (el, xSpec, ySpec, size, rtl) {
    if (!size) {
        size = {
            width: getElementWidth(el, true, true),
            height: getElementWidth(el, true, true),
        };
    }

    if (xSpec === 'start' || xSpec === 'end') {
        if ((/**@type boolean|null*/rtl) === null || rtl === undefined) {
            rtl = getComputedStyle(el).direction === 'rtl';
        }
        xSpec = xSpec === 'start' ? (rtl ? 'right' : 'left') : (rtl ? 'left' : 'right');
    }

    let x, y;
    let xInverted, yInverted;

    if (xSpec === 'right') {
        x = size.width;
        xInverted = 0;
    }
    else if (xSpec === 'center') {
        x = size.width / 2;
        xInverted = x;
    }
    else if (xSpec === 'left') {
        x = 0;
        xInverted = size.width;
    }
    else if (xSpec && (typeof xSpec === 'string') && xSpec.charAt(xSpec.length - 1) === '%') {
        let percent = ((parseFloat(xSpec) || 0) / 100);
        x = size.width * percent;
        xInverted = size.width * -percent;

        if ((/**@type boolean|null*/rtl) === null || rtl === undefined)
            rtl = getComputedStyle(el).direction === 'rtl';

        if (rtl) {
            x = size.width - x;
            xInverted = size.width - x;
        }
    }
    else {
        x = parseFloat(xSpec) || 0;
        xInverted = -x;
    }

    if (ySpec === 'bottom') {
        y = size.height;
        yInverted = 0;
    }
    else if (ySpec === 'center') {
        y = size.height / 2;
        yInverted = y;
    }
    else if (ySpec === 'top') {
        y = 0;
        yInverted = size.height;
    }
    else if (ySpec && (typeof ySpec === 'string') && ySpec.charAt(ySpec.length - 1) === '%') {
        let percent = ((parseFloat(ySpec) || 0) / 100);
        y = size.height * percent;
        yInverted = size.height * -percent;
    }
    else {
        y = parseFloat(ySpec) || 0;
        yInverted = -y;
    }

    return {
        left: x,
        top: y,
        right: xInverted,
        bottom: yInverted,
        xSpec: xSpec,
        ySpec: ySpec,
    };
};

const timeToMs = (value) => {
    if (!value) {
        return;
    }

    let isMs = value.endsWith('ms');
    return parseFloat(value) * (isMs ? 1 : 1000);
};

const isTimeString = (value) => {
    return /^-?(0?\.)?\d+m?s$/.test(value);
};

const parseSingleTransition = (transition) => {
    let parts = transition.split(/\s+/),
        name = parts[0],
        duration = parts[1],
        timingFunctionOrDelay = parts[2],
        delay = parts[3];

    if (isTimeString(timingFunctionOrDelay)) {
        return {
            delay: timeToMs(timingFunctionOrDelay),
            duration: timeToMs(duration),
            name: name,
        };
    }

    return {
        delay: timeToMs(delay),
        duration: timeToMs(duration),
        name: name,
        timingFunction: timingFunctionOrDelay,
    };
};

const parseTransition = (transition) => {
    return transition.match(/([^,()]|\([^)]*\))+/g).map(value => value.trim()).filter(value => value.length > 0).map(parseSingleTransition);
};

export {
    getCssProps,
    setCssProps,
    getElementWidth,
    getElementHeight,
    setElementWidth,
    setElementHeight,
    getPseudoElementWidth,
    getPseudoElementHeight,
    getElementOffset,
    anchoredPosition,
    parseTransition,
    parseSingleTransition,
    isTimeString,
    timeToMs,
};
