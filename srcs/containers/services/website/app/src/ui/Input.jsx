function Input({ value, variant = "main", onChange, maxLength, placeholder, type, onKeyDown }) {

	const base =
		"px-4 py-2 rounded bg-gray-800 text-white border border-purple-700 focus:outline-none focus:ring-2 focus:ring-pink-500";
	
	const variants = {
		main: "w-full max-w mb-2",
		oneline: "",
	}

	return (
		<input
			value={value}
			variant={variant}
			onChange={onChange}
			maxLength={maxLength}
			placeholder={placeholder}
			type={type}
			onKeyDown={onKeyDown}
			className={`${base} ${variants[variant]}`}
		/>
	);
}

export default Input;
