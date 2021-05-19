import Card from './card'

class Hand {
  constructor (app, options) {
    //if (this.__proto__.constructor.name == 'Hand') {
    Object.assign(this, {
      owned: false,
      //orientation: 'ltr',
      x0: 0,
      x1: 440,
      y0: 0,
      y1: 470,
      rows: 3,
      scale: 1
    }, options)
    //}
    this.cards = []
    this.app = app

    this.cardOptions = {moveable: this.owned, selectable: this.owned, scale: this.scale}

    //console.log(options, this)


    if(this.owned) this.registerHandlers()
  }


  getSelected() {
    if (this.owned)
      return this.cards.filter(c => c.isSelected)
  }

  get isOwned() {
    return this.owned
  }

  set isOwned(status) {
    this.owned = status

    this.cardOptions.moveable = status
    this.cardOptions.selectable = status
    //this.cardOptions.isFaceUp = status

    if (status) this.registerHandlers() 
    else {
      this.deselect()
      this.unregisterHandlers() 
    }
  }


  removeSprites() {
    for (let card of this.cards) {
      this.app.stage.removeChild(card.sprite)
    }
  }

  registerHandlers() {
    //console.log(registerHandler)
    let keyboardHandler = this.app.keyboardHandler
    let hand = this
    let client = hand.app.client


    keyboardHandler.registerHandler('KeyC', () => {
      if (keyboardHandler.downKeys['KeyS'])
        hand.orderByColor()
      else hand.cards.forEach(c => c.deselect())
    })

    keyboardHandler.registerHandler('KeyV', () => {
      if (keyboardHandler.downKeys['KeyS'])
        hand.orderByType()
        
    })

    keyboardHandler.registerHandler('KeyD', () => {
      let selected = hand.getSelected()
      //console.log('discard')
      if (selected && selected.length == 1) {
        //console.log(selected)
        let card = selected[0]
        client.discardCard(card.color, card.type)
      }
    })


    function simpleRepr(card) {return {color: card.color, type: card.type}}

    keyboardHandler.registerHandler('KeyP', () => {
      //console.log('here')
      let selected = this.getSelected()
      if(selected) {
        client.layPhase(selected.map(simpleRepr))
      }
      
    })

    keyboardHandler.registerHandler('KeyH', () => {
      let selected = this.getSelected()
      if(selected) {
        client.initiateHit(selected.map(simpleRepr))
      }
    })

    keyboardHandler.registerHandler('Digit2', () => {
      client.drawCard(true)
      // Draw Face UP
    })

    keyboardHandler.registerHandler('Digit1', () => {
      client.drawCard(false)
      // Draw Face DOWN
    })

    



  }

  unregisterHandlers() {
    
    let keyboardHandler = this.app.keyboardHandler

    keyboardHandler.unregisterHandlers('KeyC', 'KeyV', 'Digit1', 'Digit2', 'KeyD', 'KeyP')
  }

  addCard(color, type) {
    this.cards.push(new Card(this.app, color, type, this.cardOptions))
  }

  draw(card, reposition=false) {
    Object.assign(card, this.cardOptions)
    this.cards.push(card)
    if (reposition) {
      this.positionCards(true)
    }
  }

  drawFrom(drawPile, reposition=false) {
    console.error(drawFrom)
    let deck = drawPile.deck
    let [color, type] = deck.draw()
    //console.log({drawPile, deck})
    if (reposition) {
      let card = new Card(this.app, color, type, this.cardOptions)
      card.moveTo(drawPile.x0, drawPile.y0, false)
      this.cards.push(card)
      this.positionCards(true)
    } else {
      this.addCard(color,type)
    }
  }

  positionCards(animate=true, baseVelocity=12) {
    let factor = Math.ceil(this.cards.length / this.rows)
    let deltaX  = (this.x1 - this.x0) / factor
    let deltaY  = (this.y1 - this.y0) / this.rows
    let x = this.x0, y = this.y0
    //console.log({factor})
    for (let i = 0; i < this.cards.length; i++) {
      let card = this.cards[i]
      if (i != 0 && i % factor == 0) {
        y += deltaY
        x = this.x0
      }

      card.moveTo(x,y, animate, baseVelocity)

      if((this.show || this.owned) != card.isFaceUp) {
        card.flip()
      }
      

      x += deltaX//; y += deltaY
    }
  }

  removeCard(color, type) {
    //console.log('removeCard', this, {color,type})
    let index = this.cards.findIndex(card => card.color == color && card.type == type)

    if(index == -1) return
    let removed = this.cards[index]
    removed.deselect()
    this.cards = this.cards.filter((c, _index) => index != _index)
    return removed
  }

  discardCard(color, type, drawPile) {
    /*
    let index = this.cards.findIndex(card => card.color == color && card.type == type)
    
    if(index == -1) return
    
    let discarded = this.cards[index]
    discarded.scale = 1

    drawPile.pushFaceUp(discarded)

    this.cards = this.cards.filter((c, _index) => index != _index)
    */
    let discarded = this.removeCard(color, type)
    discarded.scale = 1
    drawPile.pushFaceUp(discarded)

    this.positionCards(true)
  }

  discardIndex() {
    console.error('unimplemented')

  }


  orderByColor() {
    this.cards.sort((a,b) => a.color.localeCompare(b.color))
    this.positionCards()
  }

  static orderByColor(cards) {}


  orderByType(ignoreWild=false) {
    Hand.orderByType(this.cards, ignoreWild)
    
    this.positionCards()

  }

  static orderByType(cards, ignoreWild=false) {
    function typeOrdering(c) {
      if (typeof c.type == 'string') {
        return c.type.charCodeAt(0)
      } else {return c.type}

    }
    if(ignoreWild) {
      cards.sort((a,b) => {
        let c = typeOrdering(a)
        let d = typeOrdering(b)

        if(c == 87 || d == 87) return 0
        else return c - d
      })
    } else cards.sort((a,b) => typeOrdering(a) - typeOrdering(b))
    
  }
}


export default Hand
