import { getChangedFiles, getDiff, getStagedFiles, gitAdd } from "../utils/git";
import { confirm, intro, isCancel, multiselect, outro, spinner } from "@clack/prompts";
import { trytm } from "../utils/trytm";
import chalk from "chalk";
import { generateCommitMessageFromGitDiff } from "./generate-commit-message";

export async function commit(
  extraArgs: string[] = [],
  isStageAllFlag: Boolean = false
) {
  if (isStageAllFlag) {
    const changedFiles = await getChangedFiles();

    if (changedFiles) await gitAdd({ files: changedFiles });
    else {
      outro("No changes detected, write some code and run `oc` again");
      process.exit(1);
    }
  }

  const [stagedFiles, errorStagedFiles] = await trytm(getStagedFiles());
  const [changedFiles, errorChangedFiles] = await trytm(getChangedFiles());

  if (!changedFiles?.length && !stagedFiles?.length) {
    outro(chalk.red("No changes detected"));
    process.exit(1);
  }

  intro("open-commit");
  if (errorChangedFiles ?? errorStagedFiles) {
    outro(`${chalk.red("✖")} ${errorChangedFiles ?? errorStagedFiles}`);
    process.exit(1);
  }

  const stagedFilesSpinner = spinner();

  stagedFilesSpinner.start("Counting staged files");

  if (!stagedFiles.length) {
    stagedFilesSpinner.stop("No files are staged");
    const isStageAllAndCommitConfirmedByUser = await confirm({
      message: "Do you want to stage all files and generate commit message?"
    });

    if (
      isStageAllAndCommitConfirmedByUser &&
      !isCancel(isStageAllAndCommitConfirmedByUser)
    ) {
      await commit(extraArgs, true);
      process.exit(1);
    }

    if (stagedFiles.length === 0 && changedFiles.length > 0) {
      const files = (await multiselect({
        message: chalk.cyan("Select the files you want to add to the commit:"),
        options: changedFiles.map((file) => ({
          value: file,
          label: file
        }))
      })) as string[];

      if (isCancel(files)) process.exit(1);

      await gitAdd({ files });
    }

    await commit(extraArgs, false);
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
      extraArgs
    )
  );

  if (generateCommitError) {
    outro(`${chalk.red("✖")} ${generateCommitError}`);
    process.exit(1);
  }

  process.exit(0);
}
