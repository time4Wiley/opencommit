import { exec, execSync } from "child_process";

export async function hasUpstream(): Promise<boolean> {
  return new Promise<boolean>((resolve, reject) => {
    exec('git rev-parse --abbrev-ref --symbolic-full-name @{u}', (err, stdout, stderr) => {
      if (err) {
        reject(err);
      } else if (stderr) {
        reject(new Error(stderr.trim()));
      } else {
        const upstreamBranch: string = stdout.trim();
        const currentBranch: string = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
        resolve(currentBranch === upstreamBranch);
      }
    });
  });
}
