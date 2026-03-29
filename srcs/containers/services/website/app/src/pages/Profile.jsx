import { useContext, useEffect } from "react";
import { Card, Page } from "../ui";
import { AuthContext } from "../context/AuthContext";
import { GameContext } from "../context/GameContext";
import AvatarSection from "../components/profile/AvatarSection";
import InfoSection from "../components/profile/InfoSection";
import PasswordSection from "../components/profile/PasswordSection";
import DeleteAccount from "../components/profile/DeleteAccount";
import GameStats from "../components/profile/GameStats";

function Me() {
	const { user, logout } = useContext(AuthContext);
	const { profile, fetchPublicProfile } = useContext(GameContext);

	useEffect(() => {
		fetchPublicProfile(user?.id);
	}, [user?.id, fetchPublicProfile]);

	return (
		<Page center>
			<Card big="true">
				<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">

					<div>
						<AvatarSection user={user}/>
						<InfoSection user={user}/>

						<div className="sm:hidden">
						<GameStats stats={profile.stats}/>
						</div>

						<div className="flex flex-col sm:w-1/2 w-full">
							<PasswordSection />
							<DeleteAccount logout={logout}/>
						</div>
					</div>

					<div className="hidden sm:block">
						<GameStats stats={profile.stats}/>
					</div>
				</div>
			</Card>
		</Page>
	);
}

export default Me;
