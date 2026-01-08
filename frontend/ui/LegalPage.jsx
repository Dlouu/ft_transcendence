import Page from "./Page";

function LegalPage({ title, children }) {
	return (
		<Page>
				<div className="max-w-3xl mx-auto px-4 py-8">
				<h1 className="text-3xl font-bold mb-6">
					{title}
				</h1>

				<div className="space-y-4 text-gray-300 leading-relaxed">
					{children}
				</div>
			</div>
		</Page>
	);
}

export default LegalPage;