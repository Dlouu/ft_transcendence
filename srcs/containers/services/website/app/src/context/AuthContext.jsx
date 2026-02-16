import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/user/me", {
			credentials: "include",
		})
		.then((res) => {
			if (!res.ok)
				throw new Error();
			return res.json();
		})
		.then((data) => {
			setUser(data);
		})
		.catch(() => {
			setUser(null);
		})
		.finally(() => {
			setLoading(false)
		});
	}, []);

	const refreshUser = async() => {
		const res = await fetch("/api/user/me", {
			credentials: "include",
		})
		if (!res.ok) {
			setUser(null);
			return;
		}
		const data = await res.json();
		setUser(data);
	};

	const login = async () => {
		await refreshUser();
	};

	const logout = () => {
		// await fetch("/api/auth/logout", {
		// 	method: "POST",
		// 	credentials: "include",
		// });
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				login,
				logout,
				loading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
