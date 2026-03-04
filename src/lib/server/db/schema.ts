import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const task = sqliteTable('task', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	title: text('title').notNull(),
	priority: integer('priority').notNull().default(1)
});

export * from './auth.schema';
