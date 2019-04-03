
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
        this.winOrder = [];
        this.gameOver = false;
        this.playCount = 0;

        this.npcNames = [
            'Joe T',
            'Jake',
            'Mike',
            'BJ',
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

        if (this.players[this.currentPlayerIndex].isNPC) {
            this.playNPC();
        } else {
            this.players[this.currentPlayerIndex].startPlayerTurn();
        }
    }

    playNPC(previousWasMultiple) {
        let currentPlayer = this.players[this.currentPlayerIndex];
        let cardPlayed = false;
        let bombed = false;

        if (!previousWasMultiple) {
            currentPlayer.startPlayerTurn();            
        }

        if (currentPlayer.playerCards.hand.length > 0 || currentPlayer.playerCards.up.length > 0) {
            let playerCards = (currentPlayer.playerCards.hand.length > 0) ? currentPlayer.playerCards.hand : currentPlayer.playerCards.up
            let playSuccess = false;
            for (var i = 0; i < playerCards.length; i++) {
                let card = playerCards[i];
                if (currentPlayer.cardCheck(card, previousWasMultiple) && card.value != 2 && card.value != 9 && card.value != 10) {
                    currentPlayer.playCard(card, playerCards);
                    cardPlayed = card;
                    playSuccess = true;
                    break;
                }
            }
            if (!playSuccess) {
                for (var i = 0; i < playerCards.length; i++) {
                    let card = playerCards[i];
                    if (currentPlayer.cardCheck(card, previousWasMultiple) && (card.value == 2 || card.value == 9 || card.value == 10)) {
                        currentPlayer.playCard(card, playerCards);
                        cardPlayed = card;
                        playSuccess = true;
                        break;
                    }
                }
            }
            if (!playSuccess) {
                console.log('Player "' + currentPlayer.name + '" picks up the play stack. (' + this.playCards.length +' cards)');
                currentPlayer.playerCards.hand = currentPlayer.playerCards.hand.concat(this.playCards);
                this.playCards = [];
            }
        }

        if (currentPlayer.playerCards.hand.length == 0 && currentPlayer.playerCards.up.length == 0 && currentPlayer.playerCards.down.length > 0) {
            let playerCards = currentPlayer.playerCards.down;
            let randomCard = playerCards[Math.floor(Math.random() * playerCards.length)];
            if (currentPlayer.cardCheck(randomCard, previousWasMultiple)) {
                currentPlayer.playCard(randomCard, playerCards);
                cardPlayed = randomCard;
            } else {
                console.log('Player "' + currentPlayer.name + '" picks up the play stack. (' + this.playCards.length +' cards)');
                currentPlayer.playerCards.hand = currentPlayer.playerCards.hand.concat(this.playCards);
                currentPlayer.playerCards.hand.push(randomCard);
                playerCards.splice(playerCards.indexOf(randomCard), 1);
                this.playCards = [];
            }
        }

        if (this.playCards.length > 3
            && this.playCards[this.playCards.length-2].value == this.playCards[this.playCards.length-1].value 
            && this.playCards[this.playCards.length-3].value == this.playCards[this.playCards.length-1].value 
            && this.playCards[this.playCards.length-4].value == this.playCards[this.playCards.length-1].value) {
                console.log('Quad bomb! Play stack to the burn pile.');
                this.burnCards = this.burnCards.concat(this.playCards);
                this.playCards = [];
                bombed = true;
            }

        let hasMultiples = currentPlayer.checkMultiples(cardPlayed);
        if (cardPlayed && (cardPlayed.value == 10 || hasMultiples || bombed) && !currentPlayer.checkNoCards()) {
            currentPlayer.draw(3);
            this.playNPC(hasMultiples);
        } else {
            currentPlayer.endPlayerTurn();
        }
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

    checkNoCards() {
        return this.playerCards.hand == 0 && this.playerCards.up == 0 && this.playerCards.down == 0;
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
            this.game.playNPC();
        }
    }

    playCard(card, stack) {
        if (this.cardCheck(card)) {
            console.log('Player "' + this.name + '" plays: ' + card.display + ' of ' + card.suit + ' -- H' + this.playerCards.hand.length + ' U' + this.playerCards.up.length +' D' + this.playerCards.down.length);
            this.game.playCards.push(card);
            stack.splice(stack.indexOf(card), 1);
            if (this.game.playCards.length > 1 && this.game.playCards[this.game.playCards.length - 1].value < this.game.playCards[this.game.playCards.length - 2].value && this.game.playCards[this.game.playCards.length - 1].value != 2 && this.game.playCards[this.game.playCards.length - 1].value != 9 && this.game.playCards[this.game.playCards.length - 1].value != 10 && this.game.playCards[this.game.playCards.length - 2].value != 9) {
                console.log('POSSIBLE ISSUE?');
                console.log('Card Played: ' + this.game.playCards[this.game.playCards.length - 1].display);
                console.log('Previous Played: ' + this.game.playCards[this.game.playCards.length - 2].display);
            }
            if (card.value == 10) {
                this.game.burnCards = this.game.burnCards.concat(this.game.playCards);
                this.game.playCards = [];
                return false;
            }
            this.draw(3);
            return true;
        } else {
            return false;
        }
    }

    cardCheck(cardB, previousWasMultiple) {
        let cardA = (this.game.playCards.length) ? this.game.playCards[this.game.playCards.length - 1] : false;
        // Free play or power card, card can be played
        if (cardA && previousWasMultiple && cardA.value != cardB.value) {
            return false;
        }
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

var game = new LuckyBastard(false, 4);

game.start();

console.log(game);