import type { AppTranslationResource } from "./index";

export const es = {
	hero: {
		eyebrow: "MVP de gestión de alojamientos",
		title: "Gestioná tu negocio de hospedaje con claridad",
		description:
			"InnHub centraliza habitaciones, reservas, huéspedes, limpieza, mantenimiento, facturación y reportes en un solo espacio operativo.",
	},
	modules: {
		ariaLabel: "Módulos planificados de InnHub",
		items: {
			properties: "Propiedades",
			rooms: "Habitaciones",
			guests: "Huéspedes",
			reservations: "Reservas",
			operations: "Operaciones",
			housekeeping: "Limpieza",
			maintenance: "Mantenimiento",
			billing: "Facturación",
			reports: "Reportes",
		},
	},
	public: {
		home: {
			loginLink: "Abrir demo",
			previewLink: "Ver módulos",
			nav: {
				ariaLabel: "Navegación pública",
				product: "Producto",
				modules: "Módulos",
				demo: "Demo",
			},
			preview: {
				title: "Vista previa del dashboard",
				subtitle: "Resumen operativo",
				sidebarAria: "Módulos de la barra lateral de la vista previa",
				statsAria: "Métricas principales de vista previa",
				opsAria: "Métricas operativas de vista previa",
				sidebar: {
					dashboard: "Dashboard",
					rooms: "Habitaciones",
					reservations: "Reservas",
					guests: "Huéspedes",
					housekeeping: "Limpieza",
					maintenance: "Mantenimiento",
					billing: "Facturación",
					reports: "Reportes",
				},
				stats: {
					rooms: "Habitaciones",
					roomsSub: "Habitaciones totales",
					reservations: "Reservas",
					reservationsSub: "Hoy",
					guests: "Huéspedes",
					guestsSub: "Alojados",
				},
				ops: {
					housekeeping: "Limpieza",
					housekeepingSub: "Por limpiar",
					maintenance: "Mantenimiento",
					maintenanceSub: "Tareas abiertas",
					billing: "Facturación",
					billingSub: "Facturas pendientes",
					reports: "Reportes",
					reportsSub: "Reportes disponibles",
				},
			},
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
		loginShowcase: {
			headlinePrimary: "Claridad operativa.",
			headlineAccent: "Mejores resultados.",
			description:
				"InnHub centraliza operaciones internas para que tu equipo se enfoque en lo que más importa.",
			coreModules: "Módulos clave",
			operationsOverview: "Resumen operativo",
			today: "Hoy",
			deltaLabel: "vs ayer",
			modules: {
				rooms: "Habitaciones",
				reservations: "Reservas",
				guests: "Huéspedes",
				billing: "Facturación",
			},
			stats: {
				occupancy: "Ocupación",
				reservations: "Reservas",
				housekeeping: "Limpieza",
				outOfOrder: "Fuera de servicio",
			},
		},
		demoSelector: {
			title: "Cuentas demo",
			description:
				"Elegí una propiedad demo y un rol. El perfil autenticado determina el alcance real de la propiedad.",
			openButton: "Cuentas demo",
			propertyLabel: "Elegí propiedad demo",
			roleLabel: "Elegí rol",
			properties: {
				hotelTarija: "Hotel Tarija",
				hostalLosChapacos: "Hostal Los Chapacos",
			},
		},
		roles: {
			administrator: "Administrador/a",
			manager: "Gerente",
			receptionist: "Recepcionista",
			housekeeping: "Limpieza",
			maintenance: "Mantenimiento",
			administrator_desc:
				"Acceso completo a todos los módulos y configuraciones",
			manager_desc: "Reportes, operaciones y gestión de personal",
			receptionist_desc: "Operaciones diarias: reservas, check-in, facturación",
			housekeeping_desc: "Limpieza de habitaciones y gestión de estados",
			maintenance_desc:
				"Tickets de mantenimiento y reparaciones de habitaciones",
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
			property: {
				ariaLabel: "Contexto de la propiedad actual",
				name: "InnHub Hotel",
				location: "Downtown",
			},
		},
		workspace: { ariaLabel: "Espacio de trabajo: {{title}}" },
		topbar: {
			eyebrow: "Espacio de propiedad",
			fallbackTitle: "Espacio de trabajo",
			workspaceLabel: "Espacio autenticado de InnHub.",
			dateLabel: "15 de mayo de 2024",
			notificationsLabel: "Notificaciones",
			avatarAriaLabel: "Usuario actual",
			propertyAriaLabel: "Propiedad actual",
			propertyLabel: "InnHub Hotel",
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
			deletedAt: "Eliminado el",
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
		delete: "Eliminar",
		deleteConfirmTitle: "Eliminar tipo de habitación",
		deleteConfirmMessage:
			"Esto desactivará el tipo de habitación. Ya no aparecerá en la lista.",
		deleteConfirmAccept: "Eliminar",
		deleteConfirmCancel: "Cancelar",
		deletePermissionError:
			"No tenés permiso para eliminar tipos de habitación.",
		permissionError: "No tenés permiso para realizar esta acción.",
		deleteGenericError:
			"No se pudo eliminar el tipo de habitación. Intentá de nuevo.",
		archive: {
			toggle: "Ver papelera",
			toggleActive: "Ver activos",
			title: "Tipos de habitación archivados",
			empty: "No hay tipos de habitación archivados.",
			restore: "Restaurar",
			restoreConfirmTitle: "Restaurar tipo de habitación",
			restoreConfirmMessage:
				"¿Restaurar este tipo de habitación? Volverá a aparecer en la lista activa.",
			restoreSuccess: "Tipo de habitación restaurado correctamente.",
			restoreDuplicateName:
				"No se puede restaurar: ya existe un tipo de habitación con ese nombre.",
			restoreGenericError:
				"No se pudo restaurar el tipo de habitación. Intentá de nuevo.",
			purge: "Eliminar permanentemente",
			purgeConfirmTitle: "Eliminar tipo de habitación permanentemente",
			purgeConfirmMessage:
				"Esta acción es irreversible. El tipo de habitación se eliminará permanentemente.",
			purgeSuccess: "Tipo de habitación eliminado permanentemente.",
			purgeForeignKeyConflict:
				"No se puede eliminar: este tipo de habitación está referenciado por habitaciones o reservaciones existentes.",
			purgeGenericError:
				"No se pudo eliminar el tipo de habitación. Intentá de nuevo.",
		},
	},
	rooms: {
		list: {
			title: "Habitaciones",
			loading: "Cargando habitaciones...",
			empty: "No se encontraron habitaciones. Creá una para empezar.",
			error: "No se pudieron cargar las habitaciones.",
		},
		fields: {
			identifier: "Identificador",
			room_type: "Tipo de habitación",
			floor: "Piso",
			state: "Estado",
			description: "Descripción",
		},
		states: {
			available: "Disponible",
			occupied: "Ocupada",
			cleaning: "Limpieza",
			maintenance: "Mantenimiento",
			inactive: "Inactiva",
		},
		filters: {
			allStatuses: "Todos los estados",
			allTypes: "Todos los tipos",
			searchPlaceholder: "Buscar por identificador o descripción...",
		},
		create: {
			title: "Crear habitación",
			submit: "Crear",
		},
		edit: {
			title: "Editar habitación",
			submit: "Guardar cambios",
		},
		duplicateIdentifier: "Ya existe una habitación con ese identificador.",
		delete: "Eliminar",
		deleteConfirmTitle: "Eliminar habitación",
		deleteConfirmMessage:
			"Esto desactivará la habitación. Ya no aparecerá en la lista.",
		deleteConfirmAccept: "Eliminar",
		deleteConfirmCancel: "Cancelar",
		deletePermissionError: "No tenés permiso para eliminar habitaciones.",
		deleteGenericError: "No se pudo eliminar la habitación. Intentá de nuevo.",
		reservationConflict:
			"No se puede eliminar la habitación con reservaciones activas.",
		permissionError: "No tenés permiso para realizar esta acción.",
		archive: {
			title: "Papelera",
			toggle: "Ver Papelera",
			toggleActive: "Ver Activos",
			empty: "No hay habitaciones archivadas.",
			restore: "Restaurar",
			restoreConfirmTitle: "Restaurar Habitación",
			restoreConfirmMessage: "Esto restaurará la habitación a la lista activa.",
			restoreGenericError:
				"No se pudo restaurar la habitación. Intente de nuevo.",
			restoreDuplicateIdentifier:
				"No se puede restaurar: ya existe otra habitación activa con este identificador.",
			purge: "Eliminar Permanentemente",
			purgeConfirmTitle: "Eliminar Habitación Permanentemente",
			purgeConfirmMessage:
				"Esta acción no se puede deshacer. La habitación será eliminada permanentemente.",
			purgeForeignKeyConflict:
				"Esta habitación no puede eliminarse porque tiene registros de reservas asociados.",
			purgeGenericError: "No se pudo eliminar la habitación. Intente de nuevo.",
		},
		deletedAt: "Eliminada",
	},
	guests: {
		list: {
			title: "Huéspedes",
			description: "Gestioná perfiles e historial de huéspedes.",
			loading: "Cargando huéspedes...",
			empty: "No se encontraron huéspedes.",
			noResults:
				"No hay huéspedes que coincidan con la búsqueda o los filtros actuales.",
			error: "No se pudieron cargar los huéspedes.",
			tableAriaLabel: "Tabla de huéspedes",
		},
		fields: {
			firstName: "Nombre",
			lastName: "Apellido",
			fullName: "Huésped",
			documentType: "Tipo de documento",
			documentNumber: "Documento",
			document: "Documento",
			email: "Email",
			phone: "Teléfono",
			notes: "Notas",
			status: "Estado",
			deletedAt: "Eliminado el",
		},
		metrics: {
			totalGuests: "Total huéspedes",
			returningGuests: "Huéspedes que regresan",
			activeStays: "Estancias activas",
			pendingInvoices: "Facturas pendientes",
		},
		filters: {
			searchLabel: "Buscar huéspedes",
			searchPlaceholder: "Buscar huéspedes",
			activityLabel: "Actividad",
			allActivity: "Todos",
			withOpenReservations: "Con reservas abiertas",
			withoutOpenReservations: "Sin reservas abiertas",
		},
		status: {
			active: "Activo",
			archived: "Archivado",
		},
		create: {
			title: "Agregar huésped",
			submit: "Crear huésped",
		},
		edit: {
			title: "Editar",
			submit: "Guardar cambios",
		},
		profile: {
			title: "Perfil del huésped",
			empty: "Seleccioná un huésped para ver sus detalles.",
			noNotes: "Sin notas",
		},
		delete: "Eliminar",
		deleteConfirmTitle: "Eliminar huésped",
		deleteConfirmMessage: "Esta acción moverá el huésped a la papelera.",
		deleteConfirmAccept: "Eliminar",
		deleteConfirmCancel: "Cancelar",
		deletePermissionError: "No tenés permiso para eliminar huéspedes.",
		deleteGenericError: "No se pudo eliminar el huésped. Intentá de nuevo.",
		reservationConflict:
			"No se puede eliminar un huésped con reservas activas o futuras.",
		permissionError: "No tenés permiso para realizar esta acción.",
		saveGenericError: "No se pudieron guardar los cambios del huésped.",
		archive: {
			toggle: "Ver papelera",
			toggleActive: "Ver Huéspedes Activos",
			empty: "No hay huéspedes en papelera.",
			restore: "Restaurar",
			restoreConfirmTitle: "Restaurar huésped",
			restoreConfirmMessage:
				"Este huésped volverá a la lista de huéspedes activos.",
			restoreGenericError: "No se pudo restaurar el huésped. Intentá de nuevo.",
			purge: "Purgar",
			purgeConfirmTitle: "Eliminar huésped permanentemente",
			purgeConfirmMessage:
				"Esta acción es irreversible y puede afectar referencias históricas.",
			purgeConfirmAccept: "Confirmar purga",
			strictConfirmLabel: "Frase de confirmación",
			strictConfirmPrompt: "Escribí {{phrase}} para continuar.",
			purgeForeignKeyConflict:
				"No se puede purgar el huésped porque existen {{count}} referencia(s) de reservas.",
			purgeGenericError: "No se pudo purgar el huésped. Intentá de nuevo.",
		},
		pagination: {
			previous: "Anterior",
			next: "Siguiente",
			previousAria: "Página anterior",
			nextAria: "Página siguiente",
			range: "Mostrando {{start}}-{{end}} de {{total}}",
			page: "Página {{page}} de {{pageCount}}",
		},
	},
	reservations: {
		list: {
			title: "Reservas",
			subtitle: "Gestioná las reservas y sus estados.",
			loading: "Cargando reservas...",
			empty: "No se encontraron reservas.",
			noResults: "No hay reservas para los filtros actuales.",
			error: "No se pudieron cargar las reservas.",
			tableAria: "Tabla de reservas",
		},
		table: {
			id: "Reserva",
			guest: "Huésped principal",
			checkIn: "Check-in",
			checkOut: "Check-out",
			roomSummary: "Resumen de habitación",
			unknownGuest: "Huésped desconocido",
			noRoomSummary: "Sin resumen de habitación",
			status: "Estado",
			actions: "Acciones",
		},
		filters: {
			searchLabel: "Buscar reservas por nombre del huésped o referencia",
			searchPlaceholder:
				"Buscar por nombre del huésped o referencia de reserva",
			statusLabel: "Estado de reserva",
			statusAll: "Todos los estados",
			statusChipAll: "Todas",
			statusChipConfirmed: "Confirmadas",
			statusChipPending: "Pendientes",
			statusChipCheckedIn: "Con check-in",
			statusChipCancelled: "Canceladas",
			statusChipNoShow: "No-show",
			checkInFrom: "Check-in desde",
			checkInTo: "Check-in hasta",
			checkOutFrom: "Check-out desde",
			checkOutTo: "Check-out hasta",
			roomLabel: "Habitación",
			roomAll: "Todas las habitaciones",
			guestLabel: "Huésped",
			guestAll: "Todos los huéspedes",
		},
		status: {
			pending: "pendiente",
			confirmed: "confirmada",
			checkedIn: "check-in",
			cancelled: "cancelada",
			noShow: "no-show",
			unknown: "desconocido",
		},
		metrics: {
			aria: "Resumen de métricas de reservas",
			visible: "Reservas visibles",
			visibleActiveHelper:
				"Cuenta solo las filas activas cargadas actualmente.",
			visibleArchivedHelper:
				"Cuenta solo las filas archivadas cargadas actualmente.",
			pending: "Pendientes",
			pendingHelper:
				"Estado pendiente dentro de las filas cargadas actualmente.",
			arrivalsToday: "Llegadas hoy",
			departuresToday: "Salidas hoy",
			todayBasedOnVisible:
				"Basado en fechas de check-in/check-out de las filas visibles.",
		},
		sections: {
			overview: "Resumen operativo",
			statusViews: "Vistas por estado",
			statusViewsHelper:
				"Saltá entre estados de reserva sin perder los filtros completos de abajo.",
			filters: "Filtros",
			filtersHelper:
				"Refiná las reservas visibles por fechas, huésped, habitación y estado.",
			list: "Lista de reservas",
			listCount: "Mostrando {{count}} reservas cargadas",
		},
		create: {
			title: "Crear reserva",
			submit: "Crear reserva",
		},
		edit: {
			title: "Editar reserva",
			submit: "Guardar cambios",
		},
		form: {
			primaryGuest: "Huésped principal",
			itemsTitle: "Ítems de reserva",
			itemLabel: "Ítem {{index}}",
			addItem: "Agregar ítem",
			removeItem: "Quitar ítem",
			guestSearch: "Buscar huésped",
			guestSearchPlaceholder: "Buscar por nombre del huésped",
			selectGuestPlaceholder: "Seleccioná un huésped",
			quickCreateGuestOpen: "Registrar huésped",
			quickCreateGuestCancel: "Cancelar registro de huésped",
			quickCreateGuestSubmit: "Crear huésped",
			quickGuestFirstName: "Nombre del huésped",
			quickGuestLastName: "Apellido del huésped",
			quickGuestDocumentType: "Tipo de documento",
			quickGuestDocumentNumber: "Número de documento",
			quickCreateGuestError:
				"No se pudo crear el huésped. Revisá los campos obligatorios.",
			selectorLoadError:
				"No se pudieron cargar las opciones. Intentá de nuevo.",
			checkIn: "Fecha check-in",
			checkOut: "Fecha check-out",
			roomType: "Tipo de habitación",
			selectRoomTypePlaceholder: "Seleccioná tipo de habitación",
			roomId: "Habitación (opcional)",
			noRoomAssigned: "Sin habitación asignada",
			guestCount: "Cantidad de huéspedes",
			cancel: "Cancelar",
			itemsRequired: "Se requiere al menos un ítem de reserva.",
			duplicateAssignedRoom:
				"Cada habitación asignada solo puede aparecer una vez por reserva.",
			validationError:
				"Revisá los campos obligatorios y las fechas antes de guardar.",
			genericError:
				"No se pudieron guardar los cambios de la reserva. Intentá de nuevo.",
		},
		actions: {
			edit: "Editar",
			editAria: "Editar reserva {{id}}",
			cancelAria: "Cancelar reserva {{id}}",
		},
		cancel: {
			title: "Cancelar reserva",
			message: "Esta acción cambiará el estado de la reserva a cancelada.",
			confirm: "Confirmar cancelación",
			dismiss: "Volver",
			validationError: "No se puede cancelar esta reserva en su estado actual.",
			genericError: "No se pudo cancelar la reserva. Intentá de nuevo.",
		},
		archive: {
			toggle: "Ver papelera",
			toggleActive: "Ver reservas activas",
			empty: "No hay reservas archivadas.",
			remove: "Archivar",
			removeAria: "Archivar reserva {{id}}",
			removeConfirmTitle: "Archivar reserva",
			removeConfirmMessage:
				"Esta reserva se moverá a la papelera y dejará de verse en la lista activa.",
			removeGenericError: "No se pudo archivar la reserva. Intentá de nuevo.",
			restore: "Restaurar",
			restoreConfirmTitle: "Restaurar reserva",
			restoreConfirmMessage:
				"Esta reserva volverá a la lista de reservas activas.",
			restoreGenericError: "No se pudo restaurar la reserva. Intentá de nuevo.",
			purge: "Purgar permanentemente",
			purgeAria: "Purgar permanentemente la reserva {{id}}",
			purgeConfirmTitle: "Eliminar reserva permanentemente",
			purgeConfirmMessage:
				"Esta acción es irreversible y eliminará la reserva de forma permanente.",
			strictPhrase: "PURGE",
			strictConfirmLabel: "Frase de confirmación",
			strictConfirmPrompt: "Escribí {{phrase}} para continuar.",
			purgeForeignKeyConflict:
				"No se puede purgar la reserva porque hay {{invoiceCount}} factura(s) y {{paymentCount}} pago(s) vinculados.",
			purgeGenericError: "No se pudo purgar la reserva. Intentá de nuevo.",
		},
		pagination: {
			previous: "Anterior",
			next: "Siguiente",
			previousAria: "Página anterior",
			nextAria: "Página siguiente",
		},
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
				description: "Ver y administrar tu información personal",
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
