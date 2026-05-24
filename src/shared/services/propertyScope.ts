export type PropertyScope = {
	readonly propertyId: string;
};

export type PropertyScopedSessionLike = {
	readonly propertyId?: string | null;
};

export type PropertyScopeErrorCode =
	| "missing-property-scope"
	| "property-scope-mismatch"
	| "unsupported-property-table";

export type PropertyScopeResult<T> =
	| { readonly ok: true; readonly value: T }
	| { readonly ok: false; readonly code: PropertyScopeErrorCode };

export type EqQuery<TQuery> = {
	readonly eq: (column: string, value: string) => TQuery;
};

export type PropertyOwnedPayload = {
	readonly property_id?: string;
	readonly [key: string]: unknown;
};

export const PROPERTY_OWNED_TABLES = [
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

export const PROPERTY_ROOT_TABLES = ["properties"] as const;

export type PropertyOwnedTable = (typeof PROPERTY_OWNED_TABLES)[number];
export type PropertyRootTable = (typeof PROPERTY_ROOT_TABLES)[number];

function normalizePropertyId(
	propertyId: string | null | undefined,
): string | null {
	const normalized = propertyId?.trim();
	return normalized ? normalized : null;
}

export function requirePropertyScope(
	session: PropertyScopedSessionLike | null | undefined,
): PropertyScopeResult<PropertyScope> {
	const propertyId = normalizePropertyId(session?.propertyId);

	if (!propertyId) {
		return { ok: false, code: "missing-property-scope" };
	}

	return { ok: true, value: { propertyId } };
}

export function scopeOperationalQuery<TQuery extends EqQuery<TQuery>>(
	query: TQuery,
	scope: PropertyScope,
): TQuery {
	return query.eq("property_id", scope.propertyId);
}

export function scopeCurrentPropertyQuery<TQuery extends EqQuery<TQuery>>(
	query: TQuery,
	scope: PropertyScope,
): TQuery {
	return query.eq("id", scope.propertyId);
}

export function assignPropertyOwnership<TPayload extends PropertyOwnedPayload>(
	payload: TPayload,
	scope: PropertyScope,
): PropertyScopeResult<
	Omit<TPayload, "property_id"> & { readonly property_id: string }
> {
	const payloadPropertyId = normalizePropertyId(payload.property_id);

	if (payloadPropertyId && payloadPropertyId !== scope.propertyId) {
		return { ok: false, code: "property-scope-mismatch" };
	}

	return {
		ok: true,
		value: {
			...payload,
			property_id: scope.propertyId,
		} as Omit<TPayload, "property_id"> & { readonly property_id: string },
	};
}

export function assertSameProperty(
	candidatePropertyId: string | null | undefined,
	scope: PropertyScope,
): PropertyScopeResult<PropertyScope> {
	const normalizedCandidate = normalizePropertyId(candidatePropertyId);

	if (!normalizedCandidate) {
		return { ok: false, code: "missing-property-scope" };
	}

	if (normalizedCandidate !== scope.propertyId) {
		return { ok: false, code: "property-scope-mismatch" };
	}

	return { ok: true, value: scope };
}
