class KeyboardHandler {
  constructor(app) {
    this.attachEventListeners(app.view)
    this.downKeys = {}
    this.handlers = {}
  }


  registerHandler(code, callback) {
    this.handlers[code] = callback
  }

  unregisterHandlers() {
    for(let code of arguments) {
      this.handlers[code] = null
    }
  }


  attachEventListeners(view) {
    let handler = this
    //console.log({view})
    view.tabIndex = 1
    view.addEventListener('keypress', e => {
      if (handler.downKeys[e.code])
        return

      let callback = this.handlers[e.code] 

      if (typeof callback == 'function') {
        callback(e)

      }

      handler.downKeys[e.code] = true
    }) 

    view.addEventListener('keyup', e => {
      //console.log(handler.downKeys)
      handler.downKeys[e.code] = false
    })
  }
}


export default KeyboardHandler
