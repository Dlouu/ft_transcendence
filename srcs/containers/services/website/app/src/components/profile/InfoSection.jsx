import { useState } from "react";
import { EditableField } from "../../ui";
import { useNotifications } from "../../hooks/useNotifications";
import { useUser } from "../../hooks/useUser";

function InfoSection({ user }) {
	const [editingField, setEditingField] = useState(null);
	const { notify } = useNotifications();
	const { updateUser } = useUser();

	const updateUserAccount = async (field, value) => {
		if (!value) {
			notify("Please type something", "error");
			return;
		}
		if (value === user[field]) {
			notify("No changes detected", "info");
			return;
		}
		await updateUser(field, value);
	};

	return (
		<>
			<EditableField
				label="Username"
				value={user?.username}
				isEditing={editingField === "username"}
				onEdit={() => setEditingField("username")}
				onCancel={() => setEditingField(null)}
				onSave={(newValue) => updateUserAccount("username", newValue)}
			/>

			<EditableField
				label="Email"
				value={user?.email}
				isEditing={editingField === "email"}
				onEdit={() => setEditingField("email")}
				onCancel={() => setEditingField(null)}
				onSave={(newValue) => updateUserAccount("email", newValue)}
			/>
		</>
	);
}

export default InfoSection;
