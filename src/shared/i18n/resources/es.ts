import type { AppTranslationResource } from "./index";

export const es = {
	hero: {
		eyebrow: "MVP de gestión de alojamientos",
		title: "InnHub",
		description:
			"Una base para gestionar propiedades, habitaciones, huéspedes, reservas, operaciones, facturación y reportes en un solo espacio de trabajo hotelero.",
	},
	foundation: {
		eyebrow: "Estado de la base",
		title: "Listo para el primer incremento de implementación",
		description:
			"El starter por defecto fue reemplazado por una estructura propia de InnHub. La UI reutilizable, el routing y la integración backend quedan intencionalmente fuera del alcance de este paso.",
	},
	modules: {
		ariaLabel: "Módulos planificados de InnHub",
		items: {
			properties: "Propiedades",
			rooms: "Habitaciones",
			guests: "Huéspedes",
			reservations: "Reservas",
			operations: "Operaciones",
			billing: "Facturación",
			reports: "Reportes",
		},
	},
} as const satisfies AppTranslationResource;
