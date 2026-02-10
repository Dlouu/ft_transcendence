import { useNotifications } from "../context/AlertContext";

function Notifications() {
	const { notifications } = useNotifications();

	return (
		<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
			{notifications.map((n) => (
				<div
					key={n.id}
					className={`
						px-4 py-2 rounded shadow-lg text-white
						transition-all duration-300
						${n.type === "success" && "bg-green-600"}
						${n.type === "error" && "bg-red-600"}
						${n.type === "info" && "bg-gray-800"}
					`}
				>
					{n.message}
				</div>
			))}
		</div>
	);
}

export default Notifications;