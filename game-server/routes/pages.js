const express = require('express')
const path = require('path')


let router = express.Router()


router.use(express.static(path.join(__dirname,'../../pages/'), {extensions: ['html']}))


module.exports = router
