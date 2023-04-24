import fs from 'fs';
import path from "path";

export function removeOrigFromChangedFiles(changedFiles: string[]) {
  const remainingFiles: string[] = [];
  changedFiles.forEach(file => {
    const ext = path.extname(file);
    const baseName = path.basename(file);
    if (ext === '.orig' || baseName.match(/\.chatGPT\.temp\./)) {
      fs.unlinkSync(file);
    } else {
      remainingFiles.push(file);
    }
  });
  return remainingFiles;
}
