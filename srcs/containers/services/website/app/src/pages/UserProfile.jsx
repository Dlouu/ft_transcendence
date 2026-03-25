import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, Page } from "../ui";
import { AuthContext } from "../context/AuthContext";
import { GameContext } from "../context/GameContext";
import AvatarSection from "../components/profile/AvatarSection";
import Sidebar from "../components/profile/Sidebar";

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
				<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">

					<div>
						<span className="font-pixelm mb-4">{ profile?.name }</span>
						<AvatarSection user={viewedUser} readOnly={readOnly}/>

					</div>

					<Sidebar profile={profile} readOnly={readOnly}/>

				</div>
			</Card>
		</Page>
	);
}

export default UserProfile;
