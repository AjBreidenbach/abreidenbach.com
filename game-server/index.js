const express = require('express')
const fs = require('fs')
const path = require('path')
const Room = require('./src/room')
const repl = require('repl')


let app = express()



app.use('/pages', require('./routes/pages.js'))

app.get('/', (req,res) => {
  let testPage = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8')
  res.send(testPage)

})

app.get('/lib.js', (req,res) => {
  let script = fs.readFileSync(path.join(__dirname, 'lib.js'), 'utf8')
  res.send(script)
})



app.post('/create-room', (req, res) => {

  let room = new Room()

  if (req.query) {
    let {maxPlayers} = req.query

    maxPlayers && (room.maxPlayers = maxPlayers)
  }

  let [index, playerId] = room.addPlayer()

  res.json({roomId: room.id, index, playerId})

})


app.post('/join-room', (req, res) => {

  if (req.query) {
    let {roomId} = req.query

    try {
      let room = Room.getRoom(roomId)
      if (!room) {
        res.status(400).json({error: 'room not found'})
        return
      }
      let [index, playerId] = room.addPlayer()

      if (index == -1) {
        res.status(400).json({error: 'room is full'})
        return 
      }
      res.json({index, playerId})
      return 
    }
    catch(e) {console.error(e)}



  }


  res.status(400).send()

})


let server = app.listen(9000)


server.on('upgrade', (request, socket, head) => {
  console.log(request.url)


  let shouldConnect = true

  if(shouldConnect) {
    let room = Room.getRoom(request.url.slice(1))
    if(!room) {
      socket.destroy()
      return
    }
    let wss = room.wss

    wss.handleUpgrade(request, socket, head, (ws, request) => {
      room.registerClient(ws)
      
      //room.broadcast('hello', {}, console.log)
    })
  }

  else {socket.destroy()}

})

