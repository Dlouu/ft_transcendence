import { useNavigate } from "react-router-dom";
import { Button, Card, Page } from "../ui";

function NotFound() {
	const navigate = useNavigate();

	return (
		<Page center>
			<Card center>
				<p className="font-pixelm font-2xl"><strong>404</strong></p>

				<h2 className="text-2xl font-semibold mt-6">PAGE NOT FOUND</h2>
				<p className="text-center">
					Obviously, this page doesn't exist, go back to home !
				</p>

				<Button onClick={() => navigate("/")}>
					<span className="font-icon">󰋜</span> HOME
				</Button>
			</Card>
		</Page>
	);
}

export default NotFound;
