const crypto = require('crypto')
const WebSocket = require('ws')
const assert = require('assert')
const base32Encode = require('base32-encode')

let sessions = {}

let ab = new Uint8Array(16)

function b32string(nbytes) {

  crypto.randomFillSync(ab)
  return base32Encode(ab, 'RFC4648').replace(/=*$/, '')
}


class Room {

  static getRoom(id) {
    let result = sessions[id]

    if(!result) console.log({id, sessions})

    return result
  }

  constructor() {

    do {
      this.id = b32string(16)
    } while(this.id in sessions)


    this.wss = new WebSocket.Server({noServer: true, clientTracking: true})



    this.messageHandler = (function(sender, message) {
      console.log(message.data)
      try {
        let {playerId, action} = JSON.parse(message.data)


        let index = this.players.indexOf(playerId)
        assert(index != -1, 'player not registered')


        this.broadcast(sender, JSON.stringify({index, action}))


      } catch(e) {console.error(e)}
    })

    this.players = []

    sessions[this.id] = this
    //console.log(Object.assign({}, this))

  }


  broadcast(sender, message) {
    let wss = this.wss
    //console.log(wss.clients)
    //console.log({sender, message})
    wss.clients
      .forEach(client => {
        if(sender !== client && client.readyState === WebSocket.OPEN) {
          //console.log(client)
          //console.log(client.readyState)
          client.send(message)
        }
      })

  }

  registerClient(ws) {

    ws.onmessage = this.messageHandler.bind(this, ws)

  }


  addPlayer() {
    if (this.players.length >= this.maxPlayers) return [-1, null]
    let id = b32string(8)
    let index = this.players.length
    this.players.push(id)
    return [index, id]
  }

}


module.exports = Room
