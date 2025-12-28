export async function sendInput(action) {
	const res = await fetch("/api/input", {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify(action),
	});

	return res.json();
}
