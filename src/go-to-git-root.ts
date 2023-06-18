import { execSync } from "child_process";

export function goToGitRoot() {
  try {
    // Run git command to find the root directory of the git repository
    const gitRoot = execSync("git rev-parse --show-toplevel", { encoding: "utf8" }).trim();

    // Change the current working directory to the root directory of the git repository
    process.chdir(gitRoot);

    console.log(`Current working directory changed to: ${process.cwd()}`);
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
