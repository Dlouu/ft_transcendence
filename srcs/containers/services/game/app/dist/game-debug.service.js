"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameDebugService = void 0;
const common_1 = require("@nestjs/common");
let GameDebugService = class GameDebugService {
    printDeck(game) {
        console.log("Deck:");
        game.deck.forEach((c, i) => {
            console.log(`${i}: ${c.family} ${c.value}`);
        });
    }
    printHands(game) {
        console.log("Players' Hands:");
        for (const p of game.players) {
            console.log(`${p._name}:`);
            p._hand.forEach((c, i) => {
                console.log(`  ${i}: ${c.family} ${c.value}`);
            });
        }
    }
};
exports.GameDebugService = GameDebugService;
exports.GameDebugService = GameDebugService = __decorate([
    (0, common_1.Injectable)()
], GameDebugService);
//# sourceMappingURL=game-debug.service.js.map