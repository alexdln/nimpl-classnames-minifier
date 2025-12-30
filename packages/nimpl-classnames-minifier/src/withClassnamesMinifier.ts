/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Configuration } from "webpack";
import type { Config } from "classnames-minifier";
import ClassnamesMinifier from "classnames-minifier";
import path from "path";
import fs from "fs";

import injectConfig from "./lib/injectConfig";

export type PluginOptions = Omit<Config, "cacheDir" | "distDir" | "checkDistFreshness"> & { disabled?: boolean };

let classnamesMinifier: ClassnamesMinifier;

const isTurbopackEnabled = (nextConfig: any): boolean => {
    if (nextConfig?.experimental?.turbo || nextConfig?.turbopack) {
        return true;
    }

    if (process.env.NEXT_PRIVATE_TURBO === "1" || process.env.TURBOPACK != null || process.argv.includes("--turbo")) {
        return true;
    }

    return false;
};

const withClassnameMinifier = (pluginOptions: PluginOptions = {}) => {
    return (nextConfig: any = {}) => {
        if (pluginOptions.disabled) return nextConfig;

        const turbopackEnabled = isTurbopackEnabled(nextConfig);
        if (turbopackEnabled) {
            console.warn(
                "classnames-minifier is disabled in turbopack mode. Please run the process with `--webpack` flag",
            );
            return nextConfig;
        }

        if (!classnamesMinifier) {
            const distDir = nextConfig?.distDir || ".next";
            const distDirAbsolute = path.join(process.cwd(), distDir);
            const cacheDir = path.join(distDirAbsolute, "cache/ncm");
            classnamesMinifier = new ClassnamesMinifier({
                prefix: pluginOptions.prefix,
                reservedNames: pluginOptions.reservedNames,
                distDeletionPolicy: pluginOptions.distDeletionPolicy,
                experimental: pluginOptions.experimental,
                distDir: distDirAbsolute,
                checkDistFreshness: () => {
                    return !fs.existsSync(".next/build-manifest.json");
                },
                cacheDir,
            });
        }

        return {
            ...nextConfig,
            webpack: (config: Configuration, options: any) => {
                injectConfig({ classnamesMinifier }, config.module?.rules);

                if (typeof nextConfig.webpack === "function") {
                    return nextConfig.webpack(config, options);
                }

                return config;
            },
        };
    };
};

export default withClassnameMinifier;
