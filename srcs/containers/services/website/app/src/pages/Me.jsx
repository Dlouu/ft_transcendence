import { useContext } from "react";
import { GameContext } from "../context/GameContext";
import { Button, Card, Page, Input, Tooltip } from "../ui";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function Me() {
	const { user } = useContext(AuthContext);
	const { profile } = useContext(GameContext);
	const navigate = useNavigate();

	return (
		<Page center>

			<Card big="true">
				<div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10">
				
					<div>
						<div className="flex">
							<img
								src={user?.profile_picture_url}
								className="h-30 w-30"
								alt={user?.username}
							/>
						</div>
						<div className="font-2xl font-icon mb-5 mt-1"><Button variant="icon">󱇤</Button></div>

						<p className="font-pixelhb font-bold">
							Username:</p>
						<h2 className="flex flex-row font-pixelm text-center">
							<Input placeholder={user?.username}></Input>
							<Button variant="iconEdit">󰏫</Button>
						</h2> 

						<p className="font-pixelhb font-bold mt-2">
							Email:</p>
						<h2 className="flex flex-row font-pixelhb text-center">
							<Input placeholder={user?.email}></Input>
							<Button variant="iconEdit">󰏫</Button>
						</h2> 

						<Button>CHANGE PASSWORD</Button>

						<h2 className="text-2xl font-pixel font-bold mb-2 mt-12">
							GALLERY
						</h2>
						<p>
							Images
						</p>
					</div>

					<div>

						<div className="flex flex-col">

							<h2 className="text-2xl font-pixel font-bold mt-12 sm:mt-0 mb-2">STATS</h2>
							<ul className="space-y-1">
								<li>Games played: {profile.stats.gamesPlayed}</li>
								<li>Games won: {profile.stats.gamesWon}</li>
								<li>Win rate: {profile.stats.winRate}%</li>
							</ul>
							
							<h2 className="text-2xl font-pixel font-bold mb-2 mt-12">FRIENDS</h2>
							<ul className="space-y-1">
								<li>Friend-1</li>
								<li>Deuxieme</li>
								<li>Truite</li>
							</ul>
							

						</div>

												
						
					</div>

				</div>
			</Card>
		</Page>
	);
}

export default Me;

//avatars, usernames, friends list