<script>
  import GameState from './game-state.js'
  import Piece from './Piece.svelte'

  export let controllers; 
  export let actionHandler; 
  export let multiplayerSession; 

  let readyToRestart = false

  let result = 0
  let game
  let pieces = []

  game = new GameState(controllers)

  $: game.controllers = controllers
  
  window.addEventListener('drop-piece', e => {
    let piece = e.detail
    pieces.push(piece)
    pieces = pieces
    console.log({result, game, readyToRestart})

  })

  function setResult(_result) {
    result = _result
    if(result) setTimeout(flourish, 3000)
  }

  actionHandler = actionHandler.bind(null, game, setResult, clear)

  function bound(n, min, max) {
    return Math.min(max, Math.max(Math.floor(n), min))
  }


  function flourish() {
    if (result !== 0) {
      readyToRestart = true
      game.turn = result
      for(let i = 0; i < 42; i++) {
        if(!game.board[i]) {
          let x = i % 7
          game.takeTurn(x, controllers[result])

          setTimeout(flourish, 1000)
          break
        }


      }
    }
  }


  function clear() {
    console.log('clear')
    game.reset()
    game.turn = result * -1
    result = 0
    pieces = []
    readyToRestart = false
  }


  function clickHandler(e) {
    console.log({result, game, pieces, readyToRestart})
    if (result !== 0) {
      clear()
      if(multiplayerSession && multiplayerSession.emitAction)
        multiplayerSession.emitAction({kind: 'clear'})
      
      return
    }

    let {target, offsetX} = e
    let {clientWidth} = target.viewportElement

    let xScale = clientWidth / 232
    let x = offsetX / xScale - 4

    x /= 32; x = bound(x, 0, 6)


    if(multiplayerSession) {
      let {emitAction, index} = multiplayerSession

      let controller = index? 'remote_green': 'remote_red'

      emitAction({kind: 'takeTurn', controller, x})

      result = game.takeTurn(x, index? 'ui': 'local_red')

    } else {
      result = game.takeTurn(x, 'ui')
    }

    game = game

    window.game = game
    if(result) setTimeout(flourish, 3000)
    
  }
  
</script>

<h2 class="noselect">
  {#if false}
  {:else if result === 1}
    Green won!
  {:else if result === -1}
    Red won!
  {:else if game.turn === 1}
    It's green's turn
  {:else if game.turn === -1}
    It's red's turn
  {/if}
</h2>

<svg class="noselect" class:darken={result !== 0} width="232" height="204" viewBox ="0 0 232 204">

  {#each pieces as piece}
    <Piece piece={piece} />
  {/each}


  __BOARD_SVG__
  
  <rect on:click={clickHandler} x="4"width="224" height="196" fill="#000000" opacity="0">
</svg>


<div on:click={clickHandler} class="play-again" class:active={readyToRestart && result}>Click to play again</div>
<style>
  .play-again {
    color: white;
    opacity: 0;
    margin-left: auto;
    margin-top: -180px;
    position: relative;
    text-shadow: 1px 1px 5px black;
    z-index: 0
    
  }

  .play-again.active {
    transition: opacity 2s;
    z-index: 2;
    opacity: 1;
  }

 .darken {
    transition: filter 2s;
    transition-delay: 0.75s;
    filter: brightness(0.25);

  } 

 svg {
   position: relative;
   z-index: 1;

 }
</style>
