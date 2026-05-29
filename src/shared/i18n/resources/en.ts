export const en = {
	hero: {
		eyebrow: "Accommodation management MVP",
		title: "InnHub",
		description:
			"A foundation for managing properties, rooms, guests, reservations, operations, billing, and reporting in one hospitality workspace.",
	},
	foundation: {
		eyebrow: "Foundation status",
		title: "Ready for the first implementation slice",
		description:
			"The default starter has been replaced with an InnHub-specific shell. Reusable UI and routing foundations are now in place; backend integration remains intentionally out of scope for this step.",
	},
	modules: {
		ariaLabel: "Planned InnHub modules",
		items: {
			properties: "Properties",
			rooms: "Rooms",
			guests: "Guests",
			reservations: "Reservations",
			operations: "Operations",
			billing: "Billing",
			reports: "Reports",
		},
	},
	public: {
		home: {
			loginLink: "Sign in",
			previewLink: "Open app preview",
		},
		notFound: {
			title: "Page not found",
			description: "This route is not part of the current InnHub foundation.",
			homeLink: "Back to home",
			previewLink: "Open app preview",
		},
	},
	auth: {
		login: {
			eyebrow: "Secure access",
			title: "Sign in to InnHub",
			description:
				"Use your InnHub credentials to access your property workspace.",
			emailLabel: "Email address",
			passwordLabel: "Password",
			submit: "Sign in",
			submitting: "Signing in...",
			requiredError: "Enter your email and password to sign in.",
			genericError: "Invalid email or password.",
			demoSubmit: "Use demo account",
			demoUnavailable: "Demo account is not configured for this environment.",
		},
		demoSelector: {
			title: "Demo accounts",
			description: "Select a role to log in with demo credentials",
			openButton: "Demo accounts",
		},
		roles: {
			administrator: "Administrator",
			manager: "Manager",
			receptionist: "Receptionist",
			housekeeping: "Housekeeping",
			maintenance: "Maintenance",
			administrator_desc: "Full access to all modules and settings",
			manager_desc: "Reports, operations, and staff management",
			receptionist_desc: "Daily operations: reservations, check-in, billing",
			housekeeping_desc: "Room cleaning and status management",
			maintenance_desc: "Maintenance tickets and room repairs",
		},
		logout: "Log out",
		states: {
			loading: "Checking session",
			invalidEyebrow: "Access blocked",
			invalidTitle: "Account access needs attention",
			invalidDescription:
				"Your account is not linked to an active InnHub profile for a property. Contact an administrator before continuing.",
		},
	},
	settings: {
		subNavAriaLabel: "Settings navigation",
	},
	shell: {
		sidebar: {
			ariaLabel: "Application modules",
			group: {
				operations: "Operations",
				reports: "Reports",
				settings: "Settings",
			},
		},
		workspace: { ariaLabel: "{{title}} workspace" },
		topbar: {
			eyebrow: "Property workspace",
			fallbackTitle: "App workspace",
			workspaceLabel: "Authenticated InnHub workspace.",
		},
	},
	roomTypes: {
		list: {
			title: "Room Types",
			loading: "Loading room types...",
			empty: "No room types found. Create one to get started.",
			error: "Unable to load room types.",
		},
		fields: {
			name: "Name",
			description: "Description",
			capacity: "Capacity",
			base_price: "Base Price",
			deletedAt: "Deleted At",
		},
		create: {
			title: "Create Room Type",
			submit: "Create",
		},
		edit: {
			title: "Edit Room Type",
			submit: "Save Changes",
		},
		duplicateName: "A room type with this name already exists.",
		delete: "Delete",
		deleteConfirmTitle: "Delete Room Type",
		deleteConfirmMessage: "This will deactivate the room type. It will no longer appear in the list.",
		deleteConfirmAccept: "Delete",
		deleteConfirmCancel: "Cancel",
		deletePermissionError: "You don't have permission to delete room types.",
		permissionError: "You don't have permission to perform this action.",
		deleteGenericError: "Could not delete the room type. Please try again.",
		archive: {
			toggle: "View Recycle Bin",
			toggleActive: "View Active",
			title: "Archived Room Types",
			empty: "No archived room types.",
			restore: "Restore",
			restoreConfirmTitle: "Restore Room Type",
			restoreConfirmMessage: "Restore this room type? It will reappear in the active list.",
			restoreSuccess: "Room type restored successfully.",
			restoreDuplicateName: "Cannot restore: a room type with this name already exists.",
			restoreGenericError: "Could not restore the room type. Please try again.",
			purge: "Purge",
			purgeConfirmTitle: "Permanently Delete Room Type",
			purgeConfirmMessage: "This action is irreversible. The room type will be permanently deleted.",
			purgeSuccess: "Room type permanently deleted.",
			purgeForeignKeyConflict: "Cannot delete: this room type is referenced by existing rooms or reservations.",
			purgeGenericError: "Could not delete the room type. Please try again.",
		},
	},
	rooms: {
		list: {
			title: "Rooms",
			loading: "Loading rooms...",
			empty: "No rooms found. Create one to get started.",
			error: "Unable to load rooms.",
		},
		fields: {
			identifier: "Identifier",
			room_type: "Room Type",
			floor: "Floor",
			state: "State",
			description: "Description",
		},
		states: {
			available: "Available",
			occupied: "Occupied",
			cleaning: "Cleaning",
			maintenance: "Maintenance",
			inactive: "Inactive",
		},
		filters: {
			allStatuses: "All Statuses",
			allTypes: "All Types",
			searchPlaceholder: "Search by identifier or description...",
		},
		create: {
			title: "Create Room",
			submit: "Create",
		},
		edit: {
			title: "Edit Room",
			submit: "Save Changes",
		},
		duplicateIdentifier: "A room with this identifier already exists.",
		delete: "Delete",
		deleteConfirmTitle: "Delete Room",
		deleteConfirmMessage: "This will deactivate the room. It will no longer appear in the list.",
		deleteConfirmAccept: "Delete",
		deleteConfirmCancel: "Cancel",
		deletePermissionError: "You don't have permission to delete rooms.",
		deleteGenericError: "Could not delete the room. Please try again.",
		reservationConflict: "Cannot delete room with active reservations.",
		permissionError: "You don't have permission to perform this action.",
	},
	properties: {
		profile: {
			eyebrow: "Property Profile",
			editButton: "Edit",
			cancelButton: "Cancel",
			saveButton: "Save changes",
			loading: "Loading property...",
			loadError: "Unable to load property profile.",
			notFound: "Property not found",
			updateError: "Could not save changes. Please try again.",
		},
		fields: {
			id: "Property ID",
			slug: "Slug",
			name: "Name",
			business_type: "Business type",
			timezone: "Timezone",
			currency: "Currency",
			address: "Address",
			phone: "Phone",
			email: "Email",
			created_at: "Created",
			updated_at: "Updated",
		},
	},
	placeholders: {
		eyebrow: "Module placeholder",
		note: "Placeholder only. Feature workflows will be implemented in later slices.",
	},
	profile: {
		title: "My Profile",
		loading: "Loading profile...",
		loadError: "Unable to load profile.",
		edit: "Edit Profile",
		save: "Save Changes",
		cancel: "Cancel",
		saved: "Profile updated successfully",
		updateError: "Could not save changes. Please try again.",
		fields: {
			fullName: "Full Name",
			email: "Email",
			role: "Role",
			property: "Property",
		},
	},
	preferences: {
		theme: {
			label: "Theme",
			toggleDark: "Switch to dark theme",
			toggleLight: "Switch to light theme",
		},
		locale: {
			label: "Language",
			toggleEn: "Switch to English",
			toggleEs: "Switch to Spanish",
		},
	},
	routes: {
		protected: {
			propertyProfile: {
				label: "Property Profile",
				title: "Property Profile",
				description:
					"Your property profile and operational settings will appear here.",
			},
			dashboard: {
				label: "Dashboard",
				title: "Dashboard",
				description: "Future operational metrics and alerts will appear here.",
			},
			properties: {
				label: "Properties",
				title: "Properties",
				description:
					"Future property profile and operational settings will appear here.",
			},
			users: {
				label: "Users",
				title: "Users",
				description:
					"Future staff and role management will appear here after auth is added.",
			},
			profile: {
				label: "My Profile",
				title: "My Profile",
				description:
					"View and manage your personal information",
			},
			rooms: {
				label: "Rooms",
				title: "Rooms",
				description:
					"Future room inventory and physical states will appear here.",
			},
			roomTypes: {
				label: "Room types",
				title: "Room Types",
				description:
					"Future room category setup and pricing context will appear here.",
			},
			guests: {
				label: "Guests",
				title: "Guests",
				description:
					"Future guest records and contact details will appear here.",
			},
			reservations: {
				label: "Reservations",
				title: "Reservations",
				description:
					"Future reservation lifecycle and availability workflows will appear here.",
			},
			housekeeping: {
				label: "Housekeeping",
				title: "Housekeeping",
				description: "Future cleaning task workflows will appear here.",
			},
			maintenance: {
				label: "Maintenance",
				title: "Maintenance",
				description:
					"Future maintenance tickets and blocked-room context will appear here.",
			},
			billing: {
				label: "Billing",
				title: "Billing",
				description:
					"Future invoices and manual payment tracking will appear here.",
			},
			reports: {
				label: "Reports",
				title: "Reports",
				description:
					"Future occupancy, revenue, and operational reports will appear here.",
			},
		},
	},
} as const;
