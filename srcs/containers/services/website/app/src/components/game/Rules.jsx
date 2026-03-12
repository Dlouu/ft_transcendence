import { Card } from "../../ui";

function Rules({ onClose }) {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
			<Card plain className="max-w-xl w-full max-h-[80vh] overflow-y-auto relative">

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
					<li>First player to empty their hand wins</li>
				</ul>

				<h1 className="text-2xl font-semibold mt-6">DECK COMPOSITION</h1>
				<ul className="list-disc list-inside mt-2">
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
					<li>The next player draws 4 cards</li>
					<li>The next player's turn is skipped</li>
					<li>No challenge rule exists in this version</li>
					<li>The card can be played even if the player has a matching color</li>
				</ul>

			</Card>
		</div>
	);
}

export default Rules;

/*

<h1 className="text-2xl font-semibold mt-6"></h1>
<ul className="list-disc list-inside">
	<li><strong></strong></li>
	<li><strong></strong></li>
	<li><strong></strong></li>
</ul>

NO STACKING RULE

Stacking is not allowed.

- +2 cannot stack on +2  
- +4 cannot stack on +4  
- +2 cannot stack on +4  

Draw penalties must be resolved immediately.

---

UNO DECLARATION

When a player has exactly 1 card they must press the UNO button.

Valid UNO Call Window:

- From the moment the player has 1 card  
- Until the UNO timer expires  
- Before the next turn proceeds

If the player fails to press UNO:

- They receive a 2 card penalty

Other players may press UNO:

- This applies the penalty to the player who failed to declare UNO  
- The caller receives no penalty

Important:

The next player cannot play until:

- UNO is declared, or  
- The UNO timer expires

---

DRAW PILE RULES

When the draw pile becomes empty:

- The discard pile (except the top card) is reshuffled into a new draw pile

If both piles contain no usable cards:

- The player cannot draw  
- Their turn is skipped

---

ENDING THE GAME

The game ends when:

A player has 0 cards  
→ That player immediately wins.

No real players remain (only bots)  
→ The game terminates instantly  
→ The match is void and no result is recorded.

---

BOTS AND DISCONNECTIONS

If a real player disconnects:

- They are replaced by a bot  
- The bot plays automatically  
- The game continues normally

If the player reconnects:

- Their hand is restored  
- The current game state is restored  
- Control is returned to the player

---

INVALID ACTIONS

Because the backend is fully authoritative, the following actions are rejected server-side:

- Playing out of turn  
- Playing an invalid card  
- Playing while another action is pending  
- Stacking draw cards  
- Playing during UNO resolution

Rejected actions:

- Do not alter the game state  
- Return an error to the client

---

TECHNICAL ENFORCEMENT

Server Authority

- All moves are validated server-side  
- Random numbers are generated server-side  
- Card distribution is handled server-side  
- The client is never trusted

Game State Includes

- Player hands  
- Draw pile  
- Discard pile  
- Play direction  
- Current turn  
- Pending effects  
- UNO state  
- Bot status

---

WIN CONDITION

- The first player to reach 0 cards wins  
- No scoring system exists  
- The match is a single round

---

UX CONSTRAINTS

- Click-to-play interactions only  
- Wild color must be chosen immediately  
- Animations cannot delay validation  
- No spectators  
- Lobby privacy handled externally

---

GAME SUMMARY

- Players: 2–4  
- Mode: Live Turn-Based  
- Deck: 108 cards  
- Stacking: No  
- +4 Challenge: No  
- Scoring: No  
- UNO Button: Required  
- Bots: Replace disconnected players  
- Reshuffle: Yes  
- Server Authority: Full

*/