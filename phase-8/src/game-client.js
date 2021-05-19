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
    console.log('initiateHit')
    this.hittingCards = cards
  }

  completeHit(setIndex) {
    console.log('completeHit')
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

}


export default Phase8Client
