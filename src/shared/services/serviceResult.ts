export type ServiceErrorCode =
	| "configuration-error"
	| "backend-error"
	| "validation-error"
	| "property-scope-error"
	| "not-found"
	| "foreign-key-conflict"
	| "unknown-error";

export type ServiceError = {
	readonly code: ServiceErrorCode;
	readonly message: string;
};

export type ServiceResult<T> =
	| { readonly ok: true; readonly data: T }
	| { readonly ok: false; readonly error: ServiceError };

export type ServiceQueryResponse<T> = {
	readonly data: T | null;
	readonly error: unknown;
};

export type ServiceQuery<T> =
	| Promise<ServiceQueryResponse<T>>
	| PromiseLike<ServiceQueryResponse<T>>;

const defaultErrorMessages: Record<ServiceErrorCode, string> = {
	"configuration-error": "Service configuration is unavailable.",
	"backend-error": "The service request could not be completed.",
	"validation-error": "The service request is invalid.",
	"property-scope-error": "A valid property scope is required.",
	"not-found": "The requested record was not found.",
	"foreign-key-conflict": "This record is referenced by other data and cannot be deleted.",
	"unknown-error": "An unexpected service error occurred.",
};

const serviceErrorCodes = new Set<ServiceErrorCode>(
	Object.keys(defaultErrorMessages) as ServiceErrorCode[],
);

export function serviceSuccess<T>(data: T): ServiceResult<T> {
	return { ok: true, data };
}

export function serviceFailure(
	code: ServiceErrorCode,
	message = defaultErrorMessages[code],
): ServiceResult<never> {
	return {
		ok: false,
		error: { code, message },
	};
}

export function normalizeServiceError(error: unknown): ServiceError {
	if (isServiceError(error)) {
		return {
			code: error.code,
			message: defaultErrorMessages[error.code],
		};
	}

	return {
		code: "unknown-error",
		message: defaultErrorMessages["unknown-error"],
	};
}

export async function executeServiceQuery<T>(
	query: ServiceQuery<T>,
	options: { readonly notFoundCode?: ServiceErrorCode } = {},
): Promise<ServiceResult<T>> {
	try {
		const { data, error } = await query;

		if (error) {
			return serviceFailure("backend-error");
		}

		if (data === null) {
			return serviceFailure(options.notFoundCode ?? "not-found");
		}

		return serviceSuccess(data);
	} catch {
		return serviceFailure("unknown-error");
	}
}

function isServiceError(error: unknown): error is ServiceError {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const candidate = error as { readonly code?: unknown };
	return (
		typeof candidate.code === "string" &&
		serviceErrorCodes.has(candidate.code as ServiceErrorCode)
	);
}
