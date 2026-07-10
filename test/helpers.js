import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures');

// index.js 는 실존하지 않아도 된다 — readManifest() 는 meta.url 의 dirname 만 사용한다.
export function metaFor(fixtureName) {
    return { url: pathToFileURL(path.join(fixturesDir, fixtureName, 'index.js')).href };
}
