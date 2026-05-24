import { describe, expect, it } from "vitest";

import {
	PROPERTY_OWNED_TABLES,
	PROPERTY_ROOT_TABLES,
	assertSameProperty,
	assignPropertyOwnership,
	requirePropertyScope,
	scopeCurrentPropertyQuery,
	scopeOperationalQuery,
	type PropertyScope,
} from "./propertyScope";

type EqCall = {
	readonly column: string;
	readonly value: string;
};

class FakeQuery {
	readonly eqCalls: EqCall[] = [];

	eq(column: string, value: string): this {
		this.eqCalls.push({ column, value });
		return this;
	}
}

const scope: PropertyScope = { propertyId: "property-1" };

describe("property scope utilities", () => {
	it("requires and trims a session-derived property scope", () => {
		expect(requirePropertyScope({ propertyId: " property-1 " })).toEqual({
			ok: true,
			value: { propertyId: "property-1" },
		});
	});

	it.each([
		["null session", null],
		["undefined session", undefined],
		["missing property", {}],
		["blank property", { propertyId: "  " }],
	])("rejects missing property scope for %s", (_label, session) => {
		expect(requirePropertyScope(session)).toEqual({
			ok: false,
			code: "missing-property-scope",
		});
	});

	it("returns safe local errors without raw secret payloads", () => {
		const result = requirePropertyScope({ propertyId: "  " });

		expect(JSON.stringify(result)).not.toContain("token");
		expect(JSON.stringify(result)).not.toContain("anon");
		expect(JSON.stringify(result)).not.toContain("jwt");
		expect(JSON.stringify(result)).not.toContain("secret");
	});

	it("scopes operational queries by property_id and keeps chaining", () => {
		const query = new FakeQuery();

		expect(scopeOperationalQuery(query, scope)).toBe(query);
		expect(query.eqCalls).toEqual([
			{ column: "property_id", value: "property-1" },
		]);
	});

	it("scopes current property queries by id and keeps chaining", () => {
		const query = new FakeQuery();

		expect(scopeCurrentPropertyQuery(query, scope)).toBe(query);
		expect(query.eqCalls).toEqual([{ column: "id", value: "property-1" }]);
	});

	it("assigns session property ownership when payload has no property_id", () => {
		expect(assignPropertyOwnership({ name: "Room A" }, scope)).toEqual({
			ok: true,
			value: { name: "Room A", property_id: "property-1" },
		});
	});

	it("accepts and normalizes matching payload property ownership", () => {
		expect(
			assignPropertyOwnership(
				{ name: "Room A", property_id: " property-1 " },
				scope,
			),
		).toEqual({
			ok: true,
			value: { name: "Room A", property_id: "property-1" },
		});
	});

	it("rejects mismatched caller-supplied property ownership", () => {
		expect(
			assignPropertyOwnership({ property_id: "property-2" }, scope),
		).toEqual({ ok: false, code: "property-scope-mismatch" });
	});

	it("asserts matching mutation target property", () => {
		expect(assertSameProperty(" property-1 ", scope)).toEqual({
			ok: true,
			value: scope,
		});
	});

	it("rejects missing mutation target property", () => {
		expect(assertSameProperty("  ", scope)).toEqual({
			ok: false,
			code: "missing-property-scope",
		});
	});

	it("rejects mismatched mutation target property", () => {
		expect(assertSameProperty("property-2", scope)).toEqual({
			ok: false,
			code: "property-scope-mismatch",
		});
	});

	it("lists property-owned operational tables and keeps properties as root", () => {
		expect(PROPERTY_OWNED_TABLES).toEqual([
			"profiles",
			"guests",
			"room_types",
			"rooms",
			"reservations",
			"reservation_items",
			"stays",
			"stay_guests",
			"housekeeping_tasks",
			"maintenance_tickets",
			"invoices",
			"payments",
		]);
		expect(PROPERTY_ROOT_TABLES).toEqual(["properties"]);
		expect(PROPERTY_OWNED_TABLES).not.toContain("properties");
	});
});
