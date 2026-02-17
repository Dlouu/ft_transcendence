import { useContext, useState } from "react";
import { EditableField } from "../../ui";
import { useNotifications } from "../../context/AlertContext";

function InfoSection({ user }) {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const { notify } = useNotifications();
	const [editingField, setEditingField] = useState(null);

	const updateUserInformation = async (data, successMessage) => {
		try {
			const request = await fetch("/api/user/update_information", {
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: "POST",
				body: JSON.stringify(data),
			});

			const contentType = request.headers.get("content-type") || "";
			const answer = contentType.includes("application/json")
				? await request.json()
				: await request.text();

			if (request.ok) {
				notify(successMessage, "success")
			} else {
				const message =
					typeof answer === "string"
						? answer
						: answer?.message || "Update failed";
				notify(message, "error");
			}
		} catch (error) {
			console.log(error);
			notify("Error", "error");
		}
	};

	return (
		<>
			<EditableField
				label="Username"
				value={user?.username}
				isEditing={editingField === "username"}
				onEdit={() => setEditingField("username")}
				onCancel={() => setEditingField(null)}
				onSave={(newValue) =>
					updateUserInformation(
						{ username: newValue },
						"Username updated"
					)
				}
			/>

			<EditableField
				label="Email"
				value={user?.email}
				isEditing={editingField === "email"}
				onEdit={() => setEditingField("email")}
				onCancel={() => setEditingField(null)}
				onSave={(newValue) =>
					updateUserInformation(
						{ email: newValue },
						"Email updated"
					)
				}
			/>
		</>
	);
}

export default InfoSection;