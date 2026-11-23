import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { Css } from '../lib/index';
import { resetDom } from './setup';

beforeEach(resetDom);

test('CSS properties can be written and read', () => {
    const element = document.createElement('div');
    document.body.appendChild(element);

    Css.setCssProps(element, { width: '24px', color: 'red' });
    assert.equal(element.style.width, '24px');
    assert.equal(Css.getCssProps(element, ['width']).width, '24px');

    Css.setCssProps(element, { width: null });
    assert.equal(element.style.width, '');
});

test('size helpers include padding, borders, and margins when requested', () => {
    const element = document.createElement('div');
    element.style.cssText = [
        'padding: 4px 5px 6px 5px',
        'border-style: solid',
        'border-width: 1px 2px 3px 2px',
        'margin: 0 7px 0 3px',
    ].join(';');
    element.getBoundingClientRect = () => ({
        width: 100,
        height: 40,
        top: 0,
        left: 0,
        right: 100,
        bottom: 40,
        x: 0,
        y: 0,
        toJSON: () => ({}),
    });
    document.body.appendChild(element);

    assert.equal(Css.getElementWidth(element), 86);
    assert.equal(Css.getElementWidth(element, true, true), 100);
    assert.equal(Css.getElementWidth(element, true, true, true), 110);
    assert.equal(Css.getElementHeight(element), 26);

    Css.setElementWidth(element, 100, true, true);
    assert.equal(element.style.width, '86px');

    Css.setElementHeight(element, 40, true, true);
    assert.equal(element.style.height, '26px');
});

test('pseudo-element sizes use their computed dimensions', () => {
    const originalGetComputedStyle = globalThis.getComputedStyle;
    globalThis.getComputedStyle = () => ({
        width: '20px',
        height: '30px',
        boxSizing: 'content-box',
        'padding-left': '2px',
        'padding-right': '3px',
        'padding-top': '4px',
        'padding-bottom': '6px',
        'border-left-width': '1px',
        'border-right-width': '1px',
        'border-top-width': '2px',
        'border-bottom-width': '2px',
    } as unknown as CSSStyleDeclaration);

    try {
        const element = document.createElement('div');
        assert.equal(Css.getPseudoElementWidth(element, '::before', true, true), 27);
        assert.equal(Css.getPseudoElementHeight(element, '::after', true, true), 44);
    } finally {
        globalThis.getComputedStyle = originalGetComputedStyle;
    }
});

test('offset and anchor calculations return coordinates', () => {
    const element = document.createElement('div');
    element.getClientRects = () => ({ length: 1 } as DOMRectList);
    element.getBoundingClientRect = () => ({
        top: 10,
        left: 20,
    } as DOMRect);
    const originalX = window.pageXOffset;
    const originalY = window.pageYOffset;
    Object.defineProperties(window, {
        pageXOffset: { value: 5, configurable: true },
        pageYOffset: { value: 7, configurable: true },
    });

    try {
        assert.deepEqual(Css.getElementOffset(element), { top: 17, left: 25 });
    } finally {
        Object.defineProperties(window, {
            pageXOffset: { value: originalX, configurable: true },
            pageYOffset: { value: originalY, configurable: true },
        });
    }

    assert.deepEqual(Css.anchoredPosition(undefined, 'right', 'bottom', { width: 100, height: 40 }), {
        left: 100,
        top: 40,
        right: 0,
        bottom: 0,
        xSpec: 'right',
        ySpec: 'bottom',
    });
    assert.equal(Css.anchoredPosition(undefined, 'start', 'top', { width: 100, height: 40 }, true).left, 100);
});

test('transition parsing handles multiple timing units and entries', () => {
    assert.equal(Css.timeToMs('1.5s'), 1500);
    assert.equal(Css.isTimeString('250ms'), true);
    assert.deepEqual(Css.parseSingleTransition('opacity 200ms ease 50ms'), {
        name: 'opacity',
        duration: 200,
        timingFunction: 'ease',
        delay: 50,
    });
    assert.deepEqual(Css.parseTransition('opacity 200ms ease 50ms, transform 1s linear 0s'), [
        { name: 'opacity', duration: 200, timingFunction: 'ease', delay: 50 },
        { name: 'transform', duration: 1000, timingFunction: 'linear', delay: 0 },
    ]);
    assert.deepEqual(Css.parseTransition(''), []);
});
