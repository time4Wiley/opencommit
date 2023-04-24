import simpleGit from 'simple-git';

export const getGitRemotes = async () => {
  const git = simpleGit();
  const remotes = await git.getRemotes(true);
  return remotes.map((remote) => remote.name);
};
