import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, Card, Page } from "../ui";
import { AuthContext } from "../context/AuthContext";
import { GameContext } from "../context/GameContext";
import AvatarSection from "../components/profile/AvatarSection";
import GameStats from "../components/profile/GameStats";

function UserProfile() {
	const { id } = useParams();
	const { user } = useContext(AuthContext);
	const { profile, profileLoading, profileNotFound, fetchPublicProfile } = useContext(GameContext);

	useEffect(() => {
		fetchPublicProfile(id);
	}, [id, fetchPublicProfile]);

	const readOnly = String(profile?.id) !== String(user?.id);
	const viewedUser = readOnly ? profile : user;

	if (!profileLoading && profileNotFound) {
		return (
			<Page center>
				<Card big="true">
					<div className="text-center text-2xl font-bold">User doesn&apos;t exist</div>
				</Card>
			</Page>
		);
	}

	return (
		<Page center>
			<Card big="true">
				<div className="grid grid-cols-1 sm:grid-cols-[2fr_1fr] gap-10">

					<div>
						<p className="font-pixelm mb-10">{ profile?.name }</p>

						<AvatarSection user={viewedUser} readOnly={readOnly}/>
					</div>

					<GameStats stats={profile.stats}/>

				</div>
			</Card>
		</Page>
	);
}

export default UserProfile;
