import GameState from './game-state'

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


class Phase8Client extends GameClient {
  constructor() {
    super()
    this.droppingTargets = []
    this.draggingListeners = []
  }

  drawCard(faceUp=true) {
    this.dispatchEvent({
      kind: 'drawCard',
      faceUp
    })
  } 

  discardCard(id) {
    this.dispatchEvent({
      kind: 'discardCard',
      id
      //color, type
    })
  }

  endTurn() {
    this.dispatchEvent({
      kind: 'endTurn'
    })
  }

  layPhase(cards) {
    this.dispatchEvent({
      kind: 'layPhase',
      cards
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

  join() {
    for(let i = 0; i < this.index; i++) {
      this.gameState.handleAction({kind:'joined'}, i)
    }

    
    
    this.dispatchEvent({
      kind: 'joined'
    })
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
