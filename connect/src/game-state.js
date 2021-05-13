export default class GameState {

  constructor(controllers) {
    this.turn =  -1
    this.stacks = [0, 0, 0, 0, 0, 0, 0]
    //this.pieces = []
    //console.error(controllers)
    this.controllers = controllers
    this.board = new Array(42)
  }



  reset() {

    this.stacks = [0, 0, 0, 0, 0, 0, 0]
    this.board.length = 0
  }

  getCell(x,y) {
    return this.board[x + y * 7]
  }

  setCell(x,y,v) {
    this.board[x + y * 7] = v
  }

  checkHorizontal(y) {
    let last = 0
    let count = 0
    for(let x = 0; x < 7; x++) {
      let n = this.getCell(x,y)
      if (n==0) {
        last = 0; count = 0
        continue
      }
      if (n==last) count += 1
      else count = 1

      last = n

      if (count == 4) return last
    }
    return 0
  }

  checkVertical(x,y) {
    let n = this.getCell(x,y)
    if(n && 
      [this.getCell(x,y+1), this.getCell(x,y+2), this.getCell(x,y+3)]
        .every(m => m === n))
      return n

    return 0
  }


  checkDiagonalLeft(x,y) {
    let n = this.getCell(x,y)
    if(n &&
      [this.getCell(x-1,y+1), this.getCell(x-2,y+2), this.getCell(x-3,y+3)]
        .every(m => m === n)
    )
      return n
    return 0
  }

  checkDiagonalRight(x,y) {
    let n = this.getCell(x,y)
    if(n &&
      [this.getCell(x+1,y+1), this.getCell(x+2,y+2), this.getCell(x+3,y+3)]
        .every(m => m === n)
    )
      return n
    return 0
  }



  checkDiagonal(x,y) {
    if (x > 2) {
      let result = this.checkDiagonalLeft(x,y)
      if (result) return result
    } 
    if (x < 4) {
      let result = this.checkDiagonalRight(x,y)
      if (result) return result
    }

    return 0
  }

  checkRow(y) {
    let result = this.checkHorizontal(y)
    if(result) return result

    if(y > 2) return 0
    for(let x = 0; x < 7; x++) {
      let result = this.checkVertical(x,y)
      if (result) return result

      result = this.checkDiagonal(x,y)
      if (result) return result
    }

    return 0
  }

  check() {
    for(let y = 0; y < 6; y++) {
      let result = this.checkRow(y)
      if(result) return result
    }

    return 0
    
  }

  takeTurn(x, controller) {
    console.log(controller, this.controllers[this.turn], this.turn)
    if (this.controllers[this.turn] != controller) return 0
    let y
    if ((y = this.stacks[x]++) > 5) return 0
    this.setCell(x,y,this.turn)
    //this.pieces.push({x,y, color: this.turn})
    window.dispatchEvent(new CustomEvent('drop-piece', {detail: {x,y,color:this.turn}}))
    //console.log(this.pieces)
    this.turn *= -1
    return this.check()

  }
}
