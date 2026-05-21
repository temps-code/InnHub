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
			"El starter por defecto fue reemplazado por una estructura propia de InnHub. La UI reutilizable y la base de routing ya están incorporadas; la integración backend queda intencionalmente fuera del alcance de este paso.",
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
	public: {
		home: {
			loginLink: "Ver placeholder de login",
			previewLink: "Abrir vista previa de la app",
		},
		login: {
			eyebrow: "Punto de entrada estructural",
			title: "Placeholder de login",
			description:
				"La autenticación y la validación de sesión se implementarán en el futuro slice de auth. Esta página solo reserva la ruta pública.",
			previewLink: "Previsualizar shell protegido",
		},
		notFound: {
			title: "Página no encontrada",
			description: "Esta ruta no forma parte de la base actual de InnHub.",
			homeLink: "Volver al inicio",
			previewLink: "Abrir vista previa de la app",
		},
	},
	shell: {
		sidebar: { ariaLabel: "Módulos de la aplicación" },
		workspace: { ariaLabel: "Espacio de trabajo: {{title}}" },
		topbar: {
			eyebrow: "Vista previa del layout protegido",
			fallbackTitle: "Espacio de trabajo",
			workspaceLabel:
				"Shell estructural solamente. Auth e integración backend quedan diferidas.",
		},
	},
	placeholders: {
		eyebrow: "Placeholder de módulo",
		note: "Placeholder solamente. Los workflows de features se implementarán en slices posteriores.",
	},
	routes: {
		protected: {
			dashboard: {
				label: "Dashboard",
				title: "Dashboard",
				description: "Aquí aparecerán futuras métricas operativas y alertas.",
			},
			properties: {
				label: "Propiedades",
				title: "Propiedades",
				description:
					"Aquí aparecerán el perfil de propiedad y la configuración operativa.",
			},
			users: {
				label: "Usuarios",
				title: "Usuarios",
				description:
					"Aquí aparecerá la gestión de personal y roles cuando se agregue auth.",
			},
			rooms: {
				label: "Habitaciones",
				title: "Habitaciones",
				description:
					"Aquí aparecerán el inventario de habitaciones y sus estados físicos.",
			},
			roomTypes: {
				label: "Tipos de habitación",
				title: "Tipos de habitación",
				description:
					"Aquí aparecerá la configuración de categorías de habitación y contexto de precios.",
			},
			guests: {
				label: "Huéspedes",
				title: "Huéspedes",
				description:
					"Aquí aparecerán los registros de huéspedes y datos de contacto.",
			},
			reservations: {
				label: "Reservas",
				title: "Reservas",
				description:
					"Aquí aparecerán el ciclo de vida de reservas y workflows de disponibilidad.",
			},
			housekeeping: {
				label: "Housekeeping",
				title: "Housekeeping",
				description: "Aquí aparecerán los workflows de tareas de limpieza.",
			},
			maintenance: {
				label: "Mantenimiento",
				title: "Mantenimiento",
				description:
					"Aquí aparecerán tickets de mantenimiento y contexto de habitaciones bloqueadas.",
			},
			billing: {
				label: "Facturación",
				title: "Facturación",
				description:
					"Aquí aparecerán facturas y seguimiento de pagos manuales.",
			},
			reports: {
				label: "Reportes",
				title: "Reportes",
				description:
					"Aquí aparecerán reportes de ocupación, ingresos y operación.",
			},
		},
	},
} as const satisfies AppTranslationResource;
