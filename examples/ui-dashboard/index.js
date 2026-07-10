import { defineModule } from '../../index.js';

export default defineModule(import.meta, (ctx) => {
    ctx.addRoute('/dashboard', { component: 'DashboardPage' });
    ctx.addRoute('/dashboard/users', { component: 'UserListPage' });
});
