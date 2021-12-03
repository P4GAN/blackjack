const suitList = ["clubs", "diamonds", "hearts", "spades"];
const rankList = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

class Deck {
    constructor() {
        this.deckList = [];
        this.deckNumber = 8;
        for (let n = 0; n < this.deckNumber; n++) {
            for (let i = 0; i < suitList.length; i++) {
                for (let j = 0; j < rankList.length; j++) {
                    let newCard = new Card(suitList[i], rankList[j]);
                    this.deckList.push(newCard);
                } 
            }
        }
        this.deckList.push(new Card("clubs", "A"), new Card("spades", "A"))
        //this.shuffle();
    }
    shuffle() {
        for (let i = 0; i < this.deckList.length; i++) {
            let randomIndex = Math.floor(Math.random() * this.deckList.length);
            let swapA = this.deckList[i];
            let swapB = this.deckList[randomIndex];
            this.deckList[i] = swapB;
            this.deckList[randomIndex] = swapA;
        }
    }
    pickCard() {
        if (this.deckList.length > 0) {
            return this.deckList.pop();
        }
    }
    /*pickCards(amount) {
        let cards = [];
        if (amount <= this.deckList.length) {
            for (let i = 0; i < amount; i++) {
                cards.push(this.deckList.pop());
            }
        }
        return cards;
    }*/

}

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

}
 
module.exports = {
    Deck,
    Card
}