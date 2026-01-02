import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
	shoppingItems: defineTable({
		deviceId: v.string(),
		name: v.string(),
		quantity: v.number(),
		checked: v.boolean(),
	}).index('by_deviceId', ['deviceId']),
});
