import { createContext, useState, useCallback } from "react";

export const AlertContext = createContext();

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
			}}
		>
			{children}
		</AlertContext.Provider>
	);
}
