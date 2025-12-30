/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LoaderContext } from "webpack";

import type ConverterMinified from "./ConverterMinified";

export default function (
    this: LoaderContext<{ classnamesMinifier: ConverterMinified }>,
    source: string,
    map: any,
    meta: any,
) {
    const options = this.getOptions();
    const classnamesMinifier = options.classnamesMinifier;
    const maybeClassesList = source.match(/\.-?[_a-zA-Z]+[_a-zA-Z0-9-]*/g);
    const cache = classnamesMinifier.dirtyСache[this.resourcePath];

    /**
     * if some class has ceased to be used since the last time the file was loaded, we remove it from the cache
     */
    if (cache && cache.matchings) {
        cache.matchings = maybeClassesList
            ? Object.fromEntries(
                  Object.entries(cache.matchings).filter(([key]) => maybeClassesList?.includes(`.${key}`)),
              )
            : {};
    }

    this.callback(null, source, map, meta);
    return;
}
