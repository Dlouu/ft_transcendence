import { Card } from "../../ui";

function Rules({ onClose }) {
	return (
		<div
			className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
			onClick={onClose}
		>
			<div onClick={(e) => e.stopPropagation()}>
				<Card
					plain
					className="max-w-xl w-full max-h-[80vh] overflow-y-auto relative"
					onClick={(e) => e.stopPropagation()}
				>
					<button
						className="absolute top-2 right-3 text-2xl"
						onClick={onClose}
					>
						✕
					</button>

					<p className="font-pixelm text-2xl"><strong>RULES</strong></p>

					<h1 className="text-2xl font-semibold mt-6">UwUNO  OVERVIEW</h1>
					<p>This game is an implementation of simplified Classic UNO.</p>
					<ul className="list-disc list-inside mt-2">
						<li><strong>Players:</strong> 2 to 4</li>
						<li><strong>Mode:</strong> Live turn-based</li>
						<li><strong>Deck:</strong> 108 cards</li>
						<li><strong>Scoring:</strong> No</li>
						<li><strong>UNO Button:</strong> Required</li>
						<li><strong>Bots:</strong> Replace disconnected players</li>
						<li><strong>Reshuffle:</strong> Yes</li>
						<li><strong>Server Authority:</strong> Full</li>
						<li><strong>Stacking:</strong> No</li>
						<li><strong>+4 Challenge:</strong> No</li>
						<li>First player to empty their hand wins</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">DECK COMPOSITION</h1>
					<ul className="list-disc list-inside">
						<li><strong>Number cards:</strong> 10 × 4 colors (0–9)</li>
						<li><strong>Action cards:</strong> Skip, Reverse, Draw Two</li>
						<li><strong>Wild cards:</strong> Wild + Wild Draw Four</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">GAME SETUP</h1>
					<ul className="list-disc list-inside">
						<li>Each player receives <strong>7 cards</strong></li>
						<li>Remaining cards form the <strong>Draw Pile</strong></li>
						<li>The top card is placed face-up to form the <strong>Discard Pile</strong></li>
						<li>Game direction starts <strong>clockwise</strong></li>
						<li>The first player is randomly selected</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">TURN STRUCTURE</h1>
					<ul className="list-disc list-inside">
						<p>On a player's turn they may:</p>
						<li>Play a card that matches: </li>
						<ul className="px-6 list-inside">
							<li> - color,</li>
							<li> - number,</li>
							<li> - symbol,</li>
							<li> - or play a wild card</li>
						</ul>
						<li>Draw <strong>one card</strong> from the Draw Pile</li>
						<p className="mt-3">If a player draws a card:</p>
						<ul className="px-6">
							<li>- If the card is playable <strong>→ they may play it immediately</strong></li>
							<li>- If it is not playable <strong>→ their turn ends</strong></li>
						</ul>
						<p className="mt-3">If the deck is empty and cannot be reshuffled:</p>
						<ul className="px-6">
							<li>- The player cannot draw</li>
							<li>- Their turn is skipped</li>
						</ul>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">CARD EFFECT</h1>

					<p className="mt-3 font-pixelm">Reverse</p>
					<ul className="px-6 list-disc list-inside">
						<li>Changes the direction of play</li>
						<li>In a 2-player game it acts like Skip</li>
					</ul>

					<p className="mt-3 font-pixelm">Skip</p>
					<ul className="px-6 list-disc list-inside">
						<li>The next player loses their turn</li>
					</ul>

					<p className="mt-3 font-pixelm">Draw Two (+2)</p>
					<ul className="px-6 list-disc list-inside">
						<li>The next player draws 2 cards</li>
						<li>Their turn is skipped</li>
					</ul>

					<p className="mt-3 font-pixelm">Wild</p>
					<ul className="px-6 list-disc list-inside">
						<li>The player chooses the next color</li>
					</ul>

					<p className="mt-3 font-pixelm">Wild Draw Four (+4)</p>
					<ul className="px-6 list-disc list-inside">
						<li>The player chooses the next color</li>
						<li>The next player <strong>draws 4 cards</strong></li>
						<li>The next player's turn is <strong>skipped</strong></li>
						<li>No challenge rule exists in this version</li>
						<li>The card can be played even if the player has a matching color</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">NO STACKING RULE</h1>
					<p>Stacking is not allowed.</p>
					<ul className="list-disc list-inside">
						<li>+2 cannot stack on +2</li>
						<li>+4 cannot stack on +4</li>
						<li>+2 cannot stack on +4</li>
					</ul>
					<p className="mt-3">Draw penalties must be resolved immediately.</p>

					<h1 className="text-2xl font-semibold mt-6">UNO DECLARATION</h1>
					<p>When a player has exactly 1 card they must press the UNO button.</p>
					<p className="mt-3">Valid UNO Call Window:</p>
					<ul className="list-disc list-inside">
						<li>From the moment the player has 1 card</li>
						<li>Until the UNO timer expires</li>
						<li>Before the next turn proceeds</li>
					</ul>
					<p className="mt-3">If the player fails to press UNO:</p>
					<ul className="list-disc list-inside">
						<li>They receive a 2 card penalty</li>
					</ul>
					<p className="mt-3">Other players may press UWU:</p>
					<ul className="list-disc list-inside">
						<li>This applies the penalty to the player who failed to declare UNO</li>
						<li>The caller receives no penalty</li>
					</ul>
					<p className="mt-3">The next player cannot play until:</p>
					<ul className="list-disc list-inside">
						<li>UNO is declared, or</li>
						<li>The UNO timer expires</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">DRAW PILE RULES</h1>
					<p>When the draw pile becomes empty, the discard pile (except the top card) is reshuffled into a new draw pile</p>
					<p className="mt-3">If both piles contain no usable cards:</p>
					<ul className="list-disc list-inside">
						<li>The player cannot draw</li>
						<li>Their turn is skipped</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">ENDING THE GAME</h1>
					<p>The game ends when:</p>
					<p className="mt-3">A player has 0 cards</p>
					<ul className="list-inside">
						<li>→ That player immediately wins.</li>
					</ul>

					<ul className="list-inside">
					<p className="mt-3">No real players remain (only bots)</p>
						<li>→ The game terminates instantly</li>
						<li>→ The match is void and no result is recorded.</li></ul>

					<h1 className="text-2xl font-semibold mt-6">BOTS AND DISCONNECTIONS</h1>
					<p>If a real player disconnects:</p>
					<ul className="list-disc list-inside">
						<li>They are replaced by a bot</li>
						<li>The bot plays automatically</li>
						<li>The game continues normally</li>
					</ul>
					<p className="mt-3">If the player reconnects:</p>
					<ul className="list-disc list-inside">
						<li>Their hand is restored</li>
						<li>The current game state is restored</li>
						<li>Control is returned to the player</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">INVALID ACTIONS</h1>
					<p>Because the backend is fully authoritative, the following actions are rejected server-side:</p>
					<ul className="list-disc list-inside">
						<li>Playing out of turn</li>
						<li>Playing an invalid card</li>
						<li>Playing while another action is pending</li>
						<li>Stacking draw cards</li>
						<li>Playing during UNO resolution</li>
					</ul>
					<p className="mt-3">Rejected actions:</p>
					<ul className="list-disc list-inside">
						<li>Do not alter the game state</li>
						<li>Return an error to the client</li>
					</ul>

					<h1 className="text-2xl font-semibold mt-6">WIN CONDITION</h1>
					<ul className="list-disc list-inside">
						<li>The first player to reach 0 cards wins</li>
						<li>No scoring system exists</li>
						<li>The match is a single round</li>
					</ul>
				</Card>
			</div>
		</div>
	);
}

export default Rules;
