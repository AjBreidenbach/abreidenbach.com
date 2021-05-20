import DrawPile from './draw-pile'
import Card from './card'
import Hand from './hand'
import Deck from './deck'
import PhaseStage from './phase-stage'
import {phase1} from './phases'
import {dummyApp} from './test'


const OPPONENT_POSITIONS = [
  {
    x0: 750,
    x1: 1150,
    y0: 240,
    y1: 440,
    rows: 2,
    scale: 0.6
  }
  ,{
    x0: 750,
    x1: 1150,
    y0: 0,
    y1: 200,
    rows: 2,
    scale: 0.6
  }
]

const STAGE_AREAS = [
  {
    x0: 0,
    x1: 440,
    y0: 510,
    y1: 610,
  }, {
    x0: 0,
    x1: 440,
    y0: 620,
    y1: 720,
  }
]

// index will be added upon instantiation
const COMPLETED_SET_POSITIONS = [
  {
    x0: 500,
    y0: 160,
    x1: 700,
    y1: 260,
    scale: 2/3,
    rows: 1
  },
  {
    x0: 500,
    y0: 260,
    x1: 700,
    y1: 360,
    scale: 2/3,
    rows: 1
  },
  {
    x0: 500,
    y0: 360,
    x1: 700,
    y1: 460,
    scale: 2/3,
    rows: 1
  },
  {
    x0: 500,
    y0: 460,
    x1: 700,
    y1: 560,
    scale: 2/3,
    rows: 1
  }
]

const DRAW_CARD =     0b01
const DISCARD_CARD =  0b10

class Turn {
  constructor() {
    this.stage = 0
  }
  did(a){ return a & this.stage }

  do(a){this.stage ^= a}
}


class GameState {
  constructor(app, player, rng, options) {
    this.app = app
    this.uiPlayer = player
    this.rng = rng
    Object.assign(this, options)

    this.phases = [phase1]

    this.playerPhases = []    // tracks player progression through the game
    this.completedSets = [] // phases completed by players in a round
    this.graduated = []       // tracks which players have laid down a phase in this round
    this.scores = []
    
    this.currentTurnIndex = 0
    this.currentTurn = new Turn()

    this.hands = []
    this.skips = []

    this.opponentPositions = OPPONENT_POSITIONS.slice()
    //this.completedSetPositions = COMPLETED_SET_POSITIONS.slice()
    this.addActionHandlers()

    this.beginRound()

    this.stageAreas = []


    for(let area of STAGE_AREAS) {
      this.stageAreas.push(new PhaseStage(app, area))
    }

  }

  takeScore() {
    this.hands.forEach((hand, i) => {
      this.scores[i] += hand.cards.reduce((acc, card) => {
        return acc + (typeof card.type == 'number'? card.type: 15)
      }, 0)
      hand.setScore(this.scores[i])
    })

  }

  endRound() {
    this.graduted = this.graduated.map(_ => false)
    this.takeScore()
    this.completedSetPositions = COMPLETED_SET_POSITIONS.slice()
    for(let hand of this.hands) {
      hand.removeSprites()
      hand.cards.length = 0
    }
    for(let set of this.completedSets){
      set.removeSprites()
    }
    this.completedSets.length = 0
    this.drawPile.removeSprites()

    
    //TODO advance turn method
    this.advanceTurn()
    console.log('scores:',this.scores)

    if(Math.max.apply(null, this.playerPhases) < 8)
      this.beginRound()
  }


  advanceTurn() {
    this.currentTurnIndex = (this.currentTurnIndex + 1 ) % this.scores.length
    this.currentTurn = new Turn()
  }

  beginRound() {
    let deck = new Deck(this.rng)
    this.deck = deck
    this.drawPile = new DrawPile(this.app, deck) 
    for (let hand of this.hands) {
      this.drawPile.deal(hand)
      hand.positionCards(false)
    }
    this.completedSets.length = 0
    this.completedSetPositions = COMPLETED_SET_POSITIONS.slice()
    //this.graduated.length = 0
  }

