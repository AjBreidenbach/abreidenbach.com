import Hand from './hand'
import Card from './card'
import * as PIXI from 'pixi.js'


const {Sprite} = PIXI

class PhaseStage extends Hand {

  constructor(app, options) {
    super(app, Object.assign({
      rows: 1,
      setDescription: 'No description provided',
      numSlots: 4,
      scale: 0.6,
      paddingTop: 0,
      show: true
    },
    options))

    this.app = app


    this.cardOptions = {moveable: false, selectable: false, isFaceUp: true, scale: this.scale}
    this.info.alpha = 0

    let phaseStage = this


    this.attachCancelButton()


    let client = app.client

    client.registerDraggingListener((eventType, card) => {
      if (eventType == 'set') {
        this.info.alpha = 1
      } else {this.info.alpha = 0}
    })

    for(let i = 0; i < this.numSlots; i++) {
      let placeholder = Card.placeholder(app)
      placeholder.alpha =  placeholder.defaultAlpha = 0

      placeholder.onDrop = function(_card) {
        if (_card.type == 'S') return
        placeholder.alpha =  0
        placeholder.zIndex = 0
        //app.stage.removeChild(placeholder.sprite)
        //placeholder.sprite.removeAllListeners()
        let droppedCard = client.playerHand.removeCard(_card.id)
        droppedCard.onClick = _ => {
          client.playerHand.draw(phaseStage.cards[i])
          client.playerHand.positionCards()
          placeholder.zIndex = 2
          phaseStage.insertCard(placeholder, i)
          phaseStage.positionCards()
          droppedCard.onClick = null

        }
        droppedCard.zIndex = 3
        phaseStage.insertCard(droppedCard, i)
        phaseStage.positionCards()

      }

      let listener = (eventType, _) => {
        if (eventType == 'set') placeholder.alpha =  1
        else placeholder.alpha =  0
      }

      placeholder.listener = listener


      client.registerDraggingListener(listener)

      
      /*

      placeholder.sprite.on('mouseover', _ => {
        placeholder.alpha =  0
        client.setDroppingTarget(placeholder)
      })
      placeholder.sprite.on('mouseout', _ => {
        placeholder.alpha =  client.hasDraggingTarget()? 1 : 0
        client.removeDroppingTarget(placeholder)}
      )

      */
      this.addCard(placeholder)
    }


    this.placeholders = this.cards.slice()

    this.positionCards(false)
  }
  

  remove() {
    let stage = this.app.stage, client = this.app.client
    stage.removeChild(this.cancelButton)
    for(let placeholder of this.placeholders) {
      //stage.removeChild(placeholder)
      client.deleteDraggingListener(placeholder.listener)
    }
    this.removeSprites()
  }

  attachCancelButton() {
    let phaseStage = this
    this.cancelButton = new Sprite(this.app.loader.resources['cancel'].texture)
    this.app.stage.addChild(this.cancelButton)
    this.cancelButton.on('click', phaseStage.reset.bind(phaseStage))
    this.cancelButton.interactive = true
    this.cancelButton.width = 50
    this.cancelButton.height = 50
    this.cancelButton.x = this.x1
    this.cancelButton.y = Math.floor((this.y1 + this.y0) / 2)
    this.cancelButton.alpha = 0
  }

  getMessage() {return this.setDescription}

  reset(animate=true) {
    let modified = false
    for(let i = 0; i < this.cards.length; i++) {
      if(this.cards[i].id != -1) {
        modified = true
        this.app.client.playerHand.draw(this.cards[i])
        let placeholder = this.placeholders[i]
        placeholder.zIndex = 2
        this.insertCard(placeholder, i)
      }
    }

    if (modified) {
      this.app.client.playerHand.positionCards(animate)
      this.positionCards(false)
    }


  }


  positionCards() {
    //let {cards} = this
    
    if (this.cards.some(card => card.id >= 0)) {
      this.cancelButton.alpha = 1
    } else {
      this.cancelButton.alpha = 0
    }
    super.positionCards.apply(this, arguments)
  }

}


export default PhaseStage
