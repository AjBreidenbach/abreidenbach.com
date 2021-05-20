import Card from './card'


const DRAW_PILE_FACE_UP_OPTIONS   = {moveable: false, selectable: false}
const DRAW_PILE_FACE_DOWN_OPTIONS = {moveable: false, selectable: false}

class DrawPile {

  constructor(app, deck, options) {
    this.faceUpPile = []
    this.deck = deck
    this.app = app
    Object.assign(this, {
      x0: 500,
      y0: 0,
      x1: 760,
      y1: 150,
    }, options)

    //let [color, type] = deck.draw()
    let faceUpTop = new Card(app, deck.draw(), DRAW_PILE_FACE_UP_OPTIONS)
    faceUpTop.zIndex = 1
    faceUpTop.moveTo(this.x0, this.y0, false)
    //this.faceUpPile.push(faceUpTop)
    //let [color0, type0] = deck.draw()
    this.faceDown = new Card(app, deck.draw(), DRAW_PILE_FACE_DOWN_OPTIONS)
    let client = this.app.client
    this.faceDown.onClick = _ => client.drawCard(false)
    window.faceDown = this.faceDown


    let placeholder = Card.placeholder()
    placeholder.moveTo(this.x1 - 150, this.y0, false)
    this.pushFaceUp(placeholder, false)
    this.pushFaceUp(faceUpTop, false)
    this.positionDrawPile() 

  }


  removeSprites() {
    let stage = this.app.stage
    for(let card of this.faceUpPile) {
      stage.removeChild(card.sprite)
    }

    stage.removeChild(this.faceDown.sprite)
  }


  positionDrawPile() {

    this.faceDown.moveTo(this.x0, this.y0, false)
    let faceUpTop = this.faceUpPile[this.faceUpPile.length - 1]
    if(faceUpTop) {
      faceUpTop.sprite.width = 100
      faceUpTop.sprite.height = 150
      faceUpTop.moveTo(this.x1 - 150, this.y0, true, 20)
      faceUpTop.faceUp(true)
    }

  }

  popFaceUp() {
    let card = this.faceUpPile.pop()
    card.isDropTarget = false
    card.onClick = null
    return card
  }


  pushFaceUp(card, reposition=true) {

    let client = this.app.client
    card.isDropTarget = true
    card.onDrop = function (_card) {

      client.discardCard(_card.id)
    }

    card.onClick = _ => client.drawCard(true)
    card.zIndex = this.faceUpPile.length + 2
    Object.assign(card, DRAW_PILE_FACE_UP_OPTIONS)
    this.faceUpPile.push(card)
    if(reposition) this.positionDrawPile()

  }

  deal(hand, n = 10, reposition=false) {
    for(let i = 0; i < n; i++) {
      //let [color, type] = this.deck.draw()
      let cardId = this.deck.draw()
      let card = new Card(this.app, cardId)
      if (reposition) card.moveTo(this.x0, this.y0, false)
      hand.draw(card, reposition)
      
      //hand.drawFrom(this)
    }
  }

}

export default DrawPile
