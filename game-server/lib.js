//xmur3


async function startMultiplayerSession(options) {
  options = Object.assign({
    maxPlayers: 0,
    onError: null
  }, options)
  let roomId = location.search.match(/join=([-A-Za-z0-9+/=]+)/)

  if (roomId && roomId.length > 1) roomId = roomId[1]
  else roomId = null


  let session 

  if (roomId) {
    session = await joinRoom(roomId)
    session.roomId = roomId
  } else {
    session = await createRoom(options.maxPlayers)
  }

  if (session.error) {
    options.onError && options.onError(session.error)
    return session
  }

  let {ws, playerId} = session
  session.emitAction = function(action) {
    ws.send(JSON.stringify({playerId, action}))
  }
  session.onAction = console.log
  ws.onmessage = function(message) {
    session.onAction(JSON.parse(message.data))

  }
  console.log(session)

  return session

}

async function connect(roomId, playerId) {

  let wsOrigin = location.origin.replace('https', 'wss').replace('http', 'ws')
  let ws = new WebSocket(`${wsOrigin}/${roomId}`)

  return new Promise(
    (resolve, reject) => {
      ws.onopen = e => {
        resolve({ws, e})
        //ws.onmessage = console.log
        //let action = 'test'
        //ws.send(JSON.stringify({playerId, action}))
      }

    }

  )

}


async function createRoom(maxPlayers) {
  let query = ''
  if (maxPlayers) {
    query = `?maxPlayers=${maxPlayers}`

  }

  let {roomId, playerId, index, error} = await fetch('/create-room' + query, 
    {method: 'POST'}
  )
    .then(res => res && res.json())

  if (error) 
    return {error}
  let {ws, e} = await connect(roomId, playerId)
  return {roomId, playerId, index, ws}

}


async function joinRoom(roomId) {
  //let error = null
  let {playerId, index, error} = await fetch('/join-room?roomId=' + roomId, {method: 'POST'})
    .then(res => res.json())
  console.log({error})
  if (error)
    return {error}
  let {ws, e} = await connect(roomId, playerId)
  return {playerId, index, ws}
}



function getSeedGenerator(playerId) {
  for(var i = 0, h = 1779033703 ^ playerId.length; i < playerId.length; i++)
    h = Math.imul(h ^ playerId.charCodeAt(i), 3432918353),
      h = h << 13 | h >>> 19;
  return function() {
    h = Math.imul(h ^ h >>> 16, 2246822507);
    h = Math.imul(h ^ h >>> 13, 3266489909);
    return (h ^= h >>> 16) >>> 0;
  }
}

//mulberry32 
function rng32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}


function shuffle(array, rng32) {
  for(let i in array) {
    array[i] = [rng32(), array[i]]
    console.log(array[i])
  }
  array.sort()
  console.log({array})


  for(let i in array) {
    array[i] = array[i][1]
  }
  return array
}


let exports = {shuffle, rng32, getSeedGenerator, startMultiplayerSession}

Object.assign(window, exports)