  addActionHandlers() {
    this.actionHandlers = {}

    this.actionHandlers['joined'] = ((_, player) => {
      let hand
      if (this.uiPlayer == this.hands.length) {
        hand = new Hand(this.app, {owned: true})
        hand.player = player + 1
        hand.setText()
      } else {
        hand = new Hand(this.app, this.opponentPositions.pop())
        hand.player = player + 1
        hand.setText()
      }
      this.drawPile.deal(hand)
      this.hands.push(hand)
      this.playerPhases.push(0)
      this.scores.push(0)
      this.graduated.push(false)
      hand.positionCards(false)
    }).bind(this)


    this.actionHandlers['drawCard'] = (({faceUp}, player) => {
      if(this.currentTurn.did(DRAW_CARD)) return
      this.currentTurn.do(DRAW_CARD)
      //console.log(player)
      let hand = this.hands[player]
      if (faceUp) {
        hand.draw(this.drawPile.popFaceUp(), true)
      } else {
        this.drawPile.deal(hand, 1, true)
      }
    }).bind(this)

    this.actionHandlers['discardCard'] = (({id}, player) => {
      //console.log('did discardCard?', this.currentTurn.did(DISCARD_CARD))
      if(this.currentTurn.did(DISCARD_CARD)) return
      this.currentTurn.do(DISCARD_CARD)
      let hand = this.hands[player]
      //console.log(this.hands, player)
      hand.discardCard(id, this.drawPile)
      if (this.currentTurn.did(DRAW_CARD)) {

        this.actionHandlers['endTurn'](null, player)
      }
    }).bind(this)


    this.actionHandlers['layPhase'] = (({sets}, player) => {
      // TODO add this check back if(!Array.isArray(cards)) return
      let phase = this.phases[this.playerPhases[player]]
      let cards = sets.flat()
      let completedSets = phase(this.app, cards, this.completedSetPositions)
      if (! Array.isArray(completedSets)) return
      let hand = this.hands[player]
      for (let set of completedSets) {
        set.index = this.completedSets.length
        this.completedSets.push(set)
        for(let card of set.expectedCards) {
          set.hitFrom(hand, card)
        }
        set.positionCards(true, 20)
      }
      this.graduated[player] = true
      this.playerPhases[player] += 1
    }).bind(this)


    this.actionHandlers['hit'] = (({cards, setIndex}, player) => {
      if(!Array.isArray(cards) || setIndex >= this.completedSets.length) return
      if(! this.graduated[player]) return
      let set = this.completedSets[setIndex]
      let hand = this.hands[player]
      for (let card of cards) {
        set.hitFrom(hand, card)
      }
      set.positionCards(true, 20)

      if (hand.cards.length == 0) {
        this.endRound()
      }
    }).bind(this)

    this.actionHandlers['endTurn'] = ((_, player) => {
      if(! (this.currentTurn.did(DRAW_CARD) && this.currentTurn.did(DISCARD_CARD))) return
      let hand = this.hands[player]

      console.log(`player ${player} ended their turn`)
      if (hand.cards.length == 0 || this.drawPile.deck.cards.length == 0) {
        this.endRound()
        return 
      }
      this.advanceTurn()
      
    }).bind(this)

  }


  handleAction(action, player) {
    let hand
    if (action.kind == 'joined') {
      this.actionHandlers[action.kind](action,player)
    }
    else if(action.kind in this.actionHandlers) {
      if (player !== this.currentTurnIndex) return
      this.actionHandlers[action.kind](action, player)
    }

  }

}

function testTakeScore() {
  let gameState = new GameState(dummyApp(), 0, Math.random)

  gameState.handleAction({kind: 'joined'}, 0)
  gameState.handleAction({kind: 'joined'}, 1)
  gameState.hands = [
    {cards: [{type: 1}, {type: 2}, {type: 3}]},
    {cards: [{type: 10}, {type: 'W'}, {type: 4}]}
  ]
  gameState.takeScore()

  console.assert(gameState.scores[0] == 6 && gameState.scores[1] == 29, 'expected gameState.scores to be', [6, 29], 'instead of', gameState.scores)

  gameState.scores = gameState.scores.reverse()
  gameState.takeScore()

  console.assert(gameState.scores[0] == gameState.scores[1])
}

function testOrdering() {
  function rng() {
    //console.log(this.x)
    return this.x++
  }
  rng = rng.bind({x:0})
  let gameState = new GameState(dummyApp(), 0, rng)

  gameState.handleAction({kind: 'joined'}, 0)
  gameState.handleAction({kind: 'joined'}, 1)

  let cards = gameState.hands[1].cards.slice(-6)
  //console.log({hands: gameState.hands})

  gameState.handleAction({kind: 'layPhase', cards}, 1)

  //console.log({hands: gameState.hands})
}

function runTests() {
  testTakeScore()
  testOrdering()
}

if (TEST_MODE) runTests()

export default GameState
