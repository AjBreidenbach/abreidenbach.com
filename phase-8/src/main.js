import * as PIXI from 'pixi.js'
import Card from './card'
import Hand from './hand'
import Deck from './deck'
import GameState from './game-state'
import Phase8Client from './game-client'
import KeyboardHandler from './keyboard'


const app = new PIXI.Application({backgroundColor: 0xffffff, width: 1200, height: 800})
app.stage.sortableChildren = true

window.app = app

document.body.append(app.view)


function setup() {
  let gameState
  let keyboardHandler = new KeyboardHandler(app)
  let client = new Phase8Client()
  client.onReady(_ => {
    app.client = client
    app.keyboardHandler = keyboardHandler
    gameState = new GameState(
      app, client.index, client.rng
    )

    client.gameState = gameState


    app.view.focus()
    keyboardHandler.registerHandler('KeyE', client.endTurn.bind(client))
    if (client.index == 0) { keyboardHandler.registerHandler('KeyN', startGame.bind(null, app, gameState, client)) }
    else { startGame(app, gameState, client) }
  })
}

function startGame(app, gameState, client){
  client.join()
  console.log(location.protocol + '//' + location.host + location.pathname + `?join=${client.roomId}`)
  //join(1)

  console.log({app, gameState, client})

  function drawCard(faceUp=true, player=0) {
    console.log('drawCard', player)
    gameState.handleAction({
      kind: 'drawCard',
      faceUp
    }, player)
  }

  function discardCard(color, type, player=0) {
    console.log('discardCard', player)
    gameState.handleAction({
      kind: 'discardCard',
      color, type
    }, player)
  }

  function endTurn(player=0) {
    gameState.handleAction({
      kind: 'endTurn',
    }, player)
  }

  function join(player=0) {
    gameState.handleAction({
      kind: 'joined'
    })
  }
}


window.addEventListener('DOMContentLoaded', setup)




/*

function test() {
  join(0);
  join(1);

  (function() {
    setTimeout(_ => { drawCard(false, 0) }, 10000)
    let hand0 = gameState.hands[0]
    let {color, type} = hand0.cards[0]
    setTimeout(_ => { discardCard(color, type )}, 15000)
  })();

  (function() {
    setTimeout(_ => { drawCard(true, 0) }, 20000)
    let hand0 = gameState.hands[0]
    let {color, type} = hand0.cards[0]
    setTimeout(_ => { discardCard(color, type )}, 25000)
  })();
  


  (function() {
    let hand1 = gameState.hands[1]
    let {color, type} = hand1.cards[0]
    setTimeout(_ => { drawCard(false, 1) }, 30000)
    setTimeout(_ => { discardCard(color, type, 1)}, 35000)
  })();
  
  (function() {
    let hand1 = gameState.hands[1]
    let {color, type} = hand1.cards[0]
    setTimeout(_ => { drawCard(true, 1) }, 40000)
    setTimeout(_ => { discardCard(color, type, 1)}, 45000)
  })();
  

  //setTimeout(_ => { drawCard(0, 1) }, 1000)
}
*/




