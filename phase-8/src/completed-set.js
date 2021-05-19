import Hand from './hand'

class CompletedSet extends Hand {
  constructor(app, cards, setDescriminator, options) {
    super(app, Object.assign(
      {show:true, owned: false, scale: 2/3},
      options))
    this.setDescriminator = setDescriminator
    this.expectedCards = cards


    for (let card of cards) {
      console.assert(this.setDescriminator(this.cards, card.color, card.type), {cards, color: card.color, type: card.type})
    }


    //this.cardOptions = {moveable: false, selectable: false, scale: 0.6}
  }

  hitFrom(hand, color, type) {
    if (this.setDescriminator(this.cards, color, type)) {
      let card = hand.removeCard(color, type)
      let set = this
      card.onClick = _ => app.client.completeHit(set.index)
      //card.deselect()
      this.draw(card, false)
    } else { }
  }


}

export default CompletedSet
