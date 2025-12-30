export type Config = {
    /**
     * The directory where the package cache will be written
     */
    cacheDir?: string;
    /**
     * Directory where the project is built
     */
    distDir?: string;
    /**
     * Prefix which will be added to each generated name
     */
    prefix?: string;
    /**
     * Reserved minified names. Use this option if you are adding short classes manually
     */
    reservedNames?: string[];
    /**
     * Package policy to resolve potential problems with minified classes
     *
     * This may happen due to the following reasons:
     *
     * 1. Launching the package for the first time. Package need clean next.js cache to put everything in the correct order
     * 2. Changing the package configuration. Package need clean next.js cache to rebuild it with classes according to the new rules
     * 3. Exceeding the limit on freed classes (these are classes that were used before, but are now *probably* no longer used)
     *
     * @param "warning" - a warning message will simply be displayed.
     * With this option, there is a high risk of errors and duplicates of generated classes.
     *
     * @param "error" - an error will be thrown, and as a result the build will stop.
     * If this option occurs, delete the next.js cache manually and restart the build.
     *
     * @param "auto" - the package will automatically delete the next.js cache directory.
     *
     * @default "error"
     */
    distDeletionPolicy?: "warning" | "error" | "auto";
    /**
     * Additional check of the dist directory for freshness
     */
    checkDistFreshness?: () => boolean;
    experimental?: {
        /**
         * Automatically synchronize freed classes (for example, if you deleted the original styles)
         * Such classes will be reused in new locations. In this case, there may be situations that the package
         * will mistakenly consider them freed and reuse the class again, thereby creating duplicates.
         *
         * Be careful using this option
         * @default false
         */
        syncFreedNames?: boolean;
        /**
         * Limit of unused minified classes. Such classes are not reused by default,
         * since the package cannot be sure of this at this time.
         *
         * @default 100000
         */
        freedNamesLimit?: number;
    };
};
