import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const getItems = query({
	args: { deviceId: v.string() },
	handler: async (ctx, args) => {
		return await ctx.db
			.query('shoppingItems')
			.withIndex('by_deviceId', (q) => q.eq('deviceId', args.deviceId))
			.collect();
	},
});

export const addItem = mutation({
	args: {
		deviceId: v.string(),
		name: v.string(),
		quantity: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.insert('shoppingItems', {
			deviceId: args.deviceId,
			name: args.name,
			quantity: args.quantity,
			checked: false,
		});
	},
});

export const updateItem = mutation({
	args: {
		id: v.id('shoppingItems'),
		name: v.string(),
		quantity: v.number(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			name: args.name,
			quantity: args.quantity,
		});
	},
});

export const toggleItem = mutation({
	args: {
		id: v.id('shoppingItems'),
		checked: v.boolean(),
	},
	handler: async (ctx, args) => {
		await ctx.db.patch(args.id, {
			checked: args.checked,
		});
	},
});

export const deleteItem = mutation({
	args: { id: v.id('shoppingItems') },
	handler: async (ctx, args) => {
		await ctx.db.delete(args.id);
	},
});
