function Page({	children, center = false }) {
	return (
		<div
			className={`
				min-h-screen
				min-w-screen
				bg-gray-800 text-white
				px-4
				${center ? "flex flex-col items-center" : ""}
			`}
		>
			{children}
		</div>
	);
}

export default Page;