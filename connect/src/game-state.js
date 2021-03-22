export default class GameState {

  constructor() {
    this.turn = Math.round(Math.random()) * 2  - 1
    this.stacks = [0, 0, 0, 0, 0, 0, 0]
    this.pieces = []
    this.board = new Array(42)
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

  takeTurn(x) {
    let y
    if ((y = this.stacks[x]++) > 5) return
    this.setCell(x,y,this.turn)
    this.pieces.push({x,y, color: this.turn})
    this.turn *= -1
    return this.check()

  }
}
