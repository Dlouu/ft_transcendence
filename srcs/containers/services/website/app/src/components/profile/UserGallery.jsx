import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function UserGallery({ userId, browseAll = false, title }) {
	const [cards, setCards] = useState([]);
	const [loadingCards, setLoadingCards] = useState(true);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		if (!browseAll && !userId) {
			setCards([]);
			setLoadingCards(false);
			return;
		}

		const fetchCards = async () => {
			try {
				const perPage = 50;
				let page = 1;
				let allCards = [];
				const cacheBuster = Date.now();

				while (true) {
					const endpoint = browseAll
						? `/api/user/get_card_images?page=${page}&per_page=${perPage}`
						: `/api/user/get_card_images/${userId}?page=${page}&per_page=${perPage}`;

					const res = await fetch(endpoint, {
						method: "GET",
						credentials: "include",
					});

					if (res.status === 404) {
						allCards = [];
						break;
					}

					if (!res.ok) {
						const text = await res.text();
						throw new Error(text || "Fetch failed");
					}

					const data = await res.json();
					const currentPageCards = data?.images_url || [];
					allCards = [...allCards, ...currentPageCards];

					if (currentPageCards.length < perPage) {
						break;
					}

					page += 1;
				}

				setCards(
					allCards.map((card) => ({
						...card,
						cache_url: `${card.url}${card.url.includes("?") ? "&" : "?"}v=${cacheBuster}`,
					}))
				);

			} catch (err) {
				// console.error(err);
				setCards([]);
			} finally {
				setLoadingCards(false);
			}
		};

		fetchCards();
	}, [userId, browseAll]);

	const galleryTitle = title || (browseAll ? "ALL GALLERY" : `MY GALLERY (${user?.username || ""})`);
	const emptyLabel = browseAll ? "No images available yet" : "No personal cards yet";

	return (
		<>
			<h1 className="font-pixelmono mt-10 mb-2">{galleryTitle}</h1>
			
			{ loadingCards && <p className="mt-10 text-center font-pixelm">Loading gallery...</p>}
			{ !loadingCards && !cards.length && <p>{emptyLabel}</p>}

			{ !!cards.length && (
				<div className="grid sm:grid-cols-6 grid-cols-3 gap-4">
					{cards.map((card) => {
						const ownerId = card.user_id;
						const isOwner = Number(ownerId) === Number(user?.user_id);

						return (
							<Link
								key={card.image_id}
								to={`/gallery/${card.image_id}`}
								state={{
									id: card.image_id,
									src: card.cache_url,
									type: isOwner ? "user" : "shared",
									ownerId,
								}}
							>
								<img
									src={card.cache_url}
									className="w-full rounded-lg shadow-md hover:scale-105 transition"
									alt={`card-${card.image_id}`}
								/>
							</Link>
						);
					})}
				</div>
			)}
		</>
	);
}

export default UserGallery;
