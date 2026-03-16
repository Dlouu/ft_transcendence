import { useState, useEffect } from "react";

function UserGallery({ userId }) {
	const [cards, setCards] = useState([]);
	const [loadingCards, setLoadingCards] = useState(true);

	useEffect(() => {
		if (!userId) {
			setCards([]);
			setLoadingCards(false);
			return;
		}

		const fetchCards = async () => {
			try {
				const res = await fetch(`/api/user/${userId}/get_card_images`, {
					credentials: "include",
				});
				if (!res.ok) {
					throw new Error(`Failed to fetch cards: ${res.status}`);
				}
				const data = await res.json();
				setCards(data?.images_url || []);
			} catch (err) {
				console.error(err);
				setCards([]);
			} finally {
				setLoadingCards(false);
			}
		};

		fetchCards();
	}, [userId]);

	return (
		<>
			{loadingCards && <p>Loading gallery...</p>}
			<h1 className="font-pixelmono mt-10">PERSONAL CARDS</h1>
			{!loadingCards && !cards.length && <p>No personal cards yet</p>}

			{!!cards.length && (
				<div className="grid grid-cols-3 gap-4">
					{cards.map((card) => (
						<img
							key={card.image_id}
							src={card.url}
							className="w-full rounded-lg shadow-md hover:scale-105 transition"
							alt={`card-${card.image_id}`}
						/>
					))}
				</div>
			)}
		</>
	);
}

export default UserGallery;