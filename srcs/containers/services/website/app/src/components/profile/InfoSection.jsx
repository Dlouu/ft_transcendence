import { useContext, useState } from "react";
import { EditableField } from "../../ui";
import { useNotifications } from "../../context/AlertContext";
import { useUser } from "../../hooks/useUser";

function InfoSection({ user }) {
	const [editingField, setEditingField] = useState(null);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const { notify } = useNotifications();
	const { updateUser } = useUser();

	return (
		<>
			<EditableField
				label="Username"
				value={user?.username}
				isEditing={editingField === "username"}
				onEdit={() => setEditingField("username")}
				onCancel={() => setEditingField(null)}
				onSave={(newValue) => updateUser("username", newValue)}
			/>

			<EditableField
				label="Email"
				value={user?.email}
				isEditing={editingField === "email"}
				onEdit={() => setEditingField("email")}
				onCancel={() => setEditingField(null)}
				onSave={(newValue) => updateUser("email", newValue)}
			/>
		</>
	);
}

export default InfoSection;