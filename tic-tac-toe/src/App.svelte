<script>
  import GameState from './game-state.js'
  import Piece from './Piece.svelte'

  let result
  let flashing = false
  let readyToRestart = false

  let game = new GameState()


  function xIndex(i) {return i % 3}
  function yIndex(i) {return Math.floor(i / 3)}

  function flourish() {
    flashing = true
    setTimeout(_ => flashing = false, 1000)
    setTimeout(_ => {game.isFinished && (readyToRestart = true)}, 2000)
  }

  function handleClick(e) {
    if (game.isFinished)  { 
      game = new GameState()
      readyToRestart = false
      result = 0
      return
    }
    let {target, offsetX, offsetY} = e

    if (target.id != 'game') return

    let {clientWidth, clientHeight} = target

    let x = Math.floor(offsetX / (clientWidth / 3))
    let y = Math.floor(offsetY / (clientHeight / 3))

    x = Math.max(0, Math.min(x, 2))
    y = Math.max(0, Math.min(y, 2))

    console.log({target, x, y, offsetX, offsetY, clientHeight, clientWidth})

    let i = x + y * 3

    result = game.mark(i)
    game = game
    if (game.isFinished) flourish()
    
  }
</script>

<h2>
{#if result === null}
  Draw!
{:else if result == -1}
  X won!
{:else if result == 1}
  O won!
{:else if game.turn == -1}
  It's X's turn
{:else}
  It's O's turn
{/if}
</h2>


<svg class:flashing={flashing} class:restart={readyToRestart} id="game" width="360" height="360" on:click={handleClick} viewBox="0 0 360 360">
  <line x1="120" y1="0" x2="120" y2="360" stroke="black" />
  <line x1="240" y1="0" x2="240" y2="360" stroke="black" />
  <line y1="120" x1="0" y2="120" x2="360" stroke="black" />
  <line y1="240" x1="0" y2="240" x2="360" stroke="black" />

  {#each game.state as state, i}
    <Piece state={state} x={xIndex(i)} y={yIndex(i)} />
  {/each}

</svg>

<div on:click={handleClick} class="play-again" class:active={readyToRestart}>Click to play again</div>

<style>
  @keyframes flashing-board{
    0% {filter:invert(0);}
    25% {filter:invert(1);}
    50% {filter:invert(0);}
    75% {filter:invert(1);}
    100% {filter:invert(0);}
  }
  .flashing {
    animation-name: flashing-board;
    animation-duration: 1s;
  }

  .restart {
    transition: filter 2s;
    filter: brightness(0.25);
  }
  
  #game {
    background-color: cornsilk;
    z-index:1;
    position:relative;
    border-style: solid;
  }

  .play-again {
    color: white;
    opacity: 0;
    margin-left: auto;
    margin-top: -180px;
    position: relative;
    
  }
  .play-again.active {
    transition: opacity 2s;
    z-index: 2;
    opacity: 1;
  }


</style>


