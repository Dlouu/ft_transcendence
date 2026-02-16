function Card({ children, center = false, big = false }) {
	return (
		<div
			className={`
				bg-gray-700/70
				rounded p-6
				shadow-md
				w-full
				m-auto 
				${center ? "flex flex-col justify-center items-center" : ""}
				${big ? "max-w-2xl" : "max-w-md"}
			`}
		>
			{children}
		</div>
	);
}

export default Card;
