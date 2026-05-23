/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationPath = join(
	process.cwd(),
	"database/migrations/001_define_core_innhub_schema.sql",
);
const rollbackPath = join(
	process.cwd(),
	"database/migrations/001_define_core_innhub_schema.down.sql",
);

const requiredEnums = {
	profile_role: [
		"administrator",
		"manager",
		"receptionist",
		"housekeeping",
		"maintenance",
	],
	profile_status: ["active", "inactive"],
	room_state: ["available", "occupied", "cleaning", "maintenance", "inactive"],
	reservation_status: [
		"pending",
		"confirmed",
		"partially_checked_in",
		"checked_in",
		"cancelled",
		"no_show",
	],
	reservation_item_status: [
		"pending",
		"confirmed",
		"checked_in",
		"cancelled",
		"no_show",
	],
	stay_status: ["active", "checked_out", "cancelled"],
	housekeeping_status: ["pending", "in_progress", "completed", "cancelled"],
	maintenance_status: ["open", "in_progress", "resolved", "cancelled"],
	task_priority: ["low", "normal", "high", "urgent"],
	invoice_status: ["pending", "partial", "paid", "void"],
	payment_method: ["cash", "card", "bank_transfer", "other"],
	payment_status: ["recorded", "voided"],
} as const;

const requiredTables = [
	"properties",
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
] as const;

const operationalTables = requiredTables.filter(
	(tableName) => tableName !== "properties",
);

function readMigration(): string {
	return readFileSync(migrationPath, "utf8");
}

function normalizeSql(sql: string): string {
	return sql.toLowerCase().replaceAll(/\s+/g, " ");
}

function getTableBody(sql: string, tableName: string): string {
	const match = new RegExp(
		`create\\s+table\\s+${tableName}\\s*\\(([\\s\\S]*?)\\n\\);`,
		"i",
	).exec(sql);

	if (!match) {
		throw new Error(`Missing table definition for ${tableName}`);
	}

	return match[1].toLowerCase();
}

describe("core InnHub database migration", () => {
	it("exists as versioned up and down migrations", () => {
		expect(existsSync(migrationPath)).toBe(true);
		expect(existsSync(rollbackPath)).toBe(true);
	});

	it("defines the approved native PostgreSQL enums", () => {
		const migration = normalizeSql(readMigration());

		for (const [enumName, values] of Object.entries(requiredEnums)) {
			expect(migration).toContain(`create type ${enumName} as enum`);

			for (const value of values) {
				expect(migration).toContain(`'${value}'`);
			}
		}

		expect(migration).not.toContain("'reserved'");
		expect(migration).not.toContain("'out_of_service'");
		expect(migration).not.toContain("'draft'");
		expect(migration).not.toContain("'payment_due'");
	});

	it("creates every ERD-approved core table", () => {
		const migration = normalizeSql(readMigration());

		for (const tableName of requiredTables) {
			expect(migration).toContain(`create table ${tableName} (`);
		}
	});

	it("adds property scope to operational tables", () => {
		const migration = readMigration();

		for (const tableName of operationalTables) {
			expect(getTableBody(migration, tableName)).toContain(
				"property_id uuid not null",
			);
		}
	});

	it("keeps inventory decisions aligned with the ERD", () => {
		const migration = readMigration();
		const roomTypes = getTableBody(migration, "room_types");
		const rooms = getTableBody(migration, "rooms");
		const normalized = normalizeSql(migration);

		expect(roomTypes).toContain("capacity integer not null");
		expect(roomTypes).toContain("base_price numeric");
		expect(roomTypes).not.toContain("quantity");
		expect(rooms).toContain("identifier text not null");
		expect(rooms).toContain("state room_state not null");
		expect(normalized).toContain("unique (property_id, identifier)");
	});

	it("models profile identity and reservation/stay separation", () => {
		const migration = readMigration();
		const profiles = getTableBody(migration, "profiles");
		const reservationItems = getTableBody(migration, "reservation_items");
		const stays = getTableBody(migration, "stays");
		const stayGuests = getTableBody(migration, "stay_guests");

		expect(profiles).toContain("auth_user_id uuid not null unique");
		expect(reservationItems).toContain("room_type_id uuid not null");
		expect(reservationItems).toContain("room_id uuid");
		expect(reservationItems).toContain(
			"status reservation_item_status not null",
		);
		expect(stays).toContain("reservation_item_id uuid");
		expect(stays).toContain("room_id uuid not null");
		expect(stayGuests).toContain("stay_id uuid not null");
		expect(stayGuests).toContain("guest_id uuid not null");
	});

	it("supports manual billing without gateway fields", () => {
		const migration = readMigration();
		const invoices = getTableBody(migration, "invoices");
		const payments = getTableBody(migration, "payments");
		const paymentArea = `${payments}\n${normalizeSql(migration)}`;

		expect(invoices).toContain("reservation_id uuid");
		expect(invoices).toContain("stay_id uuid");
		expect(invoices).toContain("guest_id uuid");
		expect(invoices).toContain("invoices_has_subject_check");
		expect(payments).toContain("invoice_id uuid not null");
		expect(payments).toContain("method payment_method not null");
		expect(paymentArea).not.toMatch(/gateway|provider|webhook|token/);
	});

	it("keeps Work Unit A bounded to foundational schema", () => {
		const migration = normalizeSql(readMigration());
		const rollback = normalizeSql(readFileSync(rollbackPath, "utf8"));

		expect(migration).toContain("create extension if not exists pgcrypto");
		expect(migration).toContain(
			"planned_check_out_date > planned_check_in_date",
		);
		expect(migration).toContain("guest_count > 0");
		expect(migration).toContain("amount > 0");
		expect(migration).not.toContain("create trigger");
		expect(migration).not.toContain("exclude using");
		expect(rollback).toContain("drop table if exists payments");
		expect(rollback).toContain("drop type if exists profile_role");
	});
});
