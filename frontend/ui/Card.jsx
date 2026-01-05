function Card({ children }) {
	return (
		<div className="bg-gray-800 rounded p-6 shadow-md w-full max-w-md">
			{children}
		</div>
	);
}

export default Card;