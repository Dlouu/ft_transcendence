function Button({ children, onClick, type, disabled = false, variant = "primary", isActive = false }) {
	const base = "rounded font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed py-2";

	const variants = {
		primary:	`${base} px-5 mt-5 bg-purple-600 hover:bg-purple-300 text-white`,
		secondary:	`${base} px-5 mt-5 bg-gray-600 hover:bg-gray-600 text-white`,
		red:		`${base} px-5 mt-5 bg-gray-600 hover:bg-red-600 text-white`,
		success:	`${base} px-5 mt-5 bg-purple-500 hover:bg-yellow-400 text-white`,
		login:		`${base} px-5 bg-gray-500 hover:bg-yellow-400 text-white`,
		fullscreen:	`${base} px-5 mt-2 bg-gray-700 hover:bg-pink-400`,
		icon:		`w-9 h-9 font-icon transition rounded ${
			isActive
				? "bg-white text-black"
				: "bg-gray-700 hover:bg-gray-600"
		}`,
		iconDisabled: `w-9 h-9 font-icon transition rounded bg-gray-700`,
		iconEdit: `sm:w-10 sm:h-10 w-8 h-8 font-icon transition rounded`
	};

	return (
		<button
			onClick={onClick}
			disabled={disabled}
			type={type}
			className={`${variants[variant]}`}
		>
			{children}
		</button>
	);
}

export default Button;
