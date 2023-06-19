import { getChangedFiles, getStagedFiles, gitAdd } from "../utils/git";
import { intro, outro, spinner } from "@clack/prompts";
import { trytm } from "../utils/trytm";
import chalk from "chalk";
import { generateCommitMessageFromGitDiff } from "./generate-commit-message";
import { removeOrigFromChangedFiles } from "./remove-orig-from-changed-files";
import { getDiff } from "../utils/get-diff";
import { done } from "./commit-with-message-and-push";

export async function commit(
  extraArgs: string[] = [],
  isStageAllFlag: Boolean = false
) {
  if (isStageAllFlag) {
    const changedFiles = await getChangedFiles();
    const cleanedChangedFiles: string[] = removeOrigFromChangedFiles(changedFiles)
    if (cleanedChangedFiles) await gitAdd({ files: cleanedChangedFiles });
    else {
      outro("No changes detected, write some code and run `oc` again");
      process.exit(1);
    }
  }

  const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());
  const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());

  if (!changedFiles?.length && !stagedFiles?.length) {
    outro(chalk.red("No changes detected"));
    process.exit(0);
  }

  intro("open-commit");
  if (errorChangedFiles ?? errorStagedFiles) {
    outro(`${chalk.red("✖")} ${errorChangedFiles ?? errorStagedFiles}`);
    process.exit(1);
  }

  const stagedFilesSpinner = spinner();

  stagedFilesSpinner.start("Counting staged files");

  if (!stagedFiles.length) {
    stagedFilesSpinner.stop("No files are staged, staging all");
    await commit(extraArgs, true);
    process.exit(1);
  }

  stagedFilesSpinner.stop(
    `${stagedFiles.length} staged files:\n${stagedFiles
      .map((file) => `  ${file}`)
      .join("\n")}`
  );

  const [, generateCommitError] = await trytm(
    generateCommitMessageFromGitDiff(
      await getDiff({ files: stagedFiles }),
      extraArgs,
      stagedFiles
    )
  );

  if (generateCommitError) {
    outro(`${chalk.red("✖")} ${generateCommitError}`);
    process.exit(1);
  }
  done()
  process.exit(0);
}
