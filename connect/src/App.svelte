<script>
  import Board from './Board.svelte'
  //import handleAction from './action-handler'
	export let name;

  let clipboardHelper

  let STATUS_MESSAGES = [
    'Click to start an online game',
    'Creating game room',
    'Failed to connect',
    ''


  ]
  let URL, TOOLTIP_MESSAGE
  

  let multiplayerSession
  

  let onlineStatus = 0 

  let controllers
  (function (){
    let _controllers = {}
    _controllers[-1] = 'ui'
    _controllers[1] = 'ui'
    controllers = _controllers

  })()


  let actionHandler = function(game, setResult, clear, session, message){
    let {index, action} = message
    if(!action.kind) return
    console.log(action.kind)
    switch(action.kind) {
      case 'joined':
        session.joined = true
        if (index) {
          setController(-1, 'local_red')
          console.log({controllers})
          setTooltipMessage('green has joined')
        }
        return

      case 'takeTurn':
        let {x, controller} = action
        setResult(game.takeTurn(x, controller))
        return 


      case 'clear':
        clear()
        return

    }
  }


  function setController(i, c) {
    controllers[i] = c
    controllers = controllers
  }

  function startOnlineGame(session) {
    console.log({onlineStatus})
    if (onlineStatus != 2) {
      actionHandler = actionHandler.bind(null, session)
      session.onAction = actionHandler//handleAction.bind(null, setController)

      if (session.index) {
        setTooltipMessage('joined successfully') 
        session.emitAction({kind: 'joined'})
        setController(-1, 'remote_red')
        console.log('set remote red?', controllers)

      }
      else {

        STATUS_MESSAGES.pop()
        STATUS_MESSAGES.push(
          'Share this url to invite another player: '
        )
        URL = `${location.origin + location.pathname}?join=${multiplayerSession.roomId}`
        setController(1, 'remote_green')
        setController(-1, 'local_red')
      }
      onlineStatus = 3
    }

  }


  async function loadLib() {
    if (onlineStatus != 0)
      return
    onlineStatus = 1

    await fetch('/lib.js')
      .then(res => res.text())
      .then(text => (0, eval(text)))
    

    startMultiplayerSession({maxPlayers: 2}).then(session => {
      if (session.error) {
        setTooltipMessage(session.error)
        onlineStatus = 2


      }
      multiplayerSession = session
      window.session = session
      startOnlineGame(session)
    })


  }


  window.loadLib = loadLib


  function copy(e) {
    e.preventDefault()

    clipboardHelper.value = URL
    clipboardHelper.select()
    clipboardHelper.setSelectionRange(0, 999)
    document.execCommand('copy')
    
    setTooltipMessage('Copied to clipboard')
    
  }


  function setTooltipMessage(message) {

    TOOLTIP_MESSAGE = message

    setTimeout(_ => TOOLTIP_MESSAGE = '', 3000)

  }

  window.addEventListener('tooltip', (e) => {
    e.detail && setTooltipMessage(e.detail)

  })


  if(location.search.match(/(\?|&)join=/)) {
    loadLib()

  }

</script>

<Board bind:multiplayerSession={multiplayerSession} bind:actionHandler={actionHandler} bind:controllers={controllers}/>
<div class="noselect" id="online-game"> 

  <div class:hidden={!TOOLTIP_MESSAGE} id="tooltip"> {TOOLTIP_MESSAGE} </div>
  <span on:click={loadLib}>{STATUS_MESSAGES[onlineStatus]} {#if URL}<a on:click={copy} href={URL}>{URL}</a>{/if}</span>

</div>


<input id="clipboardHelper" bind:this={clipboardHelper}>

<style>
  #clipboardHelper {
    position: fixed;
    left: -999;

  }

  #tooltip {
    width: 100%;
    color: grey;
    transition: opacity 0.5s;
    margin: 2em;
  }

  .hidden {
    opacity: 0%;
  }

  #online-game {
    position: fixed;
    flex-wrap: wrap;
    bottom: 15px;
    display: flex;
    width: 100vw;
    justify-content: space-around;
  }

</style>
