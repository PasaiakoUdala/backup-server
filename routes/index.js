const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirTree = require('directory-tree');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/servers', function (req, res, next) {
    const srcpath = '/mnt/nfs';

    const zerrenda = fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());

    return res.send(200,zerrenda);

});

router.get('/ls', function (req, res, next) {
    const srcpath = '/mnt/nfs/Aplik';
    const tree = dirTree(srcpath);
    return res.json( tree);

});

module.exports = router;
