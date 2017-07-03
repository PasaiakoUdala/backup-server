'use strict';

const FS = require('fs');
const PATH = require('path');
const constants = {
    DIRECTORY: 'directory',
    FILE: 'file'
}

function safeReadDirSync (path) {
    let dirData = {};
    try {
        dirData = FS.readdirSync(path);
    } catch(ex) {
        if (ex.code == "EACCES")
        //User does not have permissions, ignore directory
            return null;
        else throw ex;
    }
    return dirData;
}

function dirtree (path, options, onEachFile) {
    const name = PATH.basename(path);
    const item = { path, name };
    let stats;

    try { stats = FS.statSync(path); }
    catch (e) { return null; }

    // Skip if it matches the exclude regex
    if (options && options.exclude && options.exclude.test(path))
        return null;

    if (stats.isFile()) {

        return null;

    }
    else if (stats.isDirectory()) {
        let dirData = safeReadDirSync(path);
        if (dirData === null) return null;

        item.children = FS.readdirSync(path)
            .map(child => dirtree(PATH.join(path, child), onEachFile))
            .filter(e => !!e);
        item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
        item.type = constants.DIRECTORY;
    } else {
        return null; // Or set item.size = 0 for devices, FIFO and sockets ?
    }
    return item;
}

module.exports = dirtree;