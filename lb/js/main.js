
class Deck {
    constructor() {
        this.cards = [];
        this.reset();
        this.shuffle();
    }

    reset() {
        this.cards = [];
  
        const suits = ['Hearts', 'Spades', 'Clubs', 'Diamonds'];

        const values = [
            {display: 2, value: 2},
            {display: 3, value: 3},
            {display: 4, value: 4},
            {display: 5, value: 5},
            {display: 6, value: 6},
            {display: 7, value: 7},
            {display: 8, value: 8},
            {display: 9, value: 9},
            {display: 10, value: 10},
            {display: 'Jack', value: 11},
            {display: 'Queen', value: 12},
            {display: 'King', value: 13},
            {display: 'Ace', value: 14}
        ];
    
        for (let suit in suits) {
          for (let value in values) {
            this.cards.push({
                display: values[value].display,
                suit: suits[suit],
                value: values[value].value
            });
          }
        }
    }

    shuffle() {
        const { cards } = this;
        let m = cards.length, i;
      
        while (m) {
          i = Math.floor(Math.random() * m--);
      
          [cards[m], cards[i]] = [cards[i], cards[m]];
        }
      
        return this;
    }

    deal() {
        return this.cards.pop();
    }

    insert(card) {
        let index = Math.floor(Math.random() * (this.cards.length));
        this.cards.splice(index, 0, card);
    }
}

class LuckyBastard {
    constructor(playerName, numNPC) {
        this.deck = new Deck();
        this.playCards = [];
        this.burnCards = [];
        this.selectedCards = [];
        this.players = [];
        this.currentPlayerIndex = 0;
        this.previousCardPlayer = null;
        this.winOrder = [];
        this.gameOver = false;
        this.playCount = 0;

        this.npcNames = [
            'Joe T',
            'Jake',
            'Mike',
            //'BJ',
            'Chelsea',
            'Scotty'
        ]

        if (playerName) {
            this.addPlayer(playerName, false);
        }

        for (var i = 0; i < numNPC; i++) {
            const npcName = this.npcNames[Math.floor(Math.random() * this.npcNames.length)];
            this.npcNames.splice(this.npcNames.indexOf(npcName),1);
            this.addPlayer(npcName, true); 
        }
    }

    addPlayer(name, isNPC) {
        this.players.push(new Player(name, this, this.deck, isNPC));
    }
    
    start() {
        const numDown = 3;
        const numUp = 3;
        const numHand = 3;

        this.currentPlayerIndex = Math.floor(Math.random() * (this.players.length));

        for (let i = 0; i < numDown; i++) {
            for (let player in this.players) {
                this.players[player].playerCards.down.push(this.deck.deal());
            }
        }

        for (let i = 0; i < numUp; i++) {
            for (let player in this.players) {
                this.players[player].playerCards.up.push(this.deck.deal());
            }
        }

        for (let i = 0; i < numHand; i++) {
            for (let player in this.players) {
                this.players[player].playerCards.hand.push(this.deck.deal());
            }
        }

        for (let player in this.players) {
            this.players[player].playerCards.sort();
        }

        let startCard = this.deck.deal();
        
        while (startCard.value == 2 || startCard.value == 9 || startCard.value == 10) {
            this.deck.insert(startCard);
            startCard = this.deck.deal();
        }

        this.playCards.push(startCard);

        console.log("Start card is: " + startCard.display + ' of ' + startCard.suit);

        this.players[this.currentPlayerIndex].startPlayerTurn();
        if (this.players[this.currentPlayerIndex].isNPC) {
            this.playNPC();
        }
    }

