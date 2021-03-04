let rtlScrollType;

const detectRtlScrollType = () => {
    const definer = document.createElement('div');
    definer.dir = 'rtl';
    Object.assign(definer.style, {
        direction: 'rtl',
        fontSize: '14px',
        width: '1px',
        height: '1px',
        position: 'absolute',
        top: '-1000px',
        overflow: 'scroll',
    });
    definer.textContent = 'A';
    document.body.appendChild(definer);

    let type = 'reverse';

    if (definer.scrollLeft > 0) {
        type = 'default';
    } else {
        definer.scrollLeft = 1;
        if (definer.scrollLeft === 0) {
            type = 'negative';
        }
    }

    definer.parentNode.removeChild(definer);

    return type;
};

/**
 * @param {Element} el
 * @param {number} left
 * @param {boolean|undefined} [rtl] if unspecified, then it's automatically detected.
 * @returns {number}
 */
function calculateScrollLeftForValue(el, left, rtl) {
    if (rtl === undefined) {
        rtl = getComputedStyle(el).direction === 'rtl';
    }

    if (rtl === true && rtlScrollType === undefined) {
        rtlScrollType = detectRtlScrollType();
    }

    if (rtl) {
        switch (rtlScrollType) {
            case 'negative':
                return left - el.scrollWidth + el.clientWidth;

            case 'reverse':
                return el.scrollWidth - left - el.clientWidth;

            default:
                return left;
        }
    } else {
        return left;
    }
}

/**
 * @param {Element} el
 * @param {boolean|undefined} [rtl] if unspecified, then it's automatically detected.
 * @returns {number}
 */
function getScrollLeft(el, rtl) {
    if (rtl === undefined) {
        rtl = getComputedStyle(el).direction === 'rtl';
    }

    if (rtl === true && rtlScrollType === undefined) {
        rtlScrollType = detectRtlScrollType();
    }

    if (rtl) {
        switch (rtlScrollType) {
            case 'negative':
                return el.scrollLeft + el.scrollWidth - el.clientWidth;

            case 'reverse':
                return el.scrollWidth - el.scrollLeft - el.clientWidth;

            default:
                return el.scrollLeft;
        }
    } else {
        return el.scrollLeft;
    }
}

/**
 * @param {Element} el
 * @param {number} left
 * @param {boolean|undefined} [rtl] if unspecified, then it's automatically detected.
 */
function setScrollLeft(el, left, rtl) {
    el.scrollLeft = calculateScrollLeftForValue(el, left, rtl);
}

/**
 * @param {Element} el
 * @param {number} value
 * @param {boolean|undefined} [rtl] if unspecified, then it's automatically detected.
 * @returns {number}
 */
function calculateScrollHorzForValue(el, value, rtl) {
    if (rtl === undefined) {
        rtl = getComputedStyle(el).direction === 'rtl';
    }

    if (rtl) {
        return calculateScrollLeftForValue(el, el.scrollWidth - el.clientWidth - value, rtl);
    } else {
        return calculateScrollLeftForValue(el, value, rtl);
    }
}

/**
 * @param {Element} el
 * @param {boolean|undefined} [rtl] if unspecified, then it's automatically detected.
 * @returns {number}
 */
function getScrollHorz(el, rtl) {
    if (rtl === undefined) {
        rtl = getComputedStyle(el).direction === 'rtl';
    }
    if (rtl) {
        return el.scrollWidth - el.clientWidth - getScrollLeft(el, rtl);
    } else {
        return getScrollLeft(el, rtl);
    }
}

/**
 * @param {Element} el
 * @param {number} horz
 * @param {boolean|undefined} [rtl] if unspecified, then it's automatically detected.
 */
function setScrollHorz(el, horz, rtl) {
    el.scrollLeft = calculateScrollHorzForValue(el, horz, rtl);
}

export {
    calculateScrollLeftForValue,
    getScrollLeft,
    setScrollLeft,
    calculateScrollHorzForValue,
    getScrollHorz,
    setScrollHorz,
};
