import { useContext } from "react";
import { Card, Page } from "../ui";
import { AuthContext } from "../context/AuthContext";
import { GameContext } from "../context/GameContext";
import AvatarSection from "../components/profile/AvatarSection";
import InfoSection from "../components/profile/InfoSection";
import PasswordSection from "../components/profile/PasswordSection";
import DeleteAccount from "../components/profile/DeleteAccount";
import PersonalGallery from "../components/profile/PersonalGallery";
import Sidebar from "../components/profile/Sidebar";

function Me() {
	const { user, logout } = useContext(AuthContext);
	const { profile } = useContext(GameContext);

	return (
		<Page center>
			<Card big="true">
				<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">

					<div>
						<AvatarSection user={user}/>
						<InfoSection user={user}/>

						<div className="flex flex-col sm:w-1/2 w-full">
							<PasswordSection />
							<DeleteAccount logout={logout}/>
						</div>
					</div>

					<Sidebar profile={profile}/>

				</div>
			</Card>
		</Page>
	);
}

export default Me;
