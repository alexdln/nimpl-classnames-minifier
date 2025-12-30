import type { Config } from "./types/plugin";

const validKeys = [
    "prefix",
    "reservedNames",
    "cacheDir",
    "distDir",
    "distDeletionPolicy",
    "experimental",
    "checkDistFreshness",
];

const validateIsObject = (config: unknown): config is Config => {
    if (!config) return false;

    if (typeof config !== "object" || Array.isArray(config)) {
        console.error(
            `classnames-minifier: Invalid configuration. Expected object, received ${typeof config}. See https://github.com/alexdln/classnames-minifier#configuration`,
        );
        process.exit();
    }

    const isValidKeys = Object.keys(config).every((key) => validKeys.includes(key));

    if (!isValidKeys) {
        console.error(
            `classnames-minifier: Invalid configuration. Valid keys are: ${validKeys.join(", ")}. See https://github.com/alexdln/classnames-minifier#configuration`,
        );
        process.exit();
    }

    return true;
};

const validateConfig = (config: unknown = {}): Config => {
    if (!validateIsObject(config)) return {};

    if (config.prefix && !config.prefix.match(/^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/)) {
        console.error(
            `classnames-minifier: Invalid prefix. It should match following rule: "^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$". See https://github.com/alexdln/classnames-minifier#configuration`,
        );
        process.exit();
    }

    return config;
};

export default validateConfig;
