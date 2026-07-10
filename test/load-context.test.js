import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineModule, defineBundle } from '../index.js';
import { metaFor } from './helpers.js';

test('getLoadContext() 는 하위 컨텍스트를 먼저, 사이클 없이 반환한다', () => {
    const dbDep = defineModule(metaFor('db-dep'));
    const uiLeaf = defineModule(metaFor('ui-leaf'));
    const dbRoot = defineBundle(metaFor('db-root'), (ctx) => {
        ctx.attachDb(dbDep);
        ctx.addContext(uiLeaf);
    });

    const order = dbRoot.getLoadContext().map((ctx) => ctx.manifest.name);

    assert.deepEqual(order, ['db-dep', 'ui-leaf', 'db-root']);
});
