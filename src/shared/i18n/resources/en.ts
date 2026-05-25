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
		logout: "Log out",
		states: {
			loading: "Checking session",
			invalidEyebrow: "Access blocked",
			invalidTitle: "Account access needs attention",
			invalidDescription:
				"Your account is not linked to an active InnHub profile for a property. Contact an administrator before continuing.",
		},
	},
	shell: {
		sidebar: { ariaLabel: "Application modules" },
		workspace: { ariaLabel: "{{title}} workspace" },
		topbar: {
			eyebrow: "Property workspace",
			fallbackTitle: "App workspace",
			workspaceLabel: "Authenticated InnHub workspace.",
		},
	},
	placeholders: {
		eyebrow: "Module placeholder",
		note: "Placeholder only. Feature workflows will be implemented in later slices.",
	},
	routes: {
		protected: {
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
			rooms: {
				label: "Rooms",
				title: "Rooms",
				description:
					"Future room inventory and physical states will appear here.",
			},
			roomTypes: {
				label: "Room types",
				title: "Room types",
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
