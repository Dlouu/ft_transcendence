function Tooltip({ message, children }) {
	return (
	<div class="group relative flex">
		{children}
		<span class={`
			"absolute top-8 z-99 scale-0
			transition-all rounded
			bg-gray-500 p-1
			text-xs text-white
			group-hover:scale-100 
		`}>
			{message}
		</span>
	</div>
	)
}

export default Tooltip;