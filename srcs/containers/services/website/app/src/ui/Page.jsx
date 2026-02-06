import bg from "../assets/background.png"

function Page({	children, center = false }) {
	return (
		<div
			className={`
				min-h-[calc(100vh-7rem)]
				min-w-screen
				bg-gray-800 text-white
				px-4 bg-repeat sm:bg-contain
				${center ? "flex flex-col items-center" : ""}
			`}
			style={{ backgroundImage: `url(${bg})` }}
		>
			{children}
		</div>
	);
}

export default Page;
