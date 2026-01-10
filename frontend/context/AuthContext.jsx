import { createContext, useState } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);

	const login = (name) => {
		setUser({ name });
	};

	const logout = () => {
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
