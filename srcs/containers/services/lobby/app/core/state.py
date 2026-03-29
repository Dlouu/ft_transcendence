lobbies = {}  # 4-characters room code -> lobby info dict
socketid_lobby = {}
max_players = 4
players_in_game = set()  # user_ids currently in an active game
players_left_game = {}   # user_id -> game_code, for players who left mid-game

three_letters = [
"zap", "zip", "bop", "pop", "yum", "yay", "wig", "hug", "jab", "jog",
"mop", "nod", "pug", "rib", "sip", "tap", "wok", "zig", "uwu", "xdd",
"lol", "zzz", "red", "qwe",
"aww", "joy", "sun", "bee", "bun", "kit", "pup", "wow", "dot", "grr",
"pix", "lil", "neo", "zen", "sky", "mew",
"fox", "gem", "rex", "nut", "fig", "pig", "bat", "ram", "bit", "gnu",
"rat", "dog", "cow", "yak", "dab", "hot", "box", "run", "roc", "rox",
"emo", "git", "mix", "max", "hub"
]

four_letters = [
"zany", "wack", "zoom", "fizz", "buzz", "jolt", "yelp", "boop", "bump",
"chop", "flip", "gulp", "honk", "jinx", "kick", "mush", "nerd", "puff",
"quip", "riff", "tada", "whiz", "zing", "xdxd", "geek",
"cozy", "duck", "moon", "star", "snow", "blue", "pink", "smol", "rawr",
"luna", "pika", "mojo", "mist", "fluf", "glow", "tofu", "pixl", "chip"
]

