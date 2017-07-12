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

function directoryTree (path, options, onEachFile,foldersOnly=false, zenbat = 0) {
    const name = PATH.basename(path);
    const item = { path, name };
    let stats;

    if (zenbat > 3) {
        return;
    } else {
        zenbat=zenbat+1;
    }


    try { stats = FS.statSync(path); }
    catch (e) { return null; }

    // Skip if it matches the exclude regex
    if (options && options.exclude && options.exclude.test(path))
        return null;

    if (stats.isFile()) {
        if ( foldersOnly === true ) {
            return null;
        }

        const ext = PATH.extname(path).toLowerCase();

        // Skip if it does not match the extension regex
        if (options && options.extensions && !options.extensions.test(ext))
            return null;

        item.size = stats.size;  // File size in bytes
        item.extension = ext;
        item.type = constants.FILE;
        item.atime = stats.atime;
        item.mtime = stats.mtime;
        item.ctime = stats.ctime;
        item.birthtime = stats.birthtime;
        item.mode = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        if (onEachFile) {
            onEachFile(item, PATH);
        }
    }
    else if (stats.isDirectory()) {
        let dirData = safeReadDirSync(path);
        if (dirData === null) return null;

        if (foldersOnly === true) {
            item.children = FS.readdirSync(path).map(
                child => directoryTree(
                    PATH.join(path, child),null, onEachFile, foldersOnly, zenbat)
                )
                .filter(e => !!e);
        } else {
            item.children = FS.readdirSync(path)
                .map(child => directoryTree(PATH.join(path, child),null, onEachFile, foldersOnly))
                .sort((a, b) => {
                    if (a.type < b.type) {
                        return -1;
                    }

                    if (a.type > b.type) {
                        return 1;
                    }

                    if (a.type === b.type) {
                        if (a.name < b.name) {
                            return -1;
                        }
                        else if (a.name > b.name) {
                            return 1;
                        }
                    }

                    return 0;
                })
                .filter(e => !!e);
        }

        item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
        item.atime = stats.atime;
        item.mtime = stats.mtime;
        item.ctime = stats.ctime;
        item.birthtime = stats.birthtime;
        item.mode = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        item.type = constants.DIRECTORY;
    } else {
        return null; // Or set item.size = 0 for devices, FIFO and sockets ?
    }
    return item;
}

module.exports = directoryTree;
