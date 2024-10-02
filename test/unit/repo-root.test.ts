import { getRepoRoot } from "../../src/utils/git";

jest.mock('execa');

describe('getRepoRoot', () => {
  it('should return the correct repository root given a subdirectory', async () => {
    const mockSubDir = '/Users/wei/ai-wiley/opencommit/out';
    const expectedRoot = '/Users/wei/ai-wiley/opencommit';
    
    // change working directory to the subdirectory
    process.chdir(mockSubDir);

    const result = await getRepoRoot();

    // expect(execa).toHaveBeenCalledWith('git', ['rev-parse', '--show-toplevel']);
    expect(result).toBe(expectedRoot);
  });
});
