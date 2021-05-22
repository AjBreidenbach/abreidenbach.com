import GameState from './game-state'
import Deck from './deck'

async function loadLib() {
  let src = await fetch('/lib.js')
  .then(res => res.text());

  (0, eval(src))
}

class GameClient {

  constructor() {
    this.callbacks = []
    
    let client = this
    let session
    async function init() {
      await loadLib()
      session = await startMultiplayerSession()
      Object.assign(client, session)
      client.seedGenerator = getSeedGenerator(client.roomId)
      let seed = client.seedGenerator()
      client.rng = rng32(seed)
      client.ready = true
    }

    init().then(() => {
      client.callbacks.forEach(cb => cb(client))

      session.onAction = function(message) {
        if(client.gameState) {
          let {action, index} = message
          client.gameState.handleAction(action, index)
        }
      }

      delete client.callbacks
    })
    

    
  }


  onReady(f) {
    if (this.callbacks){
      this.callbacks.push(f)
    } else {
      f(this)
    }
  }
  
  setGameState(gameState) {
    this.gameState = gameState
  }


  dispatchEvent(action) {
    if(this.gameState) this.gameState.handleAction(action, this.index)
    this.emitAction(action)
  }
}


import * as PIXI from 'pixi.js'
const {Sprite} = PIXI

class Phase8Client extends GameClient {
  constructor() {
    super()
    this.droppingTargets = []
    this.draggingListeners = []
  }

  setGameState(gameState){
    super.setGameState(gameState)
    let app = this.gameState.app
    let backgroundSprite = new Sprite()
    backgroundSprite.width = 1200
    backgroundSprite.height = 800
    app.stage.addChild(backgroundSprite)
    backgroundSprite.zIndex = -1

    app.stage.interactive = true

    app.stage.on('pointertap', this.onClick.bind(this))

  }

  drawCard(faceUp=true) {
    this.dispatchEvent({
      kind: 'drawCard',
      faceUp
    })
  } 

  onClick(e) {
    let {data} = e
    let {x, y} = data.global

    for(let hand of this.gameState.hands) {
      if (x >= hand.x0 && x <= hand.x1 && y >= hand.y0 && y <= hand.y1) {
        hand.click(data)
      }

    }
  }



  discardCard(id) {
    let discard = { kind: 'discardCard', id }
    let gameState = this.gameState
    let hands = this.gameState.hands
    let client = this
    if(Deck.typeOf(id) == 'S' && hands.length > 1) {
      gameState.setIndicatorText('Select a player to skip')
      for(let i in hands) {
        let hand = hands[i]
        if (i == this.index) continue

        if(hands.length == 2){
          client.dispatchEvent({kind: 'skipIntent', target: i})
          client.dispatchEvent(discard)
        }
        else {
        hand.onClick = (_ => {
          client.dispatchEvent({kind: 'skipIntent', target: i})
          //gameState.skipIntent[client.index] = i
          hands.forEach(hand => hand.onClick = null)
          client.dispatchEvent(discard)
        })
        }
      }

    }
    else this.dispatchEvent(discard)
  }

  endTurn() {
    this.dispatchEvent({
      kind: 'endTurn'
    })
  }

  //layPhase(cards) {
  layPhase() {
    let sets = this.gameState.stageAreas.map(sa => sa.cards.filter(card => card.id != -1).map(card => card.toSimpleRepr()))
    for(let stageArea of this.gameState.stageAreas) {
      stageArea.reset(false)
    }
    this.dispatchEvent({
      kind: 'layPhase',
      sets
    })
  }

  initiateHit(cards) {
    this.hittingCards = cards
  }

  completeHit(setIndex) {
    if(!this.hittingCards) return
    this.dispatchEvent({
      kind: 'hit',
      cards: this.hittingCards,
      setIndex
    })
    delete this.hittingCards
  }


  hit(card, direction, setIndex) {
    this.dispatchEvent({kind: 'hit', direction, cards: [card.toSimpleRepr()], setIndex})
  }


  hitLeft(card, setIndex) {
    this.hit(card, 'left', setIndex)

  }

  hitRight(card, setIndex) {
    this.hit(card, 'right', setIndex)

  }

  join() {
    for(let i = 0; i < this.index; i++) {
      this.gameState.handleAction({kind:'joined'}, i)
    }
    
    this.dispatchEvent({
      kind: 'joined'
    })
    //this.gameState.beginRound()
  }

  setDraggingTarget(card) {
    this.draggingTarget = card
    for (let listener of this.draggingListeners) {
      listener('set', card)
    }
  }

  hasDraggingTarget() {
    return !!this.draggingTarget
    
  }


  registerDraggingListener(listener) {
    if (typeof listener == 'function') this.draggingListeners.push(listener)
  }

  deleteDraggingListener(listener) {
    this.draggingListeners = this.draggingListeners.filter(_listener => listener !== _listener)
  }


  get playerHand() {
    return this.gameState.hands[this.index]
  }

  dropDraggingTarget() {
    if(this.droppingTargets.length == 1) {
      let onDrop = this.droppingTargets[0].onDrop
      if (typeof onDrop == 'function') onDrop(this.draggingTarget)
      this.droppingTargets.length = 0
    }
    for (let listener of this.draggingListeners) {
      listener('drop', card)
    }
    this.draggingTarget = null
  }

  setDroppingTarget(card) {
    this.droppingTargets.push(card)
  }

  removeDroppingTarget(card) {
    this.droppingTargets = this.droppingTargets.filter(_card => card !== card)
  }


}


export default Phase8Client
