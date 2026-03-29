import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

function withCacheBuster(url) {
	if (!url || typeof url !== "string") {
		return url;
	}

	if (url.startsWith("data:")) {
		return url;
	}

	const separator = url.includes("?") ? "&" : "?";
	return `${url}${separator}v=${Date.now()}`;
}

function normalizeUserMediaUrls(rawUser) {
	if (!rawUser || typeof rawUser !== "object") {
		return rawUser;
	}

	return {
		...rawUser,
		profile_picture_url: withCacheBuster(rawUser.profile_picture_url),
		card_back_url: withCacheBuster(rawUser.card_back_url),
	};
}

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
			setUser(normalizeUserMediaUrls(data));
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
		setUser(normalizeUserMediaUrls(data));
	};

	const login = async () => {
		await refreshUser();
	};

	const logout = async () => {
		await fetch("/api/auth/logout", {
			method: "GET",
			credentials: "include",
		});
		setUser(null);
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				login,
				logout,
				refreshUser,
				loading,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}
