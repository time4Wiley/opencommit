import { assertGitRepo } from "../utils/git";
import { isCancel, outro, spinner } from "@clack/prompts";
import {
  GenerateCommitMessageErrorEnum,
  generateCommitMessageWithChatCompletion
} from "../generateCommitMessageFromGitDiff";
import chalk from "chalk";
import { execa } from "execa";
// import { getGitRemotes } from "./commit";
import { hasUpstream } from "./git-branch-has-upstream";

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

    if (await hasUpstream())
    {
      const { stdout } = await execa("git", ["push"]);
      if (stdout) outro(stdout);
      outro(chalk(...chalk.green("✔"), "successfully pushed"));
      process.exit(0);
    }
  }
};
