/**
 * @param {Element} el
 * @param {Object} [options]
 * @param {number|undefined} [options.distance=9]
 * @param {function(event: TouchEvent)} [options.handler]
 * @returns {{ unbind: Function }}
 */
const bindTouchTap = function (el: Element, options: { distance?: number | null; handler?: (event: TouchEvent) => void }): { unbind: () => void } {
    let currentTouchId: number | null = null;
    let downPos: { x: number; y: number } | null = null;

    const startHandler = (evt: TouchEvent) => {
        if (currentTouchId !== null) return;

        let touch = evt.changedTouches[0];
        currentTouchId = touch.identifier;

        downPos = touch
            ? { x: touch.pageX, y: touch.pageY }
            : { x: (evt as TouchEvent & { pageX: number }).pageX, y: (evt as TouchEvent & { pageY: number }).pageY };

        el.addEventListener('touchend', endHandler);
        el.addEventListener('touchcancel', cancelHandler);
    };

    const endHandler = (evt: TouchEvent) => {
        if (currentTouchId === null) return;

        let touch: Touch | null = null;

        if (evt.changedTouches) {
            if (currentTouchId != null) {
                for (let item of evt.changedTouches) {
                    if (item.identifier === currentTouchId) {
                        touch = item;
                        break;
                    }
                }
            }

            if (!touch) {
                touch = evt.changedTouches[0];
            }
        }

        let currentPos = touch
            ? { x: touch.pageX, y: touch.pageY }
            : { x: (evt as TouchEvent & { pageX: number }).pageX, y: (evt as TouchEvent & { pageY: number }).pageY };
        let startPos = downPos;

        currentTouchId = null;
        downPos = null;

        if (options.distance !== null) {
            let distanceThreshold = options.distance || 1;
            let distanceTravelled = Math.hypot(Math.abs(currentPos.x - startPos.x), Math.abs(currentPos.y - startPos.y));
            if (distanceTravelled >= distanceThreshold) return false;
        }

        options.handler && options.handler(evt);
    };

    const cancelHandler = () => {
        currentTouchId = null;
        downPos = null;

        el.removeEventListener('touchend', endHandler);
        el.removeEventListener('touchcancel', cancelHandler);
    };

    el.addEventListener('touchstart', startHandler);

    return {
        unbind: () => {
            el.removeEventListener('touchstart', startHandler);
            el.removeEventListener('touchend', endHandler);
            el.removeEventListener('touchcancel', cancelHandler);
        },
    };
};

export {
    bindTouchTap,
};
