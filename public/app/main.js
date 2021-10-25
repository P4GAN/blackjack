console.log("test");

const gameCanvas = document.getElementById("gameCanvas");
const context = gameCanvas.getContext("2d");

let frameInterval = 20;

const gameInterval = setInterval(gameUpdate, frameInterval);

const cardHeight = 64;
const cardWidth = 49;

const deck = new Deck();
deck.shuffle();

function gameUpdate() {
    context.fillStyle = "grey";
    context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    let card = deck.deckList[0];
    context.drawImage(card.getImage(), 0, 0, cardWidth, cardHeight);

}