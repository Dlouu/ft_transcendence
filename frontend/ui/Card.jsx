function Card({ 
	children,
	center = false,
}) {
	return (
		<div
			className={`
				bg-gray-700
				rounded p-6
				shadow-md
				w-full max-w-md
				m-auto 
				${center ? "flex flex-col justify-center items-center" : ""}
			`}
		>
			{children}
		</div>
	);
}

export default Card;
