const COLORS = ['red', 'blue', 'green', 'yellow', null]
const TYPES = [1,2,3,4,5,6,7,8,9,10,11,12,'W','S']

class Deck {

  static colorOf(n) {
    return COLORS[Deck.cardColor(n)]
  }

  static typeOf(n) {
    return TYPES[Deck.cardValue(n)]
  }

  static cardColor(n) {
    return n % 4
    /*
    if (n < 95) {
      return n % 4
    } else {
      return 4
    }
    */
  }

  static cardValue(n) {
    if(n >= 104) {
      return 13
    }
    else {
      return Math.floor(n / 8)
    }
  }


  static isWild(n) {
    return cardValue(n) == 12
  }


  static isSkip(n) {
    return cardValue(n) == 13

  }


  constructor(rng) {
    rng = rng || Math.random
    this.rng = rng
    let cards = []
    for(let i = 0; i < 108; i ++) {
      cards.push([rng(), i])
    }

    cards.sort()
    for(let i = 0; i < 108; i++ ) {
      cards[i] = cards[i][1]
    }
    this.cards = cards
    //console.log(this)
  }

  draw() {
    /*
    let card = this.cards.pop()
    let type = TYPES[Deck.cardValue(card)]
    let color = COLORS[Deck.cardColor(card)] || COLORS[Math.min(Math.floor(this.rng() * 4), 3)]
    return [color, type]
    */
    return this.cards.pop()
  }

  /*
  deal(hand) {
    for(let i = 0; i < 10; i++) {
      hand.drawFrom(this)
    }
  }
  */
}

export default Deck

/*

if(module && !module.parent) {

  const assert = require('assert')

  const expected = [
    0,0,
    1,1,
    2,2,
    3,3,
    4,4,
    5,5,
    6,6,
    7,7,
    8,8,
    9,9,
    10,10,
    11,11,
  ];

  (function countColors() {
    let colorGroups = [[], [], [], []]

    for (let i = 0; i < 108; i++) {
      let
      color = cardColor(i),
        value = cardValue(i)

      if (color == 4) continue

      colorGroups[color].push(value)

    }

    assert.deepEqual(colorGroups[0], expected)
    assert.deepEqual(colorGroups[0], colorGroups[1])
    assert.deepEqual(colorGroups[0], colorGroups[2])


  })();


  (function countWilds() {
    let wilds = 0
    for(let i = 0; i < 108; i++) {
      if (isWild(i)){
        wilds += 1
        assert.equal(cardColor(i), 4)
      }
    }
    assert.equal(wilds, 8)
  })();

  (function countSkips() {
    let skips = 0
    for(let i = 0; i < 108; i++) {
      if (isSkip(i)){
        skips += 1
        assert.equal(cardColor(i), 4)
      }
    }
    assert.equal(skips, 4)
  })();

}
*/
