const express = require('express');
const router = express();
const fs = require('fs');
const path = require('path');
const dirTree = require('./directory-tree');
const listDir = require('./list-dir');
const http = require('http');
const url  = require('url');
const mime = require('mime');
const bodyParser = require('body-parser');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


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

router.get('/dirlist', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const dir = query.dir;

    const tree = listDir( dir, {exclude:'/mnt/nfs/jails/'},null);

    return res.status(200).json(tree);

});

router.get('/lsdir', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const dir = query.dir;

    const tree = dirTree( dir, {exclude:'/mnt/nfs/jails/'},null,true);

    return res.status(200).json(tree);

});

router.get('/ls', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const dir = query.dir;

    const tree = dirTree(dir);

    return res.status(200).json(tree);

});

router.get('/lssnapshoot', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    let dir = query.dir;
    let zerrenda = null;
    let resp = null;
    dir = dir + "/.zfs";

    console.log(dir);
    if (fs.existsSync(dir)) {
        console.log("barruan");
        dir = dir + "/snapshot";
        console.log(dir);
        if (fs.existsSync(dir)) {
            console.log("existitzen da");
            zerrenda = fs.readdirSync(dir).filter(
                file => fs.lstatSync(
                    path.join(dir, file)).isDirectory()
            );
        }
    }

    // if ( zerrenda !== null ) {
    //     let rest = zerrenda.reverse().map(function (x) {
    //         console.log("----------------");
    //         console.log(x);
    //         console.log("----------------");
    //         let dt = x.split("-")[1].split(".");
    //         console.log("dt");
    //         console.log(dt);
    //         let ano = dt[0].substring(0, 4);
    //         let mes = dt[0].substring(4, 6);
    //         let dia = dt[0].substring(6, 8);
    //         let hora = dt[1].substring(0, 2);
    //         let min = dt[1].substring(2, 4);

    //         let r;
    //         r = ano + "-" + mes + "-" + dia + " " + hora + ":" + min;
    //         return {dir:query.dir,fs:x,dt:r};
    //     });

    //     return res.status(200).send(rest);
    // }
    if (zerrenda !== null) {
        const rest = zerrenda.reverse().map((str) => {
            
            const regex = /(\d{4}-\d{2}-\d{2})_(\d{2}-\d{2})/;
            const match = str.match(regex);

            if (match) {
                const date = match[1]; // Extracted date: 2024-10-15
                const time = match[2]; // Extracted time: 10-00
                const dateTimeString = `${date} ${time.replace('-', ':')}`; // Format time as HH:MM
                console.log("Date:", date);
                console.log("Time:", time);
                console.log(dateTimeString); // Output: 2024-10-15 10:00
                return { dir: query.dir, fs: str, dt: dateTimeString};
            }
            
            return;
            
        });
    
        return res.status(200).send(rest);
    }

    return res.status(404).send("Ez da aurkitu");


});

router.get('/jetsi', function (req, res, next) {
  console.log("GET download");
  return res.status(200).send("jetxi");
});

router.post('/jetsi', function (req, res, next) {
    console.log("JETSI _ POST");

    let archiver = require('archiver');
    const $filename = "/tmp/example.zip";
    let output = fs.createWriteStream($filename);
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level.
    });

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', function() {
        console.log(archive.pointer() + ' total bytes');
        console.log('archiver has been finalized and the output file descriptor has closed.');
        res.download($filename);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', function() {
        console.log('Data has been drained');
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', function(err) {
        if (err.code === 'ENOENT') {
            // log warning
        } else {
            // throw error
            throw err;
        }
    });

    // good practice to catch this error explicitly
    archive.on('error', function(err) {
        throw err;
    });

    // pipe archive data to the file
    archive.pipe(output);

    let filesFolders = req.body.fs;
    const len = filesFolders.length;

    if ( len < 1) { return; }

    let initPath="";
    for (let i = 0, len = filesFolders.length; i < len; i++) {

        let $fileFolder = filesFolders[i];
        let spath = filesFolders[0];
        let paths = [];
        let k;

        for(let k = 1 ; k < spath.length-1 ; k++) {
            if(spath[k]==='/') paths.push(spath.substr(0,k));
        }
        let endPaths = paths[paths.length-1];


        if (fs.lstatSync($fileFolder).isDirectory()) {
            // archive.directory($fileFolder,true);
            archive.directory($fileFolder,$fileFolder.replace(endPaths,''));
        } else {
            archive.file($fileFolder);
        }

        console.log("****************************************************************");
        console.log($fileFolder);
        console.log("****************************************************************");

    }

    archive.finalize();


});

router.get('/download', function (req, res, next) {
    const url_parts = url.parse(req.url, true);
    const query = url_parts.query;
    const file = query.dir;
    const filename = path.basename(file);
    const mimetype = mime.lookup(file);

    res.setHeader("Content-Disposition", "inline; filename=\"" + filename + "\"");
    res.setHeader('Content-type', mimetype);

    let filestream = fs.createReadStream(file);
    filestream.pipe(res);
});


module.exports = router;
