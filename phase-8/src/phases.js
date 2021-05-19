import CompletedSet from './completed-set'
import {dummyApp} from './test'
import Hand from './hand'


const WILDCARDS_ONLY = 1, CONTAINS_SKIP = 2

function isPhaseInvalid(cards) {
  let wildCount = cards.reduce((acc, card) => acc + (card.type == 'W'), 0)
  if (wildCount == cards.length) return WILDCARDS_ONLY

  if(cards.some(c => c.type == 'S')) return CONTAINS_SKIP

}


function dedupe(array) {
  let dict = {}

  for(let i = 0; i < array.length; i++) {
    let item = JSON.stringify(array[i])
    if (item in dict) continue
    dict[item] = i
  }


  let result = []
  for(let item in dict) {
    let index = dict[item]
    result[index] = JSON.parse(item)
  }

  return result.filter(i => i !== undefined)

  
}

// assumes sorted array
function getRuns(_array, dedupe = false) {
  let array = dedupe? dedupe(_array): _array
  let result = []
  let last
  let spanLength = 0
  for (let i = 0; i < array.length; i++) {
    if(!last || (last + 1) != array[i]) {
      if(spanLength) { result.push([i - spanLength - 1, i]) }
      spanLength = 0
    } else {
      spanLength += 1
    }
    last = array[i]
  }

  let i = array.length - 1
  if(spanLength) { result.push([i - spanLength, i + 1]) }

  return result

}


export function phase2(app, cards, options) {
  let phaseError = isPhaseInvalid(cards)
  if (phaseError) return phaseError
  Hand.orderByType(cards)
  if (cards.length < 7)
    return


  let deduped = dedupe(cards.map(card => card.type))

  let runs = getRuns(deduped)
  runs.sort((a,b) => (b[1] - b[0] - a[1] - a[0]))
  let run = deduped.slice.apply(deduped, runs[0])

  let set1 = [], set2 = []

  for(let type of run) {
    let index = cards.findIndex(card => card && card.type == type)
    console.assert(index != -1)

    set1.push(cards[index])
    cards[index] = null
  }

  cards = cards.filter(c => c)




  let counts = {}

  for (let card of cards) {
    if (card.type in counts) {
      counts[card.type] += 1
    }
    else {
      counts[card.type] = 1
    }
  }
  let set2Type
  let count = 0

  for(let _type in counts) {
    let _count = counts[_type]
    if (_count > count && _type != 'W') {
      count = _count
      set2Type = _type
    }
  }

  for(let index in cards) {
    let card = cards[index]
    if(card && card.type == set2Type) {
      set2.push(card)
      delete cards[index]
    }
  }
  cards = cards.filter(c => c)
  //let set2 = cards.filter(card => card.type == set2Type)
  

  console.log({run, deduped, set1, set2, cards})

}

export function phase1(app, cards, options) {
  let phaseError = isPhaseInvalid(cards)
  if (phaseError) return phaseError
  Hand.orderByType(cards)
  if (cards.length < 6)
    return

  let n = 0
  let set1Type = 'W'//cards[0].type
  while(set1Type == 'W' && n < cards.length) {
    set1Type = cards[n].type
    n += 1

  }
  n = cards.length - 1
  let set2Type = 'W'//cards[cards.length - 1].type
  while(set2Type == 'W' && n > 0) {
    set2Type = cards[n].type
    n -= 1
  }

  let set1 = cards.filter(card => card.type == set1Type)
  let set2 = cards.filter(card => card.type == set2Type)
  let wilds = cards.filter(card => card.type == 'W')

 
  if(set1Type == set2Type) {
    for(let i = 0; i < Math.floor(set1.length / 2); i++) {
      set2.push(set1.pop())
    }
  }

  while (set1.length < 3 && wilds.length > 0) {
    set1.push(wilds.pop())
  }
  while (set2.length < 3 && wilds.length > 0) {
    set2.push(wilds.pop())
  }

  if( 
    Math.min( set1.length, set2.length) >= 3 
    && set1.length + set2.length == cards.length
  ) {
    return [
      new CompletedSet(
        app,
        set1,
        function (cards, color, type) {return type == set1Type || type == 'W'},
        options && options.shift()
      ),
      new CompletedSet(
        app, 
        set2,
        function (cards, color, type) {return type == set2Type || type == 'W'},
        options && options.shift()
      )

    ]
  }

}

function testPhase1() {
  let cards = [
    {color: 'red', type: 3},
    {color: 'blue', type: 3},
    {color: 'green', type: 3},
    {color: 'red', type: 1},
    {color: 'blue', type: 1},
    {color: 'green', type: 1}
  ]
  
  let phase = phase1.bind(null, dummyApp())


  let result = phase(cards)
  console.assert(Array.isArray(result), 'valid phase1', {cards})

  
  cards = [
    {color: 'red', type: 1},
    {color: 'blue', type: 1},
    {color: 'green', type: 1},
    {color: 'red', type: 2},
    {color: 'red', type: 3},
    {color: 'blue', type: 3},
    {color: 'green', type: 3}
  ]

  result = phase(cards)
  console.assert(!result, 'should fail with additional unmatching card added')

  cards = [
    {color: 'red', type: 1},
    {color: 'blue', type: 1},
    {color: 'green', type: 'W'},
    {color: 'blue', type: 3},
    {color: 'green', type: 3}
  ]

  result = phase(cards)
  console.assert(!result, 'should fail with too few cards')

  cards = [
    {color: 'red', type: 1},
    {color: 'blue', type: 1},
    {color: 'green', type: 1},
    {color: 'blue', type: 3},
    {color: 'green', type: 3},
    {color: 'red', type: 'W'}
  ]
  result = phase(cards)
  console.assert(Array.isArray(result), 'wild card for set2', {result})

  cards = [
    {color: 'red', type: 1},
    {color: 'blue', type: 1},
    {color: 'red', type: 'W'},
    {color: 'green', type: 3},
    {color: 'blue', type: 3},
    {color: 'green', type: 3},
  ]
  result = phase(cards)
  console.log({result})
  console.assert(Array.isArray(result), 'wild card for set1')
  console.assert(result[0].expectedCards.length == 3)
  console.assert(result[1].expectedCards.length == 3)

}

function testPhase2() {
  let actual, expected, source, cards
  let phase = phase2.bind(null, dummyApp())

  expected = [4,2,3]
  actual = dedupe([4,4,2,2,3,3])
  console.assert(expected.toString() === actual.toString(), 'dedupe', {expected, actual})

  expected = [1,2,3]
  actual = expected.slice.apply(expected, getRuns(expected)[0])
  console.assert(expected.toString() === actual.toString(), 'getRuns', {expected, actual})

  source = [1,2,3, 5, 7,8,9]
  actual = getRuns(source)
  expected = [[0,3], [4,7]]
  console.assert(expected.toString() === actual.toString(), 'getRuns', {expected, actual})

  console.log('done')


  cards = [
    {color: 'red', type: 2},
    {color: 'green', type: 4},
    {color: 'blue', type: 7},
    {color: 'green', type: 1},
    {color: 'yellow', type: 7},
    {color: 'blue', type: 7},
    {color: 'yellow', type: 'W'},
  ]

  actual = phase(cards)
  



}

if (TEST_MODE) {
  testPhase1()
  testPhase2()
}

