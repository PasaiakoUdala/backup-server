# Backaup kudeatzailea



node_modules barruan, direcory tree paketean egokitzapenak egin behar dira:

    else if (stats.isDirectory()) {
        let dirData = safeReadDirSync(path);
        if (dirData === null) return null;

        item.children = FS.readdirSync(path)
            .map(child => directoryTree(PATH.join(path, child), onEachFile))
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
        item.size = item.children.reduce((prev, cur) => prev + cur.size, 0);
        item.type = constants.DIRECTORY;
    } else {
        return null; // Or set item.size = 0 for devices, FIFO and sockets ?
    }
