function Card({ children, center = false, big = false, plain = false }) {
	return (
		<div
			className={`
				rounded 
				shadow-md
				w-full
				m-auto
				p-6
				${plain ? "bg-gray-700/90 max-h-[80vh] overflow-y-auto relative" : ""}
				${center ? "flex flex-col justify-center items-center" : ""}
				${big ? "max-w-2xl" : "max-w-md"}
				bg-gray-700/70
			`}
		>
			{children}
		</div>
	);
}

export default Card;
