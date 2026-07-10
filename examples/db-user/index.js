import { defineModule } from '../../index.js';

export default defineModule(import.meta, (ctx) => {
    ctx.addTable('users', { columns: ['id', 'name', 'email'] });
    ctx.addQuery('getUserById', { sql: 'SELECT * FROM users WHERE id = ?' });

    // logic.json 의 schemaContrib.depTables 와 name 이 같으면 병합 시점에 경고 후 override 됨
    ctx.declareDepTable({ name: 'user_roles', columns: ['userId', 'roleId', 'grantedAt'] });
});
