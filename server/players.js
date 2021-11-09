class Player {
    constructor(name, money, joinOrder) {
        this.name = name;
        this.money = money;
        this.hands = [];
        this.joinOrder = joinOrder;
    }

}

class Dealer extends Player {
    constructor() {
        super("DEALER", Number.MAX_VALUE, 0);
        this.dealer = true;
    }
}

class Hand {
    constructor() {
        this.cards = [];
        this.sum = 0;
        this.bust = false;
    }
    hit(newCard) {
        this.cards.push(newCard);
        if (newCard.rank == "A") {
            this.sum += 11;
        }
        else if (newCard.rank == "J" || newCard.rank == "Q" || newCard.rank == "K") {
            this.sum += 10;
        }
        else {
            this.sum += parseInt(newCard.rank);
        }
        if (this.sum > 21) {
            this.bust = true;
        }
    }
}

module.exports = {
    Player,
    Dealer,
    Hand
}