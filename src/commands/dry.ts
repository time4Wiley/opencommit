import { command } from 'cleye';
import { commit } from './commit-action';

const DRY_NAME = 'dry';

const dryCommandHandler = async (argv: any) => {
  if (argv.flags.help) {
    console.log(`
Usage: opencommit dry [options]

Options:
  --help  Show help                                                [boolean]

Examples:
  opencommit dry --message "commit message" --files file1.txt file2.txt
`);
    return;
  }

  const args = argv._.slice(1);
  await commit([...args, '--dry', ...argv.flags._]);
};

export const dryCommand = command(
  {
    name: DRY_NAME,
    parameters: ['[message]', '[files...]'],

  },
  dryCommandHandler
);
