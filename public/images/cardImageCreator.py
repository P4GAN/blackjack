from PIL import Image

path = "/Users/parkin.pham/Desktop/epicProgramming/Blackjack/images"

deckImage = Image.open(path + "/Deck.png")

cardHeight = 64
cardWidth = 49

suits = ["clubs", "diamonds", "hearts", "spades"]
ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]

for cardY in range(0, deckImage.height, cardHeight):
    for cardX in range(0, deckImage.width, cardWidth):
        cardImage = Image.new("RGB", (cardWidth, cardHeight), (255, 255, 255))

        for y in range(0, cardHeight):
            for x in range(0, cardWidth):
                pixelValue = deckImage.getpixel((cardX + x, cardY + y))
                cardImage.putpixel((x, y), pixelValue)
        
        suit = suits[int(cardY/cardHeight)]
        rank = ranks[int(cardX/cardWidth)]

        cardImage.save(path + "/cards/" + suit + rank + ".png")

