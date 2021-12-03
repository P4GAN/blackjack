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

class Bot extends Player {
    constructor(botCount, standValue) {
        super("Bot" + botCount, 100, "Dealer" + botCount);
        this.bot = true;
        this.standValue = standValue;
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
        this.sum = this.findSum();
        if (newCard.rank == "A") {
            if (this.cards.length == 2 && this.sum == 21) {
                this.isBlackjack = true;
            }
        }
        else if (newCard.rank == "10" || newCard.rank == "J" || newCard.rank == "Q" || newCard.rank == "K") {
            if (this.cards.length == 2 && this.sum == 21) {
                this.isBlackjack = true 
            }
        }
    }
    findSum() {
        let newSum = 0;
        let aceCount = 0;
        for (let i = 0; i < this.cards.length; i++) {
            if (this.cards[i].rank == "A") {
                newSum += 11;
                aceCount += 1
            }
            else if (this.cards[i].rank == "10" ||this.cards[i].rank == "J" || this.cards[i].rank == "Q" || this.cards[i].rank == "K") {
                newSum += 10;
            }
            else {
                newSum += parseInt(this.cards[i].rank);
            }
        }
        if (newSum > 21) {
            for (let j = 0; j < aceCount; j++) {
                newSum -= 10;
                if (newSum <= 21) {
                    break;
                }

            }
        }
        return newSum;
    }
    split() {
        let splitCard = this.cards.pop();
        this.sum = this.findSum();

        let splitHand = new Hand();
        splitHand.hit(splitCard);
        return splitHand
        
    }
}

module.exports = {
    Player,
    Dealer,
    Bot,
    Hand
}