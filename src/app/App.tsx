const foundationModules = [
	"Properties",
	"Rooms",
	"Guests",
	"Reservations",
	"Operations",
	"Billing",
	"Reports",
];

export function App() {
	return (
		<main
			className="mx-auto w-[min(1120px,calc(100%_-_32px))] py-16 max-[760px]:w-[min(1120px,calc(100%_-_24px))] max-[760px]:py-8"
			aria-labelledby="app-title"
		>
			<section className="grid max-w-3xl gap-5 py-[72px] max-[760px]:py-12">
				<img
					className="h-[72px] w-[72px] rounded-[20px] shadow-[0_18px_48px_rgb(124_58_237_/_18%)]"
					src="/innhub-app-icon.svg"
					alt=""
					aria-hidden="true"
				/>
				<p className="m-0 text-[0.85rem] font-bold tracking-[0.16em] text-[var(--color-primary)] uppercase">
					Accommodation management MVP
				</p>
				<h1
					id="app-title"
					className="m-0 text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] font-bold tracking-[-0.08em] text-[var(--color-heading)]"
				>
					InnHub
				</h1>
				<p className="m-0 max-w-2xl text-[clamp(1.1rem,2vw,1.35rem)] text-[var(--color-muted)]">
					A foundation for managing properties, rooms, guests, reservations,
					operations, billing, and reporting in one hospitality workspace.
				</p>
			</section>

			<section
				className="grid grid-cols-[minmax(0,1fr)_minmax(280px,420px)] items-start gap-12 rounded-[28px] border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-[var(--shadow-panel)] max-[760px]:grid-cols-1 max-[760px]:gap-8 max-[760px]:p-6"
				aria-labelledby="foundation-title"
			>
				<div>
					<p className="m-0 text-[0.85rem] font-bold tracking-[0.16em] text-[var(--color-primary)] uppercase">
						Foundation status
					</p>
					<h2
						id="foundation-title"
						className="mt-2 mb-4 text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.05] font-bold tracking-[-0.04em] text-[var(--color-heading)]"
					>
						Ready for the first implementation slice
					</h2>
					<p className="m-0 text-[var(--color-muted)]">
						The default starter has been replaced with an InnHub-specific shell.
						Reusable UI, routing, and backend integration remain intentionally
						out of scope for this step.
					</p>
				</div>

				<ul
					className="m-0 grid list-none gap-3 p-0"
					aria-label="Planned InnHub modules"
				>
					{foundationModules.map((module) => (
						<li
							className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3.5 font-bold text-[var(--color-heading)]"
							key={module}
						>
							{module}
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
