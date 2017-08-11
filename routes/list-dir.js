'use strict';

const FS = require('fs');
const PATH = require('path');
const constants = {
    DIRECTORY: 'directory',
    FILE: 'file'
}

function safeReadDirSync(path) {
    let dirData = {};
    try {
        dirData = FS.readdirSync(path);
    } catch (ex) {
        if (ex.code === "EACCES")
        //User does not have permissions, ignore directory
            return null;
        if (ex.code === "EIO")
            return null;
        else throw ex;
    }
    return dirData;
}

function listDir(path, options, onEachFile, foldersOnly = false) {
    const name = PATH.basename(path);
    const item = {path, name};
    let stats;
    let items = [];

    try {
        stats = FS.statSync(path);
    }
    catch (e) {
        return null;
    }

    try {
        // Skip if it matches the exclude regex
        let regxx = new RegExp(path.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'));
        // if (options && options.exclude && options.exclude.test(path))
        if (options && options.exclude && new RegExp(options.exclude).test(path))
            return null;
    } catch (e) {
        return null;
    }

    if (stats.isFile()) {

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
        return item;
    }
    else if (stats.isDirectory()) {
        let dirData = safeReadDirSync(path);
        if (dirData === null) return null;

        item.children=[];
        item.size = stats.size;  // File size in bytes
        item.atime = stats.atime;
        item.mtime = stats.mtime;
        item.ctime = stats.ctime;
        item.birthtime = stats.birthtime;
        item.mode = '0' + (stats.mode & parseInt('777', 8)).toString(8);
        item.type = constants.DIRECTORY;

        dirData.map(file => {
            const sub = PATH.join(path, file);
            const f = {path, file};
            console.log(sub);

            const stat = FS.statSync(sub);

            f.name = file;
            f.size = stat.size;  // File size in bytes
            f.atime = stat.atime;
            f.mtime = stat.mtime;
            f.ctime = stat.ctime;
            f.birthtime = stat.birthtime;
            f.mode = '0' + (stat.mode & parseInt('777', 8)).toString(8);
            if (stat.isFile()) {
                const ext = PATH.extname(path).toLowerCase();
                f.extension = ext;
                f.type = constants.FILE;
            } else {
                f.type = constants.DIRECTORY;
            }

            item.children.push(f)

        });
        item.children.sort((a, b) => {
            if (a === null || b === null) {
                return -1;
            }
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

        return item;

    } else {
        return null; // Or set item.size = 0 for devices, FIFO and sockets ?
    }
    return item;
}

module.exports = listDir;
