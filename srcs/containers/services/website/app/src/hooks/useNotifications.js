import { useContext } from "react";
import { AlertContext } from "../context/AlertContext";

export function useNotifications() {
	return useContext(AlertContext);
}
