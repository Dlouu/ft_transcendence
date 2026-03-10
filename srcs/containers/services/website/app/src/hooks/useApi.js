import { useState } from "react";
import { useNotifications } from "../hooks/useNotifications";

export function useApi() {
	const { notify } = useNotifications();
	const [loading, setLoading] = useState(false);

	/**
	 * Generic fetch wrapper that auto-detects JSON or File
	 * @param {string} url
	 * @param {"GET"|"POST"|"PATCH"} method
	 * @param {object|File|null} body
	 * @param {string} successMessage
	 */
	const request = async (url, method = "GET", body = null, successMessage) => {
		setLoading(true);
		try {
			const options = {
				method,
				credentials: "include",
				headers: {},
			};

			// Auto-detect File
			if (body instanceof File) {
				const formData = new FormData();
				formData.append("image", body);
				options.body = formData;
			} 
			// Normal JSON body
			else if (body && typeof body === "object") {
				options.headers["Content-Type"] = "application/json";
				options.body = JSON.stringify(body);
			}

			const response = await fetch(url, options);

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

	const get = (url, successMessage) => request(url, "GET", null, successMessage);
	const post = (url, body, successMessage) => request(url, "POST", body, successMessage);
	const patch = (url, body, successMessage) => request(url, "PATCH", body, successMessage);
	

	return { request, get, post, patch, loading };
}