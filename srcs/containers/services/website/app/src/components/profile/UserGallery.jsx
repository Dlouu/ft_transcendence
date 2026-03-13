import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
					method: "GET",
					credentials: "include",
				});

				if (res.status === 404) {
					setCards([]);
					setLoadingCards(false);
					return;
				}

				if (!res.ok) {
					const text = await res.text();
					throw new Error(text || "Fetch failed");
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
			<h1 className="font-pixelmono mt-10 mb-2">PERSONAL CARDS</h1>
			{loadingCards && <p className="mt-10 text-center font-pixelm">Loading gallery...</p>}
			{!loadingCards && !cards.length && <p>No personal cards yet</p>}

			{!!cards.length && (
				<div className="grid sm:grid-cols-6 grid-cols-3 gap-4">
					{cards.map((card) => (
						<Link
							key={card.image_id}
							to={`/gallery/${card.image_id}`}
							state={{
								id: card.image_id,
								src: card.url,
								type: "user"
							}}
						>
							<img
								src={card.url}
								className="w-full rounded-lg shadow-md hover:scale-105 transition"
								alt={`card-${card.image_id}`}
							/>
						</Link>
					))}
				</div>
			)}
		</>
	);
}

export default UserGallery;