    playNPC() {
        let currentPlayer = this.players[this.currentPlayerIndex];
        let turnOver = true;

        // Play Hand or Up
        if (currentPlayer.playerCards.hand.length > 0 || currentPlayer.playerCards.up.length > 0) {
            let isHand = currentPlayer.playerCards.hand.length > 0;
            let stack = (currentPlayer.playerCards.hand.length > 0) ? currentPlayer.playerCards.hand : currentPlayer.playerCards.up
            
            // Get first playable card
            let playCard = currentPlayer.getFirstPlayableRegular(stack);
            if (!playCard) playCard = currentPlayer.getFirstPlayablePower(stack);

            // Check if playable card found and play or pick up
            if (playCard) {
                turnOver = !currentPlayer.playCard(playCard, stack);
            } else {
                if (isHand) {
                    currentPlayer.pickUp();
                } else {
                    currentPlayer.pickUp(playCard, stack);
                }
            }
        } else if (currentPlayer.playerCards.hand.length == 0 && currentPlayer.playerCards.up.length == 0 && currentPlayer.playerCards.down.length > 0) {
            let stack = currentPlayer.playerCards.down;
            let randomCard = stack[Math.floor(Math.random() * stack.length)];
            if (currentPlayer.cardCheck(randomCard)) {
                turnOver = !currentPlayer.playCard(randomCard, stack);
            } else {
                currentPlayer.pickUp(randomCard, stack);
            }
        }

        if (!turnOver && !this.gameOver) {
            currentPlayer.draw(3);
            this.playNPC();
        } else if (!currentPlayer.checkNoCards() && !this.gameOver ) {
            currentPlayer.endPlayerTurn();
        }
    }

    getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    clearPlayCards() {
        this.playCards = [];
    }

    burnPlayCards() {
        this.burnCards = this.burnCards.concat(this.playCards);
        this.clearPlayCards();
    }

    checkQuads() {
        if (this.playCards.length > 3
            && this.playCards[this.playCards.length-2].value == this.playCards[this.playCards.length-1].value 
            && this.playCards[this.playCards.length-3].value == this.playCards[this.playCards.length-1].value 
            && this.playCards[this.playCards.length-4].value == this.playCards[this.playCards.length-1].value) {
                console.log('BOMB: Quads played. Play stack to the burn pile.');
                this.burnPlayCards();
                return true;
            }
        return false;
    }

    setPreviousCardPlayer(player) {
        this.previousCardPlayer = player;
    }

    previousWasPlayer(player) {
        return this.previousCardPlayer == player;
    }
}

class PlayerCards {
    constructor(deck) {
        this.down = [];
        this.up = [];
        this.hand = [];
        this.deck = deck;
    }

    sort() {
        this.hand.sort((a,b) => {
            return a.value - b.value;
        });
        this.up.sort((a,b) => {
            return a.value - b.value;
        });
    }

    draw() {
        if (this.deck.cards.length > 0) {
            this.hand.push(this.deck.deal());
            this.sort();
        }
    }
}

class Player {
    constructor(name, game, deck, isNPC) {
        this.name = name;
        this.game = game;
        this.deck = deck;
        this.playerCards = new PlayerCards(deck);
        this.isNPC = isNPC;
        this.place = null;
    }

    checkMultiples(cardA) {
        let hasMultiples = false;
        let multipleCount = 0;

        if (this.playerCards.hand.length > 0) {
            for (var i = 0; i < this.playerCards.hand.length; i++) {
                if (this.playerCards.hand[i].value == cardA.value) {
                    hasMultiples = true;
                    multipleCount++;
                }
            }
        }

        if (this.playerCards.hand.length == multipleCount || this.playerCards.hand.length == 0) {
            for (var i = 0; i < this.playerCards.up.length; i++) {
                if (this.playerCards.up[i].value == cardA.value) {
                    hasMultiples = true;
                    multipleCount++;
                }
            }
        }

        if (hasMultiples) {
            //console.log('Multiple detected');
        }
        return hasMultiples;
    }

    pickUp(card, stack) {
        console.log('Player "' + this.name + '" picks up the play stack. (' + this.game.playCards.length +' cards)');
        this.playerCards.hand = this.playerCards.hand.concat(this.game.playCards);
        if (card && stack) {
            // If picking up a card from up or down stack
            this.playerCards.hand.push(card);
            stack.splice(stack.indexOf(card), 1);
        }
        this.game.clearPlayCards();
    }

    checkNoCards() {
        return this.playerCards.hand == 0 && this.playerCards.up == 0 && this.playerCards.down == 0;
    }

    getFirstPlayablePower(stack) {
        let card = null;
        for (var i = 0; i < stack.length; i++) {
            if (this.cardCheck(stack[i]) && (stack[i].value == 2 || stack[i].value == 9 || stack[i].value == 10)) {
                card = stack[i];
                break;
            }
        }
        return card;
    }

