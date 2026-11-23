import assert from 'node:assert/strict';
import { test } from 'node:test';
import * as library from '../lib/index';
import DomEventsSink from '../lib/DomEventsSink';
import * as Css from '../lib/Css';
import * as Dom from '../lib/Dom';
import * as DomCompat from '../lib/DomCompat';
import * as Touches from '../lib/Touches';
import * as ScrollHelper from '../lib/ScrollHelper';

test('the package exports the event sink constructor directly', () => {
    assert.equal(library.DomEventsSink, DomEventsSink);
    assert.ok(new library.DomEventsSink() instanceof DomEventsSink);
});

test('the package preserves the original grouped helper exports', () => {
    assert.deepEqual(Object.keys(library).sort(), [
        'Css', 'Dom', 'DomCompat', 'DomEventsSink', 'ScrollHelper', 'Touches',
    ]);
    const groups: [Record<string, unknown>, Record<string, unknown>][] = [
        [library.Css, Css],
        [library.Dom, Dom],
        [library.DomCompat, DomCompat],
        [library.Touches, Touches],
        [library.ScrollHelper, ScrollHelper],
    ];

    for (const [actual, expected] of groups) {
        assert.deepEqual(Object.keys(actual).sort(), Object.keys(expected).sort());
        for (const [name, helper] of Object.entries(expected))
            assert.equal(actual[name], helper, `Changed grouped export: ${name}`);
    }
});
