import {
	requirePropertyScope,
	type PropertyScope,
	type PropertyScopedSessionLike,
} from "./propertyScope";
import { serviceFailure, type ServiceResult } from "./serviceResult";

export type ServiceContext = {
	readonly propertyScope: PropertyScope;
};

export type ServiceSessionLike = PropertyScopedSessionLike;

export type PropertyScopedOperation<T> = (
	context: ServiceContext,
) => Promise<ServiceResult<T>> | ServiceResult<T>;

export function createServiceContext(
	session: ServiceSessionLike | null | undefined,
): ServiceResult<ServiceContext> {
	const propertyScope = requirePropertyScope(session);

	if (!propertyScope.ok) {
		return serviceFailure("property-scope-error");
	}

	return {
		ok: true,
		data: { propertyScope: propertyScope.value },
	};
}

export async function withServiceContext<T>(
	session: ServiceSessionLike | null | undefined,
	operation: PropertyScopedOperation<T>,
): Promise<ServiceResult<T>> {
	const context = createServiceContext(session);

	if (!context.ok) {
		return context;
	}

	return operation(context.data);
}
