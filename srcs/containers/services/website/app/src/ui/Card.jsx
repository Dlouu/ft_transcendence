function Card({ children, center = false, big = false, paint = false }) {
	return (
		<div
			className={`
				bg-gray-700/70
				rounded 
				shadow-md
				w-full
				m-auto 
				${center ? "flex flex-col justify-center items-center" : ""}
				${paint ? "sm:max-w-xl-[20px] max-none p-1" : "p-6"}
				${big ? "max-w-2xl" : "max-w-md"}
			`}
		>
			{children}
		</div>
	);
}

export default Card;
