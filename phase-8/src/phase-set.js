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

const VALIDATE_MATCHING_TYPE_3 = matchingTypeValidator(3)
const VALIDATE_MATCHING_COLOR_3 = matchingColorValidator(3)

PhaseSet.MATCHING_TYPE_3 = new PhaseSet(
  '3 cards of the same type',
  VALIDATE_MATCHING_TYPE_3
)



if(TEST_MODE) {

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


  testMatchingType3()
  testMatchingColor3()

}
