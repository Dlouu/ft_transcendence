function Input({ value, onChange, placeholder }) {
	return (
		<input
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			className="
				w-full max-w
				px-4 py-2
				rounded
				bg-gray-800 text-white
				border border-purple-700
				focus:outline-none
				focus:ring-2 focus:ring-red-500
			"
		/>
	);
}

export default Input;
