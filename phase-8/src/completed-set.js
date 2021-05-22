import Hand from './hand'
import Card from './card'

class CompletedSet extends Hand {
  constructor(app, cards, validate, options) {
    super(app, Object.assign(
      {show:true, owned: false, scale: 2/3, hasInfo: false},
      options))
    this.validate = validate
    this.expectedCards = cards


    let set = this

    //TODO memory leak here?
    app.client.registerDraggingListener((status, card) => {
      let first = set.cards[0]
      let last = set.cards[set.cards.length - 1]
      if(status == 'set') first.texture = last.texture = Card.HALO
      else {
        set.cards.forEach(card => card.resetTexture())
      }
    })
  }

  hitFrom(hand, card) {
    let {id, type, color} = card
    if (
      this.expectedCards.some(card => card.id == id) || 
      this.validate(this.cards.concat(card))
    ) {
      let card = hand.removeCard(id)
      let set = this
      card.onClick = _ => app.client.completeHit(set.index)
      this.draw(card, false)

      this.updateDropHandlers()
    } else { 
    }
  }


  hitLeft(card) {
    this.app.client.hitLeft(card, this.index)

  }

  hitRight(card) {
    this.app.client.hitRight(card, this.index)

  }


  updateDropHandlers() {
    for(let i = 0; i < this.cards.length; i++) {
      let card = this.cards[i]
      card.alpha = 1
      if (i == 0) {
        card.isDropTarget = true
        card.onDrop = this.hitLeft.bind(this)

      }
      else if (i == this.cards.length - 1) {
        card.isDropTarget = true
        card.onDrop = this.hitRight.bind(this)

      } else {
        card.isDropTarget = false
      }
      
    }
  }
}

export default CompletedSet
