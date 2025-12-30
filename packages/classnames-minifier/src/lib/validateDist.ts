import fs from "fs";
import type { Config } from "./types/plugin";
import { CODE_VERSION } from "./constants/configuration";

const readManifest = (manifestPath: string) => {
    try {
        const prevData = fs.readFileSync(manifestPath, { encoding: "utf-8" });
        return JSON.parse(prevData) as Config & { version?: string };
    } catch {
        return {} as Partial<Config & { version?: string }>;
    }
};

const validateDist = (pluginOptions: Config, manifestPath: string) => {
    const { cacheDir, distDir, prefix, reservedNames, distDeletionPolicy, checkDistFreshness } = pluginOptions;

    if (!cacheDir || !distDir) {
        console.log(
            "classnames-minifier: Failed to check the dist folder because cacheDir or distDir is not specified",
        );
        return;
    }
    let configurationError = "";

    if (fs.existsSync(manifestPath)) {
        const prevData = readManifest(manifestPath);
        const configDiffMessages = [];
        if (prevData.prefix !== prefix) {
            configDiffMessages.push(`Different "prefix": "${prevData.prefix}" -> "${prefix}"`);
        }
        if (prevData.cacheDir !== cacheDir) {
            configDiffMessages.push(`Different "cacheDir": "${prevData.cacheDir}" -> "${cacheDir}"`);
        }
        if (prevData.distDir !== distDir) {
            configDiffMessages.push(`Different "distDir": "${prevData.distDir}" -> "${distDir}"`);
        }
        if (
            prevData.reservedNames?.length !== reservedNames?.length ||
            prevData.reservedNames?.some((name) => !reservedNames?.includes(name))
        ) {
            configDiffMessages.push(
                `Different "reservedNames": "${prevData.reservedNames?.join(", ")}" -> "${reservedNames?.join(", ")}"`,
            );
        }
        if (prevData.version !== CODE_VERSION) {
            configDiffMessages.push(`Different package version: "${prevData.version}" -> "${CODE_VERSION}"`);
        }
        if (prevData.distDeletionPolicy && !distDeletionPolicy) {
            configDiffMessages.push(`"distDeletionPolicy" set to "${distDeletionPolicy}"`);
        }
        if (configDiffMessages.length) {
            configurationError = `Changes found in package configuration: \n${configDiffMessages.map((message) => `- ${message};\n`).join("")}`;
        }
    } else if (!checkDistFreshness?.()) {
        configurationError = `Can not find the package cache manifest at ${manifestPath}\n`;
    }
    return configurationError;
};

export default validateDist;
