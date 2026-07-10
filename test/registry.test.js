import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defineModule, getRegistry } from '../index.js';
import { metaFor } from './helpers.js';

test('동일 family/version 재호출 시 기존 인스턴스를 반환하고 setup 은 재실행되지 않는다', () => {
    let calls = 0;
    const first = defineModule(metaFor('db-dep'), () => { calls += 1; });
    const second = defineModule(metaFor('db-dep'), () => { calls += 1; });

    assert.strictEqual(second, first);
    assert.strictEqual(calls, 1);
    assert.strictEqual(getRegistry().get('db-dep').instance, first);
});

test('db_ 계열은 동일 family 의 버전이 다르면 로딩 시점에 에러를 던진다', () => {
    defineModule(metaFor('db-a-v1'));
    assert.throws(
        () => defineModule(metaFor('db-a-v2')),
        /family 'db-a' 싱글톤 버전 충돌: 1\.0\.0 vs 2\.0\.0/
    );
});
