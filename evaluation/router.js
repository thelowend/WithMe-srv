const Router = require('express').Router
const router = new Router()
const path = require('path')
const fs = require('fs')

router.route('/:category')
  .get((req, res) => {
    res.setHeader('Content-Type', 'application/json');
    let testFile;
    switch(req.params.category.trim().toLowerCase()) {
      case 'adult':
        testFile = 'EN_DSM5_Level2_Depression_Adult.json'
        break;
      case 'child':
        testFile = 'EN_DSM5_Level2_Depression_Adult.json'
        break;
    }
    if(!testFile) {
      res.sendStatus(400);
    } else {
      const data = fs.readFileSync(path.join(__dirname, '/files/JSON/', testFile))
      return res.status(200).send(data);
    }
  })

module.exports = router
