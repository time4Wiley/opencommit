import { isCancel, outro } from "@clack/prompts";
import chalk from "chalk";
import { execa } from "execa";
import { hasUpstream } from "./git-branch-has-upstream";

export function done() {
  outro(`${chalk.green("🌕 ✔✔✔")} Done!`);
}

function getValueFromArgs(paramName: string, defaultValue: any = null, extraArgs: string[]): any {
  const index = extraArgs.indexOf(paramName);
  let value = defaultValue;
  if (index !== -1) {
    value = extraArgs[index + 1];
    extraArgs.splice(index, 2);
  }
  return value;
}

export async function commitWithMessageAndPush(commitMessage: string, extraArgs: string[]) {
  const isCommitConfirmedByUser = true;

  if (isCommitConfirmedByUser && !isCancel(isCommitConfirmedByUser)) {
    const messageToCommit = getValueFromArgs("--inserting_message", commitMessage, extraArgs);
    const shouldPush = getValueFromArgs("--should_push", false, extraArgs);

    const afterCommit = getValueFromArgs("--after_commit", null, extraArgs);

    const { stdout } = await execa("git", [
      "commit",
      "-m",
      messageToCommit,
      ...extraArgs
    ]);

    outro(`${chalk.green("✔")} successfully committed`);
    outro(stdout);

    if (shouldPush && await hasUpstream()) {
      const { stdout } = await execa("git", ["push", ...extraArgs]);
      if (stdout) outro(stdout);
      outro(`${chalk.green("✔")} successfully pushed`);
    }

    // afterCommit is a string containing shell commands to run after the commit
    if (afterCommit) {
      const { stdout } = await execa(afterCommit, [...extraArgs]);
      if (stdout) outro(stdout);
      outro(`${chalk.green("✔")} successfully ran after_commit`);
    }

    done();
    process.exit(0);
  }
}