    getFirstPlayableRegular(stack) {
        let card = null;
        for (var i = 0; i < stack.length; i++) {
            if (this.cardCheck(stack[i]) && stack[i].value != 2 && stack[i].value != 9 && stack[i].value != 10) {
                card = stack[i];
                break;
            }
        }
        return card;
    }

    draw(endCount) {
        while (this.playerCards.hand.length < endCount && this.deck.cards.length > 0) {
            this.playerCards.draw();
        }
    }

    startPlayerTurn() {
        this.draw(4);
    }

    endPlayerTurn() {
        if (this.playerCards.hand.length == 0 && this.playerCards.up.length == 0 && this.playerCards.down.length == 0) {
            this.game.winOrder.push(this);
            console.log('Player "' + this.name + '" takes place: ' + this.game.winOrder.length);
        }
        this.game.playCount++;
        this.draw(3);
        this.game.currentPlayerIndex = (this.game.currentPlayerIndex == this.game.players.length - 1) ? 0 : this.game.currentPlayerIndex + 1;
        while (this.game.winOrder.indexOf(this.game.players[this.game.currentPlayerIndex]) != -1) {
            this.game.currentPlayerIndex = (this.game.currentPlayerIndex == this.game.players.length - 1) ? 0 : this.game.currentPlayerIndex + 1;
        }
        if (this.game.winOrder.length == this.game.players.length -1) {
            this.game.gameOver = true;
            this.game.winOrder.push(this.game.players[this.game.currentPlayerIndex]);
            console.log('Game over. Win order:');
            for (var i = 0; i < this.game.winOrder.length; i++) {
                console.log ('Place ' + (i + 1) + ': "' + this.game.winOrder[i].name + '"');
            }
            console.log('Game completed in ' + this.game.playCount + ' turns.');
        } else if (this.game.players[this.game.currentPlayerIndex].isNPC) {
            this.game.players[this.game.currentPlayerIndex].startPlayerTurn();
            this.game.playNPC();
        } else {
            this.game.players[this.game.currentPlayerIndex].startPlayerTurn();
        }
    }

    playCard(card, stack) {
        let bombed = false;
        let hasMultiples = false;

        if (this.cardCheck(card)) {
            console.log('PLAY: "' + this.name + '" plays: ' + card.display + ' of ' + card.suit + ' -- H' + this.playerCards.hand.length + ' U' + this.playerCards.up.length +' D' + this.playerCards.down.length);
            
            this.game.playCards.push(card);
            stack.splice(stack.indexOf(card), 1);
            this.game.setPreviousCardPlayer(this);
            
            if (card.value == 10) {
                this.game.burnPlayCards();
                bombed = true;
            } else {
                bombed = this.game.checkQuads();
            }

            hasMultiples = this.checkMultiples(card);

            if (this.checkNoCards()) {
                this.endPlayerTurn();
                return false;
            }
            
            this.draw(3);
            return bombed || hasMultiples;
        } else {
            return false;
        }
    }

    cardCheck(cardB) {
        let cardA = (this.game.playCards.length) ? this.game.playCards[this.game.playCards.length - 1] : false;
        // Multiple check
        if (cardA && this.game.previousWasPlayer(this) && cardA.value != cardB.value && cardB.value != 10) {
            return false;
        }
        // Free play or power card, card can be played
        if (!cardA || cardB.value == 2 || cardB.value == 9 || cardB.value == 10) {
            return true;
        } else {
            // Card to beat is standard, regular greater-than check
            if (cardA.value != 9) {
                return cardB.value >= cardA.value;
            } else {
                // Card to beat is a 9. Less-than comparison to previous card (or current if it is only in playCard stack)
                if (this.game.playCards.length > 1) {
                    // Compare to card preceding 9
                    return cardB.value <= this.game.playCards[this.game.playCards.length - 2].value;
                } else {
                    // Compare to 9 card
                    return cardB.value <= cardA.value;
                }
            }
        }
    }
}

var game = new LuckyBastard('BJ', 4);

game.start();

console.log(game);