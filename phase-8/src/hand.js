import Card from './card'
import * as PIXI from 'pixi.js'

const {Text} = PIXI

class Hand {
  constructor (app, options) {
    Object.assign(this, {
      owned: false,
      x0: 0,
      x1: 440,
      y0: 0,
      y1: 506,
      rows: 3,
      scale: 1,
      hasInfo: true
    }, options)

    this.cards = []
    this.app = app


    if(!this.fontSize) this.fontSize = 24 * this.scale

    this.cardOptions = {moveable: this.owned, selectable: this.owned, scale: this.scale, draggable: this.owned}


    if (this.hasInfo) {
      this.info = new Text()
      this.info.x = this.x0
      this.info.y = this.y0
      this.info.style.fontSize = this.fontSize
      if(this.__proto__.constructor.name == 'Hand') {
        this.phase = 1
        this.score = 0
      }
      this.setText()
      app.stage.addChild(this.info)
    }
    
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


  click(data) {
    if (typeof this.onClick == 'function') this.onClick(data)
  }

  setText() { this.info.text = this.getMessage()}
  setScore(score) { this.score = score; this.setText() }
  setPhase(phase) { this.phase = phase; this.setText() }

  getMessage() {return `Player ${this.player}, phase ${this.phase} (${this.score} pts)` }

  removeSprites() {
    for (let card of this.cards) {
      this.app.stage.removeChild(card.sprite)
      if(this.hasInfo)
        this.app.stage.removeChild(this.info)
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
      if (selected && selected.length == 1) {
        let card = selected[0]
        client.discardCard(card.id)
      }
    })


    function simpleRepr(card) {return {id: card.id, color: card.color, type: card.type}}
    function idRepr(card) {return card.id}

    keyboardHandler.registerHandler('KeyP', () => {
      //console.log('here')
      //let selected = this.getSelected()
      //if(selected) {
        //client.layPhase(selected.map(simpleRepr))
      //}
      

      client.layPhase()
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

  addCard(card) {
    if (typeof card == 'number') 
      this.cards.push(new Card(this.app, card, this.cardOptions))
    //else this.cards.push(card)
    else this.cards.push(Object.assign(card, this.cardOptions))
  }

  insertCard(_card, i) {
    let card = typeof _card == 'number'?
      new Card(this.app, _card, this.cardOptions) :
      Object.assign(_card, this.cardOptions)

    this.cards[i] = card

  }

  draw(card, reposition=false) {
    this.addCard(card) //
    card.zIndex = 0
    /*
    Object.assign(card, this.cardOptions)
    this.cards.push(card)
    */
    if (reposition) {
      this.positionCards(true)
    }
  }

  drawFrom(drawPile, reposition=false) {
    console.error(drawFrom)
    let deck = drawPile.deck
    //let [color, type] = deck.draw()
    let cardId = deck.draw()
    //console.log({drawPile, deck})
    if (reposition) {
      let card = new Card(this.app, cardId, this.cardOptions)
      card.moveTo(drawPile.x0, drawPile.y0, false)
      this.cards.push(card)
      this.positionCards(true)
    } else {
      this.addCard(cardId)
    }
  }

  positionCards(animate=true, baseVelocity=12) {
    let colSize = Math.ceil(this.cards.length / this.rows)

    let y0 
    if (this.hasInfo) { 
      if (this.paddingTop !== null && this.paddingTop !== undefined) y0 = this.y0 + this.paddingTop
      else y0 = this.y0 + this.fontSize * 1.5 
    }
    else { y0 = this.y0 }

    let deltaX  = Math.min(125 * this.scale,  (this.x1 - this.x0) / colSize)
    let deltaY  = (this.y1 - y0) / this.rows
    let x = this.x0, y = y0
    for (let i = 0; i < this.cards.length; i++) {
      let card = this.cards[i]
      if (i != 0 && i % colSize == 0) {
        y += deltaY
        x = this.x0
      }

      card.moveTo(x,y, animate, baseVelocity)

      if((this.show || this.owned) != card.isFaceUp) {
        card.flip()
      }
      

      x += deltaX
    }
  }

  removeCard(id) {
    //console.log('removeCard', this, {color,type})
    let index = this.cards.findIndex(card => card.id == id)

    if(index == -1) return
    let removed = this.cards[index]
    removed.deselect()
    this.cards = this.cards.filter((c, _index) => index != _index)
    return removed
  }

  discardCard(id, drawPile) {
    /*
    let index = this.cards.findIndex(card => card.color == color && card.type == type)
    
    if(index == -1) return
    
    let discarded = this.cards[index]
    discarded.scale = 1

    drawPile.pushFaceUp(discarded)

    this.cards = this.cards.filter((c, _index) => index != _index)
    */
    let discarded = this.removeCard(id)
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
