export function dummyApp() {
  let client = dummyClient()
  let dummyApp = {client, stage: {}, keyboardHandler: {}, loader: {resources: {cancel: {}}}}

  dummyApp.stage.addChild = function (){}
  dummyApp.keyboardHandler.registerHandler = function (){}
  
//loader.resources['cancel']
  return dummyApp
}


function dummyClient() {
  return {
    registerDraggingListener: () => {}
  }
}



window.TEST_MODE = !!location.search.match(/(\?|&)test($|&)/)
