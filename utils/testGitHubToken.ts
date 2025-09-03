// utils/testGitHubToken.ts
import { getGitHubFileData } from './githubApi';

export const testGitHubToken = async () => {
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  
  if (!token) {
    console.error('No GitHub token found');
    return false;
  }

  try {
    const data = await getGitHubFileData(token);
    console.log('GitHub token test successful!', data);
    return true;
  } catch (error) {
    console.error('GitHub token test failed:', error);
    return false;
  }
};