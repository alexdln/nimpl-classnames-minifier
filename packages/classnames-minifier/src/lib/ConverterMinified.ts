import type { LoaderContext } from "webpack";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync } from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

import type { Config } from "./types/plugin";

type CacheType = {
    [resourcePath: string]: {
        cachePath: string;
        matchings: { [origClass: string]: string };
        type: "new" | "updated" | "old";
    };
};

class ConverterMinified {
    private cacheDir?: string;

    private prefix: string;

    private reservedNames: string[];

    private syncFreedNames: boolean;

    private symbols: string[] = [
        "a",
        "b",
        "c",
        "d",
        "e",
        "f",
        "g",
        "h",
        "i",
        "j",
        "k",
        "l",
        "m",
        "n",
        "o",
        "p",
        "q",
        "r",
        "s",
        "t",
        "u",
        "v",
        "w",
        "x",
        "y",
        "z",
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
    ];

    dirtyСache: CacheType = {};

    freeClasses: string[] = [];

    lastIndex = 0;

    private nextLoopEndsWith = 26;

    private currentLoopLength = 0;

    private nameMap = [0];

    constructor({ cacheDir, prefix = "", reservedNames = [], experimental }: Config) {
        this.prefix = prefix;
        this.reservedNames = reservedNames;
        this.syncFreedNames = Boolean(experimental?.syncFreedNames);

        if (cacheDir) this.invalidateCache(path.join(cacheDir, "ncm"));
    }

    reset = () => {
        this.dirtyСache = {};
        this.freeClasses = [];
        this.lastIndex = 0;
        this.nextLoopEndsWith = 26;
        this.currentLoopLength = 0;
        this.nameMap = [0];
        if (this.cacheDir) {
            this.invalidateCache(this.cacheDir);
        }
    };

    private invalidateCache = (cacheDir: string) => {
        this.cacheDir = cacheDir;
        if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

        const cachedFiles = readdirSync(cacheDir);
        if (cachedFiles.length) {
            console.log("classnames-minifier: Restoring pairs of classes...");
        } else {
            return;
        }

        const usedClassNames: string[] = [];

        const dirtyСache: CacheType = {};
        let prevLastIndex = 0;
        cachedFiles.forEach((file) => {
            const filePath = path.join(cacheDir, file);
            const dirtyCacheFile = readFileSync(filePath, { encoding: "utf8" });
            const [resourcePath, lastIndex, ...classnames] = dirtyCacheFile.split(",");
            if (lastIndex && +lastIndex > prevLastIndex) prevLastIndex = +lastIndex;

            if (existsSync(resourcePath)) {
                const cachedMatchings = classnames.reduce<{ [orig: string]: string }>((acc, cur) => {
                    const [origClass, newClass] = cur.split("=");
                    acc[origClass] = newClass;
                    if (!usedClassNames.includes(newClass)) {
                        usedClassNames.push(newClass);
                    }
                    return acc;
                }, {});
                dirtyСache[resourcePath] = {
                    cachePath: filePath,
                    matchings: cachedMatchings,
                    type: "old",
                };
            } else {
                rmSync(filePath);
            }
        });

        for (let i = 0; i <= prevLastIndex; i++) {
            const newClass = this.generateClassName();
            this.lastIndex += 1;
            const usedClassNameIndex = usedClassNames.indexOf(newClass);

            if (usedClassNameIndex !== -1) {
                usedClassNames.splice(usedClassNameIndex, 1);
            } else if (!this.reservedNames.includes(newClass)) {
                this.freeClasses.push(newClass);
            }
        }

        if (cachedFiles.length) {
            console.log("classnames-minifier: Pairs restored");
        }

        this.dirtyСache = dirtyСache;
    };

    private generateClassName() {
        const symbolsCount = 62;
        if (this.lastIndex >= this.nextLoopEndsWith) {
            if (this.nextLoopEndsWith === 26) this.nextLoopEndsWith = 62 * symbolsCount;
            else this.nextLoopEndsWith = this.nextLoopEndsWith * symbolsCount;
            this.nameMap.push(0);
            this.currentLoopLength += 1;
        }

        const currentClassname = this.prefix + this.nameMap.map((e) => this.symbols[e]).join("");

        for (let i = this.currentLoopLength; i >= 0; i--) {
            if (this.nameMap[i] === symbolsCount - 1 || (i === 0 && this.nameMap[i] === 25)) {
                this.nameMap[i] = 0;
            } else {
                this.nameMap[i] += 1;
                break;
            }
        }

        return currentClassname;
    }

    private getTargetClassName(origName: string) {
        let targetClassName: string;
        if (this.freeClasses.length && this.syncFreedNames) {
            targetClassName = this.freeClasses.shift() as string;
        } else {
            targetClassName = this.generateClassName();
        }

        if (this.reservedNames.includes(targetClassName)) {
            targetClassName = this.getTargetClassName(origName);
            this.lastIndex += 1;
        }

        return targetClassName;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getLocalIdent({ resourcePath }: LoaderContext<any>, _localIdent: string, origName: string) {
        if (!this.dirtyСache[resourcePath]) {
            this.dirtyСache[resourcePath] = {
                cachePath: this.cacheDir ? path.join(this.cacheDir, uuidv4()) : "",
                matchings: {},
                type: "new",
            };
        }
        const currentCache = this.dirtyСache[resourcePath];

        if (currentCache.matchings[origName]) return currentCache.matchings[origName];

        const targetClassName = this.getTargetClassName(origName);
        currentCache.matchings[origName] = targetClassName;
        currentCache.type = "updated";
        this.lastIndex += 1;
        return targetClassName;
    }
}

export default ConverterMinified;
