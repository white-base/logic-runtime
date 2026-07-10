import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineModule } from '../index.js';
import { metaFor } from './helpers.js';

test('logic.json 의 depTables 와 JS declareDepTable 이 name 기준으로 병합되고, 충돌 시 JS 가 우선하며 경고를 남긴다', () => {
    const warnings = [];
    const originalWarn = console.warn;
    console.warn = (msg) => warnings.push(msg);

    let ctx;
    try {
        ctx = defineModule(metaFor('dep-merge'), (c) => {
            c.declareDepTable({ name: 'shared', columns: ['a', 'b-from-js'] });
            c.declareDepTable({ name: 'js-only', columns: ['c'] });
        });
    } finally {
        console.warn = originalWarn;
    }

    const byName = Object.fromEntries(ctx._depTables.map((d) => [d.name, d]));

    assert.deepEqual(Object.keys(byName).sort(), ['js-only', 'json-only', 'shared']);
    assert.deepEqual(byName.shared.columns, ['a', 'b-from-js']); // JS 선언이 JSON 을 덮어씀
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /'shared' 중복 선언/);
});
