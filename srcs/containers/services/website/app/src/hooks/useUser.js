import { useState } from "react";
import { useNotifications } from "../context/AlertContext";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export function useUser() {
	const { notify } = useNotifications();
	const { logout, setUser } = useContext(AuthContext);

	const [loading, setLoading] = useState(false);

	const request = async (url, method, body, successMessage) => {
		setLoading(true);

		try {
			const response = await fetch(url, {
				method: method,
				headers: {
					'Accept': "application/json",
					'Content-Type': "application/json",
				},
				body: JSON.stringify(body),
			});

			const contentType = response.headers.get("content-type") || "";
			const data = contentType.includes("application/json")
				? await response.json()
				: await response.text();

			if (!response.ok) {
				const message =
					typeof data === "string"
						? data
						: data?.message || "Request failed";
				throw new Error(message);
			}

			if (successMessage) notify(successMessage, "success");

			return data;
		} catch (error) {
			notify(error.message || "Error", "error");
			throw error;
		} finally {
			setLoading(false);
		}
	};

	const updateUser = async (field, value) => {
		const data = await request(
			"/api/user/update_information",
			"POST",
			{ [field]: value },
			`Your ${field} has been updated`
		);

		if (setUser) {
			setUser((prev) => ({
				...prev,
				[field]: value,
			}));
		}

		return data;
	};

	const changePassword = async (password, newPassword) => {
		return request(
			"/api/user/update_password",
			"POST",
			{
				password,
				new_password: newPassword,
			},
			"Password changed"
		);
	};

	const deleteAccount = async (password) => {
		await request(
			"/api/user/delete_account",
			"POST",
			{ password },
			"Account deleted"
		);

		logout();
	};

	return {
		updateUser,
		changePassword,
		deleteAccount,
		loading,
	};
}
