import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function UserGallery({ userId, browseAll = false, title }) {
	const [cards, setCards] = useState([]);
	const [loadingCards, setLoadingCards] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const { user } = useContext(AuthContext);

	useEffect(() => {
		if (!browseAll && !userId) {
			setCards([]);
			setLoadingCards(false);
			setCurrentPage(1);
			setTotalPages(1);
			return;
		}

		const fetchCards = async () => {
			try {
				const perPage = 12;
				const cacheBuster = Date.now();
				const endpoint = browseAll
					? `/api/user/get_card_images?page=${currentPage}&per_page=${perPage}`
					: `/api/user/get_card_images/${userId}?page=${currentPage}&per_page=${perPage}`;

				const res = await fetch(endpoint, {
					method: "GET",
					credentials: "include",
				});

				if (res.status === 404) {
					setCards([]);
					setCurrentPage(1);
					setTotalPages(1);
					return;
				}

				if (!res.ok) {
					const text = await res.text();
					throw new Error(text || "Fetch failed");
				}

				const data = await res.json();
				const currentPageCards = data?.images_url || [];
				const apiTotalPages = Number(data?.pages || 1);

				setTotalPages(Math.max(1, apiTotalPages));

				if (apiTotalPages > 0 && currentPage > apiTotalPages) {
					setCurrentPage(apiTotalPages);
					return;
				}

				setCards(
					currentPageCards.map((card) => ({
						...card,
						cache_url: `${card.url}${card.url.includes("?") ? "&" : "?"}v=${cacheBuster}`,
					}))
				);

			} catch (err) {
				// console.error(err);
				setCards([]);
				setTotalPages(1);
			} finally {
				setLoadingCards(false);
			}
		};

		setLoadingCards(true);
		fetchCards();
	}, [userId, browseAll, currentPage]);

	useEffect(() => {
		setCurrentPage(1);
	}, [userId, browseAll]);

	const galleryTitle = title || (browseAll ? "ALL GALLERY" : `MY GALLERY (${user?.username || ""})`);
	const emptyLabel = browseAll ? "No images available yet" : "No personal cards yet";

	return (
		<>
			<h1 className="font-pixelmono mt-10 mb-2">{galleryTitle}</h1>
			
			{ loadingCards && <p className="mt-10 text-center font-pixelm">Loading gallery...</p>}
			{ !loadingCards && !cards.length && <p>{emptyLabel}</p>}

			{ !!cards.length && (
				<div className="w-full min-w-0 overflow-x-hidden">
					<div className="grid sm:grid-cols-6 grid-cols-3 gap-4">
					{cards.map((card) => {
						const ownerId = card.user_id;
						const isOwner = Number(ownerId) === Number(user?.user_id);

						return (
							<Link
								key={card.image_id}
								to={`/gallery/${card.image_id}`}
								className="block overflow-hidden rounded-lg"
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

					{totalPages > 1 && (
						<div className="mt-6 flex items-center justify-center gap-3 font-pixelhb">
							<button
								type="button"
								onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
								disabled={currentPage <= 1 || loadingCards}
								className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
							>
								PREV
							</button>
							<span>
								PAGE {currentPage} / {totalPages}
							</span>
							<button
								type="button"
								onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
								disabled={currentPage >= totalPages || loadingCards}
								className="px-3 py-1 rounded bg-gray-700 disabled:opacity-40"
							>
								NEXT
							</button>
						</div>
					)}
				</div>
			)}
		</>
	);
}

export default UserGallery;
