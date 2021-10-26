console.log("test");

const socket = io.connect()

const gameCanvas = document.getElementById("gameCanvas");
const context = gameCanvas.getContext("2d");

let frameInterval = 20;

//const gameInterval = setInterval(gameUpdate, frameInterval);

const cardHeight = 64;
const cardWidth = 49;

const deck = new Deck();
deck.shuffle();

gameCanvas.addEventListener('click', function(event) {
    socket.emit("draw", [event.offsetX, event.offsetY]);
    console.log("skjks");

    context.beginPath();
    context.rect(event.offsetX, event.offsetY, 50, 50);
    context.fillStyle = "red";
    context.fill();

})

socket.on("serverDraw", function(pos) {
    console.log("te");
    console.log(pos);
    context.beginPath();
    context.rect(pos[0], pos[1], 50, 50);
    context.fillStyle = "red";
    context.fill();
})


/*function gameUpdate() {
    context.fillStyle = "grey";
    context.fillRect(0, 0, gameCanvas.width, gameCanvas.height);

    let card = deck.deckList[0];
    context.drawImage(card.getImage(), 0, 0, cardWidth, cardHeight);

}*/