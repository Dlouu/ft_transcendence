import { useState } from "react";
import { Button, Input } from "../ui"

function EditableField({ label, value, inputType = "text", onSave }) {
	const [isEditing, setIsEditing] = useState(false);
	const [tempValue, setTempValue] = useState(value);

	
	const handleSave = async () => {
		await onSave(tempValue);
		setIsEditing(false);

	};

	const handleCancel = () => {
		setTempValue(value);
		setIsEditing(false);
	};

	return (
		<div className="mt-2">
			<p className="font-pixelhb font-bold">{label}:</p>

			{!isEditing ? (
				<div className="flex items-center gap-2">
					<span className="font-pixel">{value}</span>
					<Button variant="iconEdit" onClick={() => setIsEditing(true)}>
						󰏫
					</Button>
				</div>
			) : (
				<div className="flex items-center gap-2">
					<Input
						value={tempValue}
						type={inputType}
						onChange={(e) => setTempValue(e.target.value)}
					/>
					<Button onClick={handleSave}>✔</Button>
					<Button onClick={handleCancel}>✖</Button>
				</div>
			)}
		</div>
	);
}

export default EditableField;