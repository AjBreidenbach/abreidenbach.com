import Hand from './hand'

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
    } else { 
    }
  }


}

export default CompletedSet
