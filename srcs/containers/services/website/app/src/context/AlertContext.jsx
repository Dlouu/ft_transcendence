import { createContext, useState, useCallback, useContext } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
	const [alert, setAlert] = useState([]);

	const notify = useCallback((message, type = "info") => {
		const id = crypto.randomUUID();

		setAlert((prev) => [
			...prev,
			{ id, message, type },
		]);

		setTimeout(() => {
			setAlert((prev) =>
				prev.filter((n) => n.id !== id)
			);
		}, 3000);
	}, []);

	return (
		<AlertContext.Provider
			value={{
				notify,
				alert,
				notifications: alert
			}}
		>
			{children}
		</AlertContext.Provider>
	);
}

export function useNotifications() {
	return useContext(AlertContext);
}