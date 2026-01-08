import LegalPage from "../ui/LegalPage";

function Privacy() {
	return (
		<LegalPage title="Politique de confidentialité">
			<p>Votre vie privée est importante pour nous (promis).</p>

			<h2 className="text-xl font-semibold mt-6">1. Données collectées</h2>
			<p>
				Nous collectons uniquement des informations nécessaires au
				fonctionnement du site :
				<li>pseudo</li>
				<li>statistiques de jeu</li>
				<li>les dessins créés via l'outil de personnalisation</li>
			</p>
			<p>
				Les utilisateurs sont invités à ne pas inclure de données personnelles 
				ou sensibles dans leurs dessins.
				UwUNO n’est pas responsable des données intégrées volontairement par l’utilisateur.
			</p>

			<h2 className="text-xl font-semibold mt-6">2. Utilisation</h2>
			<p>
				Ces données servent à afficher votre profil et améliorer
				l’expérience utilisateur.
			</p>
			<p>Les dessins sont conservés sur le site mais peuvent être supprimés à tout moment
				par l’utilisateur ou par UwUNO.
			</p>

			<h2 className="text-xl font-semibold mt-6">3. Partage</h2>
			<p>
				Les données sont stockées de manière sécurisée et ne sont
				jamais vendues ni partagées avec des tiers.
			</p>

			<h2 className="text-xl font-semibold mt-6">4. Cookies</h2>
			<p>
				Des cookies techniques peuvent être utilisés pour assurer
				le bon fonctionnement du site.
			</p>

			<h2 className="text-xl font-semibold mt-6">5. Vos droits</h2>
			<p>
				Vous pouvez demander la modification ou la suppression de vos données.
			</p>
		</LegalPage>
	);
}

export default Privacy;
