const Router = require('express').Router
const router = new Router()

const path = require('path'); 

const feed = require('./model/feed/router')
const helprequest = require('./model/helprequest/router')
const history = require('./model/history/router')
const user = require('./model/user/router')
const hooks = require('./hooks/router')
const evaluation = require('./evaluation/router')

router.route('/').get((req, res) => {
  res.sendFile(path.join(__dirname, 'backoffice', 'index.html'));
})

router.use('/feed', feed)
router.use('/helprequest', helprequest)
router.use('/history', history)
router.use('/user', user)
router.use('/hooks', hooks)
router.use('/evaluation', evaluation)

module.exports = router
