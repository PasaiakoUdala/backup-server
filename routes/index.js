const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const dirTree = require('./directory-tree');
const http = require('http');
const url  = require('url');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Backup server API' });
});

router.get('/servers', function (req, res, next) {
    const srcpath = '/mnt/nfs';
    const zerrenda = fs.readdirSync(srcpath)
        .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());

    return res.status(200).send(zerrenda);

});

router.get('/lsdir', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const dir = query.dir;

    const tree = dirTree( dir,null,null,true);

    return res.status(200).json(tree);

});

router.get('/ls', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const dir = query.dir;

    const tree = dirTree(dir);

    return res.status(200).json(tree);

});

module.exports = router;
