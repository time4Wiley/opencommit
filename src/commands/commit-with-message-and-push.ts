import { isCancel, outro } from "@clack/prompts";
import chalk from "chalk";
import { execa } from "execa";
import { hasUpstream } from "./git-branch-has-upstream";

export function done() {
  outro(`${chalk.green("🌕 ✔✔✔")} Done!`);

}

export async function commitWithMessageAndPush(commitMessage: string, extraArgs: string[]) {
  const isCommitConfirmedByUser = true;

  if (isCommitConfirmedByUser && !isCancel(isCommitConfirmedByUser)) {
    const insertingMessageIndex = extraArgs.indexOf("--inserting_message");
    let messageToCommit = commitMessage;
    if (insertingMessageIndex !== -1) {
      messageToCommit = `${extraArgs[insertingMessageIndex + 1]}\n${commitMessage}`;
      extraArgs.splice(insertingMessageIndex, 2);
    }

    const { stdout } = await execa("git", [
      "commit",
      "-m",
      messageToCommit,
      ...extraArgs
    ]);

    outro(`${chalk.green("✔")} successfully committed`);

    outro(stdout);

    if (await hasUpstream()) {
      const { stdout } = await execa("git", ["push", ...extraArgs]);
      if (stdout) outro(stdout);
      outro(`${chalk.green("✔")} successfully pushed`);
      done();
      process.exit(0);
    }
  }
}
