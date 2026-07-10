import { defineBundle } from '../../index.js';
import dbUser from '../db-user/index.js';
import uiDashboard from '../ui-dashboard/index.js';

export default defineBundle(import.meta, (ctx) => {
    ctx.attachDb(dbUser);
    ctx.addContext(uiDashboard);
});
