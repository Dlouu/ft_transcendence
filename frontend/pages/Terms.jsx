import LegalPage from "../ui/LegalPage";

function Terms() {
	return (
		<LegalPage title="Conditions d'utilisation">
			<p>Bienvenue sur <strong>UwUNO</strong></p>

			<h2 className="text-xl font-semibold mt-6">1. Objet</h2>
			<p>
				Ce site permet aux utilisateurs de jouer à UwUNO en ligne, de dessiner,
				de consulter leur profil et leurs statistiques de jeu.
			</p>

			<h2 className="text-xl font-semibold mt-6">2. Utilisation</h2>
			<p>
				L’accès au site est gratuit mais nécessite la création d'un compte utilisateur.
				Vous vous engagez à utiliser le site de manière raisonnable,
				légale et respectueuse des autres joueurs.
			</p>

			<h2 className="text-xl font-semibold mt-6">3. Disponibilité</h2>
			<p>
				Le service est fourni “tel quel”. Des interruptions peuvent survenir,
				parfois au pire moment.
			</p>
			<p>
				UwUNO se réserve le droit de supprimer tout dessin ou de suspendre un compte
				en cas de non-respect des présentes conditions ou d’obligation légale.
			</p>

			<h2 className="text-xl font-semibold mt-6">4. Responsabilité</h2>
			<p>
				Nous ne sommes pas responsables des parties perdues
				et frustrations liées à une carte +4 ou carte revendication inattendue.
			</p>

			<p>
				Les utilisateurs sont seuls responsables des dessins et contenus qu’ils créent 
				via le service de personnalisation des cartes.
			</p>

			<p>
				UwUNO n’exerce aucun contrôle préalable sur ces contenus et ne saurait être tenu
				responsable de leur caractère.
			</p>

			<p>
				Il est interdit de créer ou de stocker des contenus illégaux ou portant atteinte
				aux droits de tiers.
			</p>

			<h2 className="text-xl font-semibold mt-6">5. Modifications</h2>
			<p>
				Ces conditions peuvent être mises à jour à tout moment.
			</p>
		</LegalPage>
	);
}

export default Terms;