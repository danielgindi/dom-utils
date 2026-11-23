import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { DomEventsSink, ScrollHelper, Touches } from '../lib/index';
import { dispatchTouch, dom, resetDom } from './setup';

beforeEach(resetDom);

test('event sink removes listeners by namespace and capture setting', () => {
    const target = document.createElement('button');
    const sink = new DomEventsSink.default();
    const calls: string[] = [];
    const edit = () => calls.push('edit');
    const view = () => calls.push('view');

    sink.add(target, 'click.edit', edit);
    sink.add(target, 'click.view', view, true);
    target.dispatchEvent(new dom.window.Event('click'));
    assert.deepEqual(calls, ['view', 'edit']);

    sink.remove(undefined, '.edit');
    target.dispatchEvent(new dom.window.Event('click'));
    assert.deepEqual(calls, ['view', 'edit', 'view']);

    sink.remove(target, 'click.view', view, true);
    target.dispatchEvent(new dom.window.Event('click'));
    assert.deepEqual(calls, ['view', 'edit', 'view']);
});

test('event sink removes every listener when no filter is supplied', () => {
    const target = document.createElement('button');
    const sink = new DomEventsSink.default();
    let calls = 0;
    sink.add(target, 'click.first', () => { calls += 1; });
    sink.add(target, 'click.second', () => { calls += 1; });

    sink.remove();
    target.dispatchEvent(new dom.window.Event('click'));
    assert.equal(calls, 0);
});

test('LTR scroll helpers round-trip normalized values', () => {
    const element = document.createElement('div');
    Object.defineProperties(element, {
        scrollWidth: { value: 200 },
        clientWidth: { value: 50 },
    });

    ScrollHelper.setScrollLeft(element, 35, false);
    assert.equal(element.scrollLeft, 35);
    assert.equal(ScrollHelper.getScrollLeft(element, false), 35);
    assert.equal(ScrollHelper.getScrollHorz(element, false), 35);

    ScrollHelper.setScrollHorz(element, 80, false);
    assert.equal(element.scrollLeft, 80);
});

test('RTL scroll helpers round-trip values in the simulated browser', () => {
    const element = document.createElement('div');
    Object.defineProperties(element, {
        scrollWidth: { value: 200 },
        clientWidth: { value: 50 },
    });

    ScrollHelper.setScrollLeft(element, 40, true);
    assert.equal(ScrollHelper.getScrollLeft(element, true), 40);

    ScrollHelper.setScrollHorz(element, 20, true);
    assert.equal(ScrollHelper.getScrollHorz(element, true), 20);
});

test('tap binding accepts short movement and rejects long movement', () => {
    const element = document.createElement('div');
    const taps: string[] = [];
    const binding = Touches.bindTouchTap(element, {
        distance: 9,
        handler: () => taps.push('tap'),
    });

    dispatchTouch(element, 'touchstart', 1, 10, 10);
    dispatchTouch(element, 'touchend', 1, 12, 13);
    assert.deepEqual(taps, ['tap']);

    dispatchTouch(element, 'touchstart', 2, 10, 10);
    dispatchTouch(element, 'touchend', 2, 30, 30);
    assert.deepEqual(taps, ['tap']);

    binding.unbind();
    dispatchTouch(element, 'touchstart', 3, 10, 10);
    dispatchTouch(element, 'touchend', 3, 11, 11);
    assert.deepEqual(taps, ['tap']);
});

test('touch cancellation resets the active gesture', () => {
    const element = document.createElement('div');
    let taps = 0;
    Touches.bindTouchTap(element, { handler: () => { taps += 1; } });

    dispatchTouch(element, 'touchstart', 1, 0, 0);
    dispatchTouch(element, 'touchcancel', 1, 0, 0);
    dispatchTouch(element, 'touchend', 1, 0, 0);
    assert.equal(taps, 0);

    dispatchTouch(element, 'touchstart', 2, 0, 0);
    dispatchTouch(element, 'touchend', 2, 0, 0);
    assert.equal(taps, 1);
});
