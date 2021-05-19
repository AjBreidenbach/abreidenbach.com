import Card from './card'
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

    let [color, type] = deck.draw()
    let faceUpTop = new Card(app, color, type)
    faceUpTop.zIndex = 1
    faceUpTop.moveTo(this.x0, this.y0, false)
    //this.faceUpPile.push(faceUpTop)
    let [color0, type0] = deck.draw()
    this.faceDown = new Card(app, color0, type0)


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
    card.onClick = null
    return card
  }


  pushFaceUp(card, reposition=true) {
    card.sprite.zIndex = this.faceUpPile.length
    this.faceUpPile.push(card)
    if(reposition) this.positionDrawPile()
    card.onClick = console.log

  }

  deal(hand, n = 10, reposition=false) {
    for(let i = 0; i < n; i++) {
      let [color, type] = this.deck.draw()
      let card = new Card(this.app, color, type)
      if (reposition) card.moveTo(this.x0, this.y0, false)
      hand.draw(card, reposition)
      
      //hand.drawFrom(this)
    }
  }

}

export default DrawPile
