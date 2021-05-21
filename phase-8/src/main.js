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

    client.setGameState(gameState)


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

}


window.addEventListener('DOMContentLoaded', _ => {
  app.loader.add(
    'cancel', '/pages/static/phase-8/assets/cancel.png',
    'place', '/pages/static/phase-8/assets/place.png'
  ).load(setup)
})

