import { assertGitRepo } from "../utils/git";
import { outro, spinner } from "@clack/prompts";
import {
  GenerateCommitMessageErrorEnum,
  generateCommitMessageWithChatCompletion
} from "../generateCommitMessageFromGitDiff";
import chalk from "chalk";
// import { getGitRemotes } from "./commit";
import { commitWithMessageAndPush } from "./commit-with-message-and-push";

export const generateCommitMessageFromGitDiff = async (
  diff: string,
  extraArgs: string[]
  , stagedFiles: string[]): Promise<void> => {
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
    // process.exit(1);
  }

  commitSpinner.stop("📝 Commit message generated");

  outro(
    `Commit message:
${chalk.grey("——————————————————")}
${commitMessage}
${chalk.grey("——————————————————")}`
  );

  if (typeof commitMessage !== "string") {
    const filenamesAsCommitMessage = stagedFiles.join("\n");
    outro(`${chalk.red("🌕")} ${filenamesAsCommitMessage}`);

    await commitWithMessageAndPush(filenamesAsCommitMessage, extraArgs);
  }
  else {
    await commitWithMessageAndPush(commitMessage, extraArgs);
  }
};
