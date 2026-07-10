/**** logic-runtime | 최소 스텁 ****/
// 목적: 샘플 구동을 위한 골격. 실제 구현에서는 kind 에 따라
//       SQLContext / UIContext 를 생성한다. (TODO 표기 참조)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ── family 싱글톤 레지스트리 ──────────────────────────────────
// globalThis + Symbol.for 사용 이유:
//   node_modules 중복 설치로 logic-runtime 자체가 2벌 로딩되어도
//   레지스트리는 프로세스당 하나로 유지된다.
const REG_KEY = Symbol.for('logic.registry.v1');
const registry = (globalThis[REG_KEY] ??= new Map());   // family → { version, instance }

function readManifest(meta) {
    const dir = path.dirname(fileURLToPath(meta.url));
    const file = path.join(dir, 'logic.json');
    const manifest = JSON.parse(fs.readFileSync(file, 'utf8'));
    return { manifest, dir };
}

// ── Context 스텁 (실제: SQLContext / UIContext) ───────────────
class ContextStub {
    constructor(manifest) {
        this.manifest  = manifest;
        this.kind      = manifest.kind;
        this.contexts  = [];      // 하위 컨텍스트 (폴드: 하위→상위)
        this.tables    = new Map();
        this.queries   = new Map();
        this.routes    = [];
        this.provides  = new Map();
        this.reexports = [];
        this.dbLinks   = [];      // attachDb 대상
        this._depTables = [];     // export 직전 일괄 적용 대기
    }
    addTable(name, def)          { this.tables.set(name, def); }
    addQuery(name, def)          { this.queries.set(name, def); }
    addContext(ctx)              { this.contexts.push(ctx); }
    attachDb(ctx)                { this.dbLinks.push(ctx); }
    addRoute(base, def)          { this.routes.push({ base, ...def }); }
    registerProvides(key, load)  { this.provides.set(key, load); }
    reexport(key)                { this.reexports.push(key); }
    declareDepTable(def)         { this._depTables.push(def); }

    // 자신 기준 하위 컨텍스트 로딩 순서 (하위 우선, 사이클 가드)
    getLoadContext(loaded = new Set(), visiting = new Set(), out = []) {
        if (loaded.has(this) || visiting.has(this)) return out;
        visiting.add(this);
        for (const dep of [...this.dbLinks, ...this.contexts]) {
            dep.getLoadContext?.(loaded, visiting, out);
        }
        loaded.add(this);
        out.push(this);
        visiting.delete(this);
        return out;
    }
}

// ── 공통 생성기 ───────────────────────────────────────────────
function create(meta, setup, isBundle) {
    const { manifest } = readManifest(meta);
    const key = manifest.family ?? manifest.name;

    // 싱글톤 판정 (하이브리드: export 유지 + 레지스트리 등록)
    const found = registry.get(key);
    if (found) {
        if (found.version !== manifest.version && manifest.kind.startsWith('db_')) {
            // db 계열 버전 충돌 → 로딩 시점 차단
            throw new Error(
                `[Stage 3] family '${key}' 싱글톤 버전 충돌: ` +
                `${found.version} vs ${manifest.version}`);
        }
        return found.instance;      // 동일 버전 → 기존 인스턴스 병합 반환
    }

    // TODO(실구현): kind 별 컨텍스트 생성
    //   db_module / db_bundle → new SQLContext(manifest.name)
    //   ui_module / ui_bundle → new UIContext(manifest.name)
    const ctx = new ContextStub(manifest);

    setup?.(ctx);                   // 제작자 구성 실행

    // 관계 테이블 일괄 적용: 생명주기 마지막, export 직전
    //   logic.json schemaContrib.depTables + JS declareDepTable 병합
    const fromJson = manifest.schemaContrib?.depTables ?? [];
    ctx._depTables = mergeDepTables(fromJson, ctx._depTables);
    // TODO(실구현): SQLContext 에 dep table 을 SQLTable 로 실체화

    registry.set(key, { version: manifest.version, instance: ctx });
    return ctx;
}

function mergeDepTables(fromJson, fromJs) {
    const map = new Map(fromJson.map(d => [d.name, d]));
    for (const d of fromJs) {
        if (map.has(d.name)) {
            // TODO(실구현): 동일 name 충돌 → Stage 2 confirm
            console.warn(`[Stage 2] depTable '${d.name}' 중복 선언 (JSON/JS)`);
        }
        map.set(d.name, d);
    }
    return [...map.values()];
}

export function defineModule(meta, setup) { return create(meta, setup, false); }
export function defineBundle(meta, setup) { return create(meta, setup, true);  }
export function getRegistry()             { return registry; }
