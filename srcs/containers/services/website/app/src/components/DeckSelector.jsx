function DeckSelector({ deck, setDeck }) {
	return (
		<div className="flex flex-row gap-4">Select Theme
			<label>
				<input
					type="radio"
					checked={deck === "basic"}
					onChange={() => setDeck("basic")}
				/>
				Basic
			</label>

			<label>
				<input
					type="radio"
					checked={deck === "uwu"}
					onChange={() => setDeck("uwu")}
				/>
				UwU
			</label>
		</div>
	);
}

export default DeckSelector;