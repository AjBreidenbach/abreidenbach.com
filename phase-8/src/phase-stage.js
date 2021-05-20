import Hand from './hand'
import Card from './card'


class PhaseStage extends Hand {

  constructor(app, options) {
    super(app, Object.assign({
      rows: 1,
      phaseDescription: 'No description provided',
      numSlots: 4,
      //fontSize: 16,
      scale: 0.6,
      paddingTop: 0,
      show: true
    },
    options))

    this.cardOptions = {moveable: false, selectable: false, isFaceUp: true, scale: this.scale}

    this.info.alpha = 0

    let phaseStage = this

    let client = app.client

    client.registerDraggingListener((eventType, card) => {
      if (eventType == 'set') {
        this.info.alpha = 1
      } else {this.info.alpha = 0}
    })

    for(let i = 0; i < this.numSlots; i++) {
      let card = new Card(app, -1)
      card.sprite.texture = Card.HALO
      card.sprite.zIndex = 2
      card.sprite.alpha = 0

      card.onDrop = function(_card) {
        card.sprite.alpha = 0
        card.sprite.zIndex = 0
        //app.stage.removeChild(card.sprite)
        //card.sprite.removeAllListeners()
        let droppedCard = client.playerHand.removeCard(_card.id)
        droppedCard.onClick = _ => {
          client.playerHand.addCard(phaseStage.cards[i])
          client.playerHand.positionCards()
          card.sprite.zIndex = 2
          phaseStage.insertCard(card, i)
          phaseStage.positionCards()
          droppedCard.onClick = null

        }
        droppedCard.sprite.zIndex = 3
        phaseStage.insertCard(droppedCard, i)
        phaseStage.positionCards()
        //client.deleteDraggingListener(listener)

      }

      let listener = (eventType, _) => {
        if (eventType == 'set') card.sprite.alpha = 1
        else card.sprite.alpha = 0
      }

      client.registerDraggingListener(listener)

      

      card.sprite.on('mouseover', _ => {
        card.sprite.alpha = 0
        client.setDroppingTarget(card)
      })
      card.sprite.on('mouseout', _ => {
        card.sprite.alpha = client.hasDraggingTarget()? 1 : 0
        client.removeDroppingTarget(card)}
      )
      //card.onClick = _ => card.flip()
      this.addCard(card)
    }

    this.positionCards(false)
  }
  
  getMessage() {return this.phaseDescription}


  positionCards() {
    let {cards} = this
    super.positionCards.apply(this, arguments)
  }

  
  

}


export default PhaseStage
