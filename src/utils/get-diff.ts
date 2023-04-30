import { outro } from "@clack/prompts";
import { execa } from "execa";

export const getDiff = async ({ files }: { files: string[] }) => {
  const lockFiles = files.filter(
    (file) => file.includes(".lock") || file.includes("-lock.")
  );

  if (lockFiles.length) {
    outro(
      `Some files are '.lock' files which are excluded by default from 'git diff'. No commit messages are generated for this files:\n${lockFiles.join(
        "\n"
      )}`
    );
  }

  const filesWithoutLocks = files.filter(
    (file) => !file.includes(".lock") && !file.includes("-lock.")
  );

  const { stdout: diff } = await execa("git", [
    "diff",
    "--staged",
    "--",
    ...filesWithoutLocks
  ]);

  return diff;
};
