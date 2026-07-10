# logic-runtime
ui/db module, bundle runtime tools

## 구조

- `index.js` — 매니페스트(`logic.json`) 로더 + family 싱글톤 레지스트리 스텁 (`defineModule` / `defineBundle`)
- `examples/` — `db_module`(db-user), `ui_module`(ui-dashboard), `bundle`(app-bundle) 사용 예제. `node examples/run.js` 로 실행
- `test/` — 레지스트리 싱글톤/버전 충돌, 로드 순서, depTable 병합 동작 테스트 (`npm test`)

## 사용법

```js
import { defineModule } from 'logic-runtime';

export default defineModule(import.meta, (ctx) => {
    ctx.addTable('users', { columns: ['id', 'name'] });
});
```

같은 디렉터리에 `logic.json` 매니페스트(`name`/`family`/`version`/`kind` 등)가 있어야 한다.

## 스크립트

- `npm test` — `node --test` 로 테스트 실행
- `node examples/run.js` — 예제 번들 로드 순서 확인
