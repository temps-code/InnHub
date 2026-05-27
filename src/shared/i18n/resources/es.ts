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
			loginLink: "Iniciar sesión",
			previewLink: "Abrir vista previa de la app",
		},
		notFound: {
			title: "Página no encontrada",
			description: "Esta ruta no forma parte de la base actual de InnHub.",
			homeLink: "Volver al inicio",
			previewLink: "Abrir vista previa de la app",
		},
	},
	auth: {
		login: {
			eyebrow: "Acceso seguro",
			title: "Iniciar sesión en InnHub",
			description:
				"Usá tus credenciales de InnHub para acceder al espacio de tu propiedad.",
			emailLabel: "Correo electrónico",
			passwordLabel: "Contraseña",
			submit: "Iniciar sesión",
			submitting: "Iniciando sesión...",
			requiredError: "Ingresá tu correo y contraseña para iniciar sesión.",
			genericError: "Correo o contraseña inválidos.",
			demoSubmit: "Usar cuenta demo",
			demoUnavailable: "La cuenta demo no está configurada para este entorno.",
		},
		demoSelector: {
			title: "Cuentas demo",
			description: "Seleccioná un rol para iniciar sesión con credenciales demo",
			openButton: "Cuentas demo",
		},
		roles: {
			administrator: "Administrador/a",
			manager: "Gerente",
			receptionist: "Recepcionista",
			housekeeping: "Limpieza",
			maintenance: "Mantenimiento",
			administrator_desc: "Acceso completo a todos los módulos y configuraciones",
			manager_desc: "Reportes, operaciones y gestión de personal",
			receptionist_desc: "Operaciones diarias: reservas, check-in, facturación",
			housekeeping_desc: "Limpieza de habitaciones y gestión de estados",
			maintenance_desc: "Tickets de mantenimiento y reparaciones de habitaciones",
		},
		logout: "Cerrar sesión",
		states: {
			loading: "Validando sesión",
			invalidEyebrow: "Acceso bloqueado",
			invalidTitle: "El acceso de la cuenta requiere atención",
			invalidDescription:
				"Tu cuenta no está vinculada a un perfil activo de InnHub para una propiedad. Contactá a un administrador antes de continuar.",
		},
	},
	settings: {
		subNavAriaLabel: "Navegación de configuración",
	},
	shell: {
		sidebar: {
			ariaLabel: "Módulos de la aplicación",
			group: {
				operations: "Operaciones",
				reports: "Reportes",
				settings: "Configuración",
			},
		},
		workspace: { ariaLabel: "Espacio de trabajo: {{title}}" },
		topbar: {
			eyebrow: "Espacio de propiedad",
			fallbackTitle: "Espacio de trabajo",
			workspaceLabel: "Espacio autenticado de InnHub.",
		},
	},
	roomTypes: {
		list: {
			title: "Tipos de habitación",
			loading: "Cargando tipos de habitación...",
			empty: "No se encontraron tipos de habitación. Creá uno para empezar.",
			error: "No se pudieron cargar los tipos de habitación.",
		},
		fields: {
			name: "Nombre",
			description: "Descripción",
			capacity: "Capacidad",
			base_price: "Precio base",
		},
		create: {
			title: "Crear tipo de habitación",
			submit: "Crear",
		},
		edit: {
			title: "Editar tipo de habitación",
			submit: "Guardar cambios",
		},
		duplicateName: "Ya existe un tipo de habitación con ese nombre.",
	},
	properties: {
		profile: {
			eyebrow: "Perfil de propiedad",
			editButton: "Editar",
			cancelButton: "Cancelar",
			saveButton: "Guardar cambios",
			loading: "Cargando propiedad...",
			loadError: "No se pudo cargar el perfil de la propiedad.",
			notFound: "Propiedad no encontrada",
			updateError: "No se pudieron guardar los cambios. Intentá de nuevo.",
		},
		fields: {
			id: "ID de propiedad",
			slug: "Slug",
			name: "Nombre",
			business_type: "Tipo de negocio",
			timezone: "Zona horaria",
			currency: "Moneda",
			address: "Dirección",
			phone: "Teléfono",
			email: "Correo electrónico",
			created_at: "Creado",
			updated_at: "Actualizado",
		},
	},
	placeholders: {
		eyebrow: "Placeholder de módulo",
		note: "Placeholder solamente. Los workflows de features se implementarán en slices posteriores.",
	},
	profile: {
		title: "Mi Perfil",
		loading: "Cargando perfil...",
		loadError: "No se pudo cargar el perfil.",
		edit: "Editar Perfil",
		save: "Guardar Cambios",
		cancel: "Cancelar",
		saved: "Perfil actualizado correctamente",
		updateError: "No se pudieron guardar los cambios. Intentá de nuevo.",
		fields: {
			fullName: "Nombre Completo",
			email: "Correo Electrónico",
			role: "Rol",
			property: "Propiedad",
		},
	},
	preferences: {
		theme: {
			label: "Tema",
			toggleDark: "Cambiar al tema oscuro",
			toggleLight: "Cambiar al tema claro",
		},
		locale: {
			label: "Idioma",
			toggleEn: "Cambiar a inglés",
			toggleEs: "Cambiar a español",
		},
	},
	routes: {
		protected: {
			propertyProfile: {
				label: "Perfil de propiedad",
				title: "Perfil de propiedad",
				description:
					"Tu perfil de propiedad y configuración operativa aparecerán aquí.",
			},
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
			profile: {
				label: "Mi Perfil",
				title: "Mi Perfil",
				description:
					"Ver y administrar tu información personal",
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
