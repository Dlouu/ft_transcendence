import { useApi } from "./useApi";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useContext } from "react";

export function useUser() {
	const { post } = useApi();
	const { logout, setUser, refreshUser } = useContext(AuthContext);
	const [loading, setLoading] = useState(false);

	const updateUser = async (field, value) => {
		
		try {
			setLoading(true);

			const data = await post(
			"/api/user/update_information",
			{ [field]: value },
			`Your ${field} has been updated`
		);

		setUser((prev) => ({...prev, [field]: value }));

		return data;

		} finally {
			setLoading(false);
		}
	
	};

	const updateProfilePicture = async (file) => {
		try {
			setLoading(true);

			await post("/api/user/update_profile_picture", file);
			await refreshUser();

		} finally {
			setLoading(false);
		}
	};

	const removeCard = async (cardId) => {
		try {
			setLoading(true);

			return await post(
				"/api/user/remove_card_image",
				{ card_id: Number(cardId) },
				"Image deleted successfully"
			);

		} finally {
			setLoading(false);
		}
	};

	const uploadCardBack = async (file) => {
		try {
			setLoading(true);

		return await post("/api/user/upload_card_image", file, "Card uploaded in Gallery");

		} finally {
			setLoading(false);
		}
	};

	const changePassword = async (password, newPassword) => {
		return post(
			"/api/user/update_password",
			{ password, new_password: newPassword },
			"Password changed"
		);
	};

	const deleteAccount = async (password) => {
		await post("/api/user/delete_account", { password }, "Account deleted" );
		logout();
	};

	return {
		updateUser,
		updateProfilePicture,
		uploadCardBack,
		removeCard,
		changePassword,
		deleteAccount,
		loading,
	};
}
