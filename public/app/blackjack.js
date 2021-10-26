const suitList = ["clubs", "diamonds", "hearts", "spades"];
const rankList = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

const cardImages = {};

for (let i = 0; i < suitList.length; i++) {
    for (let j = 0; j < rankList.length; j++) {
        let cardImage = new Image();
        let cardName = suitList[i] + rankList[j];
        cardImage.src = "/images/cards/" + cardName + ".png";
        cardImages[cardName] = cardImage;
    } 
}

class Deck {
    constructor() {
        this.deckList = [];
        for (let i = 0; i < suitList.length; i++) {
            for (let j = 0; j < rankList.length; j++) {
                let newCard = new Card(suitList[i], rankList[j]);
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
    getImage() {
        let cardName = this.suit + this.rank;
        return cardImages[cardName];
    }
}
 