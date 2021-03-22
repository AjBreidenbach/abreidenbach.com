function maxAbs(arrays) {
  let max = 0

  for (let arr of arrays) {
    let sum = arr.reduce((a, b) => a + b)
    if (Math.abs(sum) > Math.abs(max)) max = sum
  }

  return max
}

export default class GameState {
  constructor(state, turn) {
    if (state) this.state = state
    else this.state = [0, 0, 0, 0, 0, 0, 0, 0, 0]
    this.turn = turn || Math.round(Math.random()) * 2 - 1
  }

  horizontal(n) {
    n = n * 3
    return this.state.slice(n, n + 3)
  }

  vertical(n) {
    return [this.state[n], this.state[n + 3], this.state[n + 6]]
  }

  diagonal(n) {
    if (n > 1) return [0]
    n = n * 2
    return [this.state[n], this.state[4], this.state[8 - n]]
  }

  nameWinner() {
    for (let i = 0; i < 3; i ++) {
      let max = maxAbs([this.horizontal(i), this.vertical(i), this.diagonal(i)])
      if (Math.abs(max) == 3) return max / 3
    }
    if (this.count0() === 0) return null
    return 0
  }

  count0() {
    return this.state.reduce((count, n) => count + (n === 0), 0)
  }

  mark(i) {
    if (this.state[i] || this.isFinished) return
    this.state[i] = this.turn
    this.turn *= -1
    let result = this.nameWinner()
    this.isFinished = result !== 0
    return result
  }
}
