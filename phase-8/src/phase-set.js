const WILDCARDS_ONLY = 1, CONTAINS_SKIP = 2

export default class PhaseSet {
  constructor(description, validator) {

    this.description = description
    this.validate = validator
  }


  static validSet(cards) {

    let wildCount = cards.reduce((acc, card) => acc + (card.type == 'W'), 0)
    if (wildCount == cards.length) return WILDCARDS_ONLY
    if(cards.some(c => c.type == 'S')) return CONTAINS_SKIP

  }
}


function matchingTypeValidator(minimum) {
  return function(cards) {
    let type
    for(let card of cards) {
      if(card.type != 'W') { 
        type = card.type 
        break
      }
    }

    return cards.length >= minimum && !cards.some(card => card.type != 'W' && card.type != type)
  }
}

function matchingColorValidator(minimum) {
  return function (cards) {
    let color
    for(let card of cards){
      if(card.type != 'W') {
        color = card.color
        break
      }
    }

    return cards.length >= minimum && !cards.some(card => card.type != 'W' && card.color != color)
  }
}


function runValidator(minimum) {
  return function (cards) {
    if (cards.length < minimum) return false
    let start
    for(let i in cards) {
      let card = cards[i]
      if(card.type != 'W') {
        start = card.type - i
        break
      }
    }

    for(let i in cards) {
      let card = cards[i]

      if(card.type == 'W') continue
      if(card.type - i != start) return false
    }

    return true
  }
}

const VALIDATE_MATCHING_TYPE_3 = matchingTypeValidator(3)
const VALIDATE_MATCHING_TYPE_4 = matchingTypeValidator(4)
const VALIDATE_MATCHING_COLOR_7 = matchingColorValidator(7)
const VALIDATE_RUN_4 = runValidator(4)

PhaseSet.MATCHING_TYPE_3 = new PhaseSet(
  '3 cards of the same type',
  VALIDATE_MATCHING_TYPE_3
)

PhaseSet.RUN_4 = new PhaseSet(
  'run of 4 cards',
  VALIDATE_RUN_4
)

PhaseSet.MATCHING_TYPE_4 = new PhaseSet(
  '4 cards of the same type',
  VALIDATE_MATCHING_TYPE_4
)

PhaseSet.MATCHING_COLOR_7 = new PhaseSet(
  '7 cards of the same color',
  VALIDATE_MATCHING_COLOR_7
)




if(TEST_MODE) {
  const VALIDATE_MATCHING_COLOR_3 = matchingColorValidator(3)

  function  testMatchingType3() {
    let cards

    cards = [{type: 'W'}, {type: 1}, {type: 1}] 
    console.assert(VALIDATE_MATCHING_TYPE_3(cards), 'should pass', {cards})

    cards = [{type: 1}, {type:1}]
    console.assert(!VALIDATE_MATCHING_TYPE_3(cards), 'should fail', {cards})

  }

  function testMatchingColor3() {
    let cards

    cards = [{type: 'W', color: 'blue'}, {type: 2, color: 'red'}, {type: 8, color: 'red'}]
    console.assert(VALIDATE_MATCHING_COLOR_3(cards), 'should pass', {cards})

    cards = [{type: 'W', color: 'blue'}, {type: 2, color: 'green'}, {type: 8, color: 'red'}]
    console.assert(!VALIDATE_MATCHING_COLOR_3(cards), 'should fail', {cards})

    cards = [{type: 2, color: 'red'}, {type: 8, color: 'red'}]
    console.assert(!VALIDATE_MATCHING_COLOR_3(cards), 'should fail', {cards})

  }


  function testRunValidator4() {
    let cards

    cards = [{type: 'W'}, {type: 2}, {type: 3}, {type: 4}]
    console.assert(VALIDATE_RUN_4(cards), 'should pass', {cards})

    cards = [{type: 1}, {type: 'W'}, {type: 3}, {type: 4}]
    console.assert(VALIDATE_RUN_4(cards), 'should pass', {cards})

    cards = [{type: 'W'}, {type: 2}, {type: 3}, {type: 5}]
    console.assert(!VALIDATE_RUN_4(cards), 'should fail', {cards})
  }



  testMatchingType3()
  testMatchingColor3()
  testRunValidator4()

}
