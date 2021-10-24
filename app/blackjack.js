const suitList = ["clubs", "diamonds", "hearts", "spades"];
const rankList = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

class Deck {
    constructor() {
        this.deckList = [];
        for (let i = 0; i < suitList.length; i++) {
            for (let j = 0; j < rankList.length; j++) {
                let newCard = Card(suitList[i], rankList[j]);
                this.deckList.push(newCard);
            } 
        }
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

}

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
}
 