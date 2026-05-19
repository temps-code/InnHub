import "./App.css";

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
		<main className="app-shell" aria-labelledby="app-title">
			<section className="hero-section">
				<img
					className="brand-mark"
					src="/favicon.svg"
					alt=""
					aria-hidden="true"
				/>
				<p className="eyebrow">Accommodation management MVP</p>
				<h1 id="app-title">InnHub</h1>
				<p className="hero-copy">
					A foundation for managing properties, rooms, guests, reservations,
					operations, billing, and reporting in one hospitality workspace.
				</p>
			</section>

			<section className="foundation-panel" aria-labelledby="foundation-title">
				<div>
					<p className="eyebrow">Foundation status</p>
					<h2 id="foundation-title">
						Ready for the first implementation slice
					</h2>
					<p>
						The default starter has been replaced with an InnHub-specific shell.
						Reusable UI, routing, and backend integration remain intentionally
						out of scope for this step.
					</p>
				</div>

				<ul className="module-list" aria-label="Planned InnHub modules">
					{foundationModules.map((module) => (
						<li key={module}>{module}</li>
					))}
				</ul>
			</section>
		</main>
	);
}
