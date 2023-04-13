import { assertGitRepo } from "../utils/git";
import { confirm, isCancel, outro, select, spinner } from "@clack/prompts";
import {
  GenerateCommitMessageErrorEnum,
  generateCommitMessageWithChatCompletion
} from "../generateCommitMessageFromGitDiff";
import chalk from "chalk";
import { execa } from "execa";
import { getGitRemotes } from "./commit";

export const generateCommitMessageFromGitDiff = async (
  diff: string,
  extraArgs: string[]
): Promise<void> => {
  await assertGitRepo();

  const commitSpinner = spinner();
  commitSpinner.start("Generating the commit message");
  const commitMessage = await generateCommitMessageWithChatCompletion(diff);

  // TODO: show proper error messages
  if (typeof commitMessage !== "string") {
    const errorMessages = {
      [GenerateCommitMessageErrorEnum.emptyMessage]:
        "empty openAI response, weird, try again",
      [GenerateCommitMessageErrorEnum.internalError]:
        "internal error, try again",
      [GenerateCommitMessageErrorEnum.tooMuchTokens]:
        "too much tokens in git diff, stage and commit files in parts"
    };

    outro(`${chalk.red("✖")} ${errorMessages[commitMessage.error]}`);
    process.exit(1);
  }

  commitSpinner.stop("📝 Commit message generated");

  outro(
    `Commit message:
${chalk.grey("——————————————————")}
${commitMessage}
${chalk.grey("——————————————————")}`
  );

  const isCommitConfirmedByUser = true;

  if (isCommitConfirmedByUser && !isCancel(isCommitConfirmedByUser)) {
    const { stdout } = await execa("git", [
      "commit",
      "-m",
      commitMessage,
      ...extraArgs
    ]);

    outro(`${chalk.green("✔")} successfully committed`);

    outro(stdout);

    const remotes = await getGitRemotes();

    if (!remotes.length) {
      const { stdout } = await execa("git", ["push"]);
      if (stdout) outro(stdout);
      process.exit(0);
    }

    if (remotes.length === 1) {
      const isPushConfirmedByUser = await confirm({
        message: "Do you want to run `git push`?"
      });

      if (isPushConfirmedByUser && !isCancel(isPushConfirmedByUser)) {
        const pushSpinner = spinner();

        pushSpinner.start(`Running \`git push ${remotes[0]}\``);

        const { stdout } = await execa("git", [
          "push",
          "--verbose",
          remotes[0]
        ]);

        pushSpinner.stop(
          `${chalk.green("✔")} successfully pushed all commits to ${remotes[0]}`
        );

        if (stdout) outro(stdout);
      } else {
        outro("`git push` aborted");
        process.exit(0);
      }
    } else {
      const selectedRemote = (await select({
        message: "Choose a remote to push to",
        options: remotes.map((remote) => ({ value: remote, label: remote }))
      })) as string;

      if (!isCancel(selectedRemote)) {
        const pushSpinner = spinner();

        pushSpinner.start(`Running \`git push ${selectedRemote}\``);

        const { stdout } = await execa("git", ["push", selectedRemote]);

        pushSpinner.stop(
          `${chalk.green(
            "✔"
          )} successfully pushed all commits to ${selectedRemote}`
        );

        if (stdout) outro(stdout);
      } else outro(`${chalk.gray("✖")} process cancelled`);
    }
  }
};
