import bg from "../assets/background.png"

function Page({	children, center = false, className = "" }) {
	return (
		<div
			className={`
				min-h-[calc(100vh-7rem)]
				min-w-screen
				bg-gray-800 text-white
				px-4 bg-repeat sm:bg-contain
				${center ? "flex flex-col items-center" : ""}
				${className}
			`}
			style={{ backgroundImage: `url(${bg})` }}
		>
			{children}
		</div>
	);
}

export default Page;
