import { rmSync } from "fs";

const removeDist = (distDir: string, message: string) => {
    console.log(`classnames-minifier: ${message}Cleaning the dist folder...`);
    rmSync(distDir, { recursive: true, force: true });
    console.log("classnames-minifier: Dist folder cleared");
};

export default removeDist;
