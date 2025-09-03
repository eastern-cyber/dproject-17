// utils/githubApi.ts
const GITHUB_API_URL = 'https://api.github.com';
const REPO_OWNER = 'eastern-cyber';
const REPO_NAME = 'dproject-admin-1.0.2';
const FILE_PATH = 'public/dProjectUsers.json';

// Interface for the user data structure
export interface GitHubUser {
  userId: string;
  referrerId: string;
  email: string;
  name: string;
  tokenId: string;
  userCreated: string;
  planA: {
    dateTime: string;
    POL: string;
    rateTHBPOL: string;
  };
}

// Get the current file content and SHA
export const getGitHubFileData = async (githubToken: string) => {
  try {
    const response = await fetch(
      `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    const content = atob(fileData.content.replace(/\n/g, '')); // Remove newlines from base64
    const currentContent = JSON.parse(content);
    
    return {
      content: currentContent,
      sha: fileData.sha,
      fileData
    };
  } catch (error) {
    console.error('Error fetching GitHub file:', error);
    throw new Error('Failed to fetch current file from GitHub');
  }
};

// Update GitHub JSON file with new user
export const updateGitHubUsersJson = async (newUser: GitHubUser, githubToken: string) => {
  try {
    // First, get the current file content and SHA
    const { content: currentContent, sha } = await getGitHubFileData(githubToken);
    
    // Add new user to the array
    const updatedContent = Array.isArray(currentContent) 
      ? [...currentContent, newUser]
      : [newUser];

    // Update the file on GitHub
    const updateResponse = await fetch(
      `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: `Add new user: ${newUser.name || newUser.userId}`,
          content: btoa(JSON.stringify(updatedContent, null, 2)),
          sha: sha
        })
      }
    );

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      throw new Error(`GitHub update failed: ${updateResponse.status} - ${JSON.stringify(errorData)}`);
    }
    
    const result = await updateResponse.json();
    console.log('GitHub update successful:', result);
    return result;

  } catch (error) {
    console.error('GitHub API error:', error);
    throw error;
  }
};

// Get the next available tokenId from GitHub
export const getNextTokenIdFromGitHub = async (githubToken: string): Promise<string> => {
  try {
    const { content: currentContent } = await getGitHubFileData(githubToken);
    
    if (Array.isArray(currentContent) && currentContent.length > 0) {
      const lastTokenId = Math.max(...currentContent.map((user: any) => {
        const tokenId = parseInt(user.tokenId);
        return isNaN(tokenId) ? 0 : tokenId;
      }));
      return (lastTokenId + 1).toString();
    }
    return "1"; // Start from 1 if no users exist
    
  } catch (error) {
    console.error('Error getting next token ID from GitHub:', error);
    return "1"; // Fallback
  }
};

// Get user by wallet address
export const getUserByAddress = async (address: string, githubToken: string): Promise<GitHubUser | null> => {
  try {
    const { content: currentContent } = await getGitHubFileData(githubToken);
    
    if (Array.isArray(currentContent)) {
      return currentContent.find((user: GitHubUser) => 
        user.userId.toLowerCase() === address.toLowerCase()
      ) || null;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user from GitHub:', error);
    return null;
  }
};

// Get all users (for verification)
export const getAllGitHubUsers = async (githubToken: string): Promise<GitHubUser[]> => {
  try {
    const { content: currentContent } = await getGitHubFileData(githubToken);
    return Array.isArray(currentContent) ? currentContent : [];
  } catch (error) {
    console.error('Error fetching all users from GitHub:', error);
    return [];
  }
};