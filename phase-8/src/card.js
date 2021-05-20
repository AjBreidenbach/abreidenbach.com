import * as PIXI from 'pixi.js'
import Deck from './deck'

const COLOR_MAPPINGS = {
  red: 'crimson',
  blue: 'cadetblue',
  green: 'darkolivegreen',
  yellow: 'gold'
}

let canvas = document.querySelector('#canvas')
let ctx = canvas.getContext('2d')
window.ctx = ctx
let {Sprite, BaseTexture, Texture} = PIXI

canvas.width = 100
canvas.height = 150


function squareDistance(a,b) {
  return Math.pow(a[0] - b[0], 2) +
  Math.pow(a[1] - b[1], 2)
}

class Card {

  static getTextureIndex(c,i) {
    let _i = i
    i = typeof i == 'number'?
      i - 1: i == 'W'? 
      12 : i == 'S'?
      13: -1
    
    if (i == -1) return -1
      
    return c == 'red' ?
      i: c == 'blue' ?
      i + 14: c == 'green' ?
      i + 28: c == 'yellow'?
      i + 42: -1
  }

  constructor(app, id, options) {
    Object.assign(this, {moveable: true, selectable: false, isFaceUp: false, scale: 1}, options)
    this.id = id

    let color = Deck.colorOf(id)
    let type = Deck.typeOf(id)
    this.animationCounter = 0 
    this.color = color
    this.type = type
    this.textureIndex = Card.getTextureIndex(color, type)
    this.sprite = new Sprite(Card.BACK)
    this.sprite.interactive = true
    this.mouseorigin = [0,0]
    this.sprite.pivot.set(50 * this.scale, 75 * this.scale)
    this.sprite.on('mousedown', ({data}) => {
      window.card = this
      

      this.grabbingX = data.global.x - this.sprite.x
      this.grabbingY = data.global.y - this.sprite.y
      this.mouseorigin = [data.global.x, data.global.y]
      if(this.draggable) {
        app.client.setDraggingTarget(this)
      }
      
      this.tracking = true
      this.sprite.zIndex = 1
    })
    function mouseupHandler(event) {
      let {data} = event

      this.tracking = false
      if(this.sprite.zIndex == 1) this.sprite.zIndex = 0
      let mouseend = [data.global.x, data.global.y]

      if(this.draggable) {
        app.client.dropDraggingTarget()
      }

      if(squareDistance(this.mouseorigin, mouseend) <= 16) {
        this.toggleSelect()
        if(typeof this.onClick == 'function') this.onClick(data)
      }
    }
    this.sprite.on('mouseup', mouseupHandler.bind(this))
    this.sprite.on('mouseupoutside', mouseupHandler.bind(this))

    this.sprite.on('mouseover', _ => {
      let client = app.client
      if(this.isDropTarget && client.hasDraggingTarget()) {
        this.alpha = 0
        client.setDroppingTarget(this)
      }
    })

    this.sprite.on('mouseout', _ => {
      let client = app.client
      if(this.isDropTarget) {
        this.alpha = this.defaultAlpha
        if(this.defaultAlpha === undefined || this.defaultAlpha === null)
          this.alpha = 1
        client.removeDroppingTarget(this)

      }
    })

    this.sprite.on('mousemove', ({data}) => {
      if (this.tracking && this.moveable) {
        this.sprite.x = data.global.x - this.grabbingX
        this.sprite.y = data.global.y - this.grabbingY
        
      }
    })

    app.stage.addChild(this.sprite)
    
  }

  set zIndex(z) {
    this.sprite.zIndex = z
  }

  set alpha(a) {
    this.sprite.alpha = a
  }

  set texture(t) {
    this.sprite.texture = t
  }


  set isDropTarget(a) {
    if(a) {
      this.zIndex = 2
    } else {
      this.zIndex = 0
    }
    
    this._isDropTarget = a
  }

  get isDropTarget() {
    return this._isDropTarget
  }


  static placeholder() {
    let placeholder = new Card(app, -1)
    placeholder.texture = Card.HALO
    placeholder.isDropTarget = true

    return placeholder

  }

  toSimpleRepr() {
    return {id: this.id, color: this.color, type: this.type}
  }

  moveTo(x,y, animate = true, baseVelocity = 12) {
    this.sprite.width = this.scale * 100
    this.sprite.height = this.scale * 150
    this.sprite.pivot.x = this.sprite.width / 2
    this.sprite.pivot.y = this.sprite.height / 2
    if (!animate) {
      this.sprite.x = x + this.sprite.pivot.x
      this.sprite.y = y + this.sprite.pivot.y
      return
    }

    let card = this
    let animationCounter = ++this.animationCounter

    
    /*
    if (this.moving) {
      throw new Error('trying to animate the same object')
    }
    if(this.moving) return
    */
    this.moving = true

    let velocity = baseVelocity * this.scale

    let destinationX = x + this.sprite.pivot.x
    let destinationY = y + this.sprite.pivot.y
    let displacementX = destinationX - this.sprite.x
    let displacementY = destinationY - this.sprite.y
    let totalDisplacement = Math.sqrt(Math.pow(displacementX, 2) + Math.pow(displacementY, 2))

    let atan = Math.atan(displacementY / displacementX) 
    let deltaX = Math.cos(atan) * velocity
    if (Math.sign(deltaX) != Math.sign(displacementX)) deltaX *= -1
    let deltaY = Math.sin(atan) * velocity
    if (Math.sign(deltaY) != Math.sign(displacementY)) deltaY *= -1

    function incrementPosition(deltaX, deltaY) {
      
      return new Promise(resolve => {
        let incrementX = 0, incrementY = 0, 
        x = card.sprite.x, //+ card.sprite.pivot.x,
        y = card.sprite.y //+ card.sprite.pivot.y

        //if ((deltaX > 0 && destinationX >= x) || (deltaX < 0 && destinationX <= x)) {
        if (deltaX != 0) {
          incrementX = deltaX || 0

          if(Math.abs(destinationX - x) <= Math.abs(incrementX)) {
            card.sprite.x = destinationX
            incrementX = 0
            deltaX = 0
          }
        }
        if (deltaY != 0) {
          incrementY = deltaY || 0
          if(Math.abs(destinationY - y) <= Math.abs(incrementY)) {
            card.sprite.y = destinationY
            incrementY = 0
            deltaY = 0
          }
        }
        if ((incrementX || incrementY) && card.animationCounter == animationCounter) {
          requestAnimationFrame(() => {
            card.sprite.x += incrementX
            card.sprite.y += incrementY
            incrementPosition(deltaX, deltaY).then(resolve)
          })
        } else {
          resolve()
          if (card.animationCounter == animationCounter)
            card.animationCounter = 0
            
          card.moving = false
        }
      })

    }

    incrementPosition(deltaX, deltaY)

  }

  async faceUp(animate=false) {
    if (this.isFaceUp) return
    this.isFaceUp = true
    if (animate) await this.animateFlip()
    if(this.textureIndex >= 0)
      this.texture = Card.TEXTURES[this.textureIndex]
    if (animate) await this.animateFlip(-1)
  }

  async faceDown(animate=false) {
    if (!this.isFaceUp) return
    this.isFaceUp = false
    if (animate) await this.animateFlip()
    this.texture = Card.BACK
    if (animate) await this.animateFlip(-1)
  }

  async flip(animate=true) {
    if (this.isFaceUp) this.faceDown(animate)
    else this.faceUp(animate)
  }

  select() {
    if(!this.selectable) return
    //console.log('select')
    window.card = this
    this.isSelected = true
    this.sprite.tint = 0xaaaa00
    /*
    let halo = new Sprite(Card.HALO)
    halo.alpha = 0.3
    this.sprite.tint = 0xf0f0f0
    this.sprite.addChild(halo)
    */
  }

  deselect() {
    //console.log('deselect')
    this.sprite.tint = 0xffffff
    this.isSelected = false
    //this.sprite.removeChildren()
  }

  toggleSelect() {
    if(this.isSelected)
      this.deselect()
    else
      this.select()

  }


  animateFlip(stepMult) {
    let endAt = Math.PI / 4 , steps = 10
    let step = endAt / steps
    stepMult = stepMult || 1
    step *= stepMult
    let card = this
    function incrementSkew() {
      return new Promise((resolve, reject) => {
        window.requestAnimationFrame(_ => {
          card.sprite.skew.x += step
          card.sprite.skew.y += step
          card.sprite.width -= 9 * stepMult * card.scale
          card.sprite.height -= 6 * stepMult * card.scale

          if (--steps > 0) {
            if (card.sprite.skew.x < 0) {
              card.sprite.skew.x = card.sprite.skew.y = 0
              resolve()
              return
            }
            incrementSkew().then(resolve)
          } else {resolve()}
        })
      })
    }

    return incrementSkew()
    
  }
}


Card.TEXTURES =  (function(){
  let result = []

  function serializeTexture() {
    let imageData = ctx.getImageData(0, 0, 100, 150)
    let buffer = imageData.data.buffer
    //console.log(buffer)
    result.push(new Texture(BaseTexture.fromBuffer(new Uint8Array(buffer), 100, 150)))

  }

  function createTexture(c,i) {
    drawCard(c, i)
    serializeTexture()
  }

  for(let c of ['red', 'blue', 'green', 'yellow']) {
    for(let i = 1; i <= 12; i++) {
      createTexture(c,i)
    }
    createTexture(c, 'W')
    createTexture(c, 'S')

  }
  createTexture()
  Card.BACK = result.pop()

  drawHalo()
  serializeTexture()
  Card.HALO = result.pop()
  //console.log({result, back: Card.BACK})
  return result

})()

function drawCard(c,n) {
  ctx.lineWidth = 2.5
  ctx.fillStyle = COLOR_MAPPINGS[c] || 'white'
  //console.log(ctx.fillStyle)
  ctx.scale(0.5, 0.5)
  

  ctx.font = n < 10? '48px sans-serif': '36px sans-serif'

  ctx.fillRect(0, 0, 200, 300)
  ctx.translate(100, 150)


  if (!c) ctx.scale(-1, 1)

  function drawRoundedBorder() {
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(90, -140, 50, 0, 2 *Math.PI)
    ctx.fill()

  }

  function drawCardNumber() {
    if (!c) return
    ctx.fillStyle = 'white'
    
    let x = typeof n == 'number' && n >= 10 ? 55 : 60
    ctx.fillText(n.toString(), x, -105)

  }
  

  drawRoundedBorder()
  drawCardNumber()

  ctx.rotate(Math.PI) 
 
  drawRoundedBorder()
  drawCardNumber()

  if (c) ctx.fillStyle = 'white'

  ctx.rotate(Math.PI * 5 / 16)

  ctx.fillRect(-180, -10, 360, 20)
  ctx.fillStyle = 'black'
  ctx.strokeRect(-180, -10, 360, 20)

  ctx.rotate(Math.PI * 11 / 16)
  ctx.translate(-100, -150)

  ctx.lineWidth = 5

  ctx.strokeRect(0,0, 200, 300)

  ctx.scale(2,2)


}


function drawHalo() {
  ctx.fillStyle = 'white'
  ctx.fillRect(0,0,200,300)
  ctx.scale(0.5, 0.5)

  ctx.lineWidth = 6
  ctx.strokeStyle = 'blue'
  ctx.strokeRect(3,3,197,297)
}

export default Card

