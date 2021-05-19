export function dummyApp() {
  let dummyApp = {stage: {}, keyboardHandler: {}}

  dummyApp.stage.addChild = function (){}
  dummyApp.keyboardHandler.registerHandler = function (){}
  return dummyApp
}


