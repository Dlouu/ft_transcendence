import { useContext } from "react";
import { Card, Page } from "../ui";
import { AuthContext } from "../context/AuthContext";
import { GameContext } from "../context/GameContext";
import AvatarSection from "../components/profile/AvatarSection";
import InfoSection from "../components/profile/InfoSection";
import PasswordSection from "../components/profile/PasswordSection";
import DeleteAccount from "../components/profile/DeleteAccount";
import Sidebar from "../components/profile/Sidebar";

function UserProfile() {
	const { user, logout } = useContext(AuthContext);
	const { profile } = useContext(GameContext);
	const readOnly = profile?.id !== user?.id;

	return (
		<Page center>
			<Card big="true">
				<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">

					<div>
						<AvatarSection user={user} readOnly={readOnly}/>

					</div>

					<Sidebar profile={profile} readOnly={readOnly}/>

				</div>
			</Card>
		</Page>
	);
}

export default UserProfile;
