import appBundle from './app-bundle/index.js';
import { getRegistry } from '../index.js';

const order = appBundle.getLoadContext().map((ctx) => ctx.manifest.name);
console.log('load order (하위 → 상위):', order);
console.log('registered families:', [...getRegistry().keys()]);
