function Button({
	children,
	onClick,
	disabled = false,
	variant = "primary",
}) {
	const base =
		"pxpx-4 py-2 px-5 mt-5 rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
	
	const variants = {
		primary: "bg-purple-600 hover:bg-purple-300 text-white",
		secondary: "bg-gray-700 hover:bg-gray-600 text-white",
		success: "bg-purple-500 hover:bg-yellow-400 text-white",
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			className={`${base} ${variants[variant]}`}
		>
			{children}
		</button>
	);
}

export default Button;