function Page({
	children,
	center = false,
}) {
	return (
		<div
			className={`
				min-h-screen
				bg-gray-900 text-white
				px-4
				${center ? "flex flex-col justify-center items-center" : ""}
			`}
		>
			{children}
		</div>
	);
}

export default Page;