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

    return res.status(200).send(zerrenda);

});

router.get('/ls', function (req, res, next) {
    // const srcpath = '/mnt/nfs/Aplik';
    const srcpath = '/home/local/PASAIA/iibarguren/Deskargak';
    const tree = dirTree(srcpath);
    return res.status(200).json(tree);

    // const zerrenda = fs.readdirSync(srcpath)
    //     .filter(file => fs.lstatSync(path.join(srcpath, file)).isDirectory());

    // return res.status(200).send(zerrenda);

});

module.exports = router;
