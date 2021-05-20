import Hand from './hand'
import Card from './card'

class CompletedSet extends Hand {
  constructor(app, cards, setDescriminator, options) {
    super(app, Object.assign(
      {show:true, owned: false, scale: 2/3, hasInfo: false},
      options))
    this.setDescriminator = setDescriminator
    this.expectedCards = cards


    for (let card of cards) {
      console.assert(this.setDescriminator(this.cards, card.color, card.type), {cards, color: card.color, type: card.type})
    }


    //this.cardOptions = {moveable: false, selectable: false, scale: 0.6}

    let set = this

    //TODO memory leak here?
    app.client.registerDraggingListener((status, card) => {
      let first = set.cards[0]
      let last = set.cards[set.cards.length - 1]
      if(status == 'set') first.texture = last.texture = Card.HALO
      else {
        set.cards.forEach(card => card.resetTexture())
        //first.resetTexture()
        //last.resetTexture()
      }
    })
  }

  hitFrom(hand, card) {
    let {id, type, color} = card
    if (
      this.expectedCards.some(card => card.id == id) || 
      this.setDescriminator(this.cards, color, type)
    ) {
      let card = hand.removeCard(id)
      let set = this
      card.onClick = _ => app.client.completeHit(set.index)
      //card.deselect()
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
