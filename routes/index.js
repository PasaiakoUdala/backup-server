const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/servers', function (req, res, next) {
    const srcpath = '/mnt/nfs';

    const zerrenda = fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());

    // return res.json(zerrenda);
    return res.send(200,zerrenda);

});

module.exports = router;
