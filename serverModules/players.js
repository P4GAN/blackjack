class Player {
    constructor(name, money, id) {
        this.name = name;
        this.money = money;
        this.bet = 10;
        this.hands = [];
        this.currentHandIndex = 0;
        this.id = id;
    }

}

class Dealer extends Player {
    constructor() {
        super("Dealer", Number.MAX_VALUE, "Dealer");
        this.hidden = true;
    }
}

class Hand {
    constructor() {
        this.cards = [];
        this.sum = 0;
        this.bust = false;
        this.isBlackjack = false;
    }
    hit(newCard) {
        this.cards.push(newCard);
        if (newCard.rank == "A") {
            this.sum += 11;
            if (this.cards.length == 2 && this.sum == 21) {
                this.isBlackjack = true;
            }
        }
        else if (newCard.rank == "10" || newCard.rank == "J" || newCard.rank == "Q" || newCard.rank == "K") {
            this.sum += 10;
            if (this.cards.length == 2 && this.sum == 21) {
                this.isBlackjack = true 
            }
        }
        else {
            this.sum += parseInt(newCard.rank);
        }
        if (this.sum > 21) {
            for (let i = 0; i < this.cards.length; i++) {
                if (this.cards[i].rank == "A") {
                    this.sum -= 10;
                    break;
                }
            }
            this.bust = true;
        }
    }
    split() {
        splitCard = this.currentPlayer.hands[currentPlayer.currentHandIndex].cards.pop();

        if (splitCard.rank == "A") {
            this.sum -= 11;
            if (this.sum <= 11) {
                this.sum += 10;
            }
        }
        else if (newCard.rank == "10" || newCard.rank == "J" || newCard.rank == "Q" || newCard.rank == "K") {
            this.sum -= 10;
        }
        else {
            this.sum -= parseInt(splitCard.rank);
        }

        splitHand = new players.Hand();
        splitHand.hit(splitCard);
        return splitHand
        
    }
}

module.exports = {
    Player,
    Dealer,
    Hand
}