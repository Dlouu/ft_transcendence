function Card({ children, center = false, big = false }) {
	return (
		<div
			className={`
				bg-gray-700/70
				rounded 
				shadow-md
				w-full
				m-auto
				p-6
				${center ? "flex flex-col justify-center items-center" : ""}
				${big ? "max-w-2xl" : "max-w-md"}
			`}
		>
			{children}
		</div>
	);
}

export default Card;
