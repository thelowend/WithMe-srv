const Router = require('express').Router
const router = new Router()

const feed = require('./model/feed/router')
const history = require('./model/history/router')
const user = require('./model/user/router')
const hooks = require('./hooks/router')
const evaluation = require('./evaluation/router')

router.route('/').get((req, res) => {
  res.json({ message: 'Welcome to with-me-srv API!' })
})

router.use('/feed', feed)
router.use('/history', history)
router.use('/user', user)
router.use('/hooks', hooks)
router.use('/evaluation', evaluation)

module.exports = router
