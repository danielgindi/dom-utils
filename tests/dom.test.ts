import assert from 'node:assert/strict';
import { beforeEach, test } from 'node:test';
import { Dom, DomCompat } from '../lib/index';
import { resetDom } from './setup';

beforeEach(resetDom);

test('createElement applies attributes, styles, and children', () => {
    const child = document.createElement('span');
    const element = Dom.createElement('div', {
        id: 'created',
        innerHTML: '<b>initial</b>',
        css: { color: 'red' },
        title: null,
    }, [child]);

    assert.equal(element.id, 'created');
    assert.equal(element.querySelector('b')?.textContent, 'initial');
    assert.equal((element as HTMLElement).style.color, 'red');
    assert.equal(element.hasAttribute('title'), false);
    assert.equal(element.lastChild, child);
});

test('closestUntil, prev, next, and unwrapChildren preserve DOM order', () => {
    document.body.innerHTML = '<section class="outer"><div class="first"></div><div class="middle"><em></em></div><div class="last"></div></section>';
    const outer = document.querySelector('.outer')!;
    const first = document.querySelector('.first')!;
    const middle = document.querySelector('.middle')!;
    const last = document.querySelector('.last')!;
    const child = middle.querySelector('em')!;

    assert.equal(Dom.closestUntil(child, '.outer'), outer);
    assert.equal(Dom.closestUntil(child, '.outer', middle), null);
    assert.equal(Dom.prev(middle, '.first'), first);
    assert.equal(Dom.next(middle, '.last'), last);

    Dom.unwrapChildren(middle);
    assert.equal(outer.children[1], child);
    assert.equal(middle.isConnected, false);
});

test('compatibility insertion helpers accept nodes and text', () => {
    const parent = document.createElement('div');
    const middle = document.createElement('span');
    parent.appendChild(middle);

    DomCompat.before(middle, 'before');
    DomCompat.after(middle, 'after');
    DomCompat.prepend(parent, document.createTextNode('start-'));
    DomCompat.append(parent, '-end');

    assert.equal(parent.textContent, 'start-beforeafter-end');
    assert.equal(parent.children[0], middle);
});

test('scoped selectors, class toggling, root lookup, and removal work', () => {
    document.body.innerHTML = '<div id="scope"><span class="item"></span><div><span class="item"></span></div></div>';
    const scope = document.querySelector('#scope')!;
    const directChild = scope.querySelector('span')!;

    assert.equal(DomCompat.scopedSelector(scope, '> .item'), directChild);
    assert.equal(DomCompat.scopedSelectorAll(scope, '.item').length, 2);
    assert.equal(DomCompat.getRootNode(directChild), document);
    assert.equal(DomCompat.closest(directChild, '#scope'), scope);
    assert.equal(DomCompat.toggleClass(scope, 'active'), true);
    assert.equal(DomCompat.toggleClass(scope, 'active'), false);
    assert.equal(DomCompat.toggleClass(scope, 'active', true), true);

    DomCompat.remove(directChild);
    assert.equal(scope.querySelectorAll('.item').length, 1);
});
