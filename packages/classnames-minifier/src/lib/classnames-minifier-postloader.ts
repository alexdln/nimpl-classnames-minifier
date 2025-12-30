/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LoaderContext } from "webpack";
import fs from "fs";

import type ConverterMinified from "./ConverterMinified";

export default function (
    this: LoaderContext<{ classnamesMinifier: ConverterMinified }>,
    source: string,
    map: any,
    meta: any,
) {
    const options = this.getOptions();
    const classnamesMinifier = options.classnamesMinifier;
    Object.entries(classnamesMinifier.dirtyСache).forEach(([resourcePath, data]) => {
        if (data.type !== "old") {
            fs.writeFileSync(
                data.cachePath,
                `${resourcePath},${classnamesMinifier.lastIndex},${Object.entries(data.matchings)
                    .map(([key, value]) => `${key}=${value}`)
                    .join(",")}`,
            );
        }
    });

    this.callback(null, source, map, meta);
    return;
}
