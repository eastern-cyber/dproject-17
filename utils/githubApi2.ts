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
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Cache-Control': 'no-cache'
        }
      }
    );

    console.log('GitHub response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error details:', errorText);
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    const fileData = await response.json();
    
    // ตรวจสอบว่าไฟล์มี content หรือไม่
    if (!fileData.content) {
      throw new Error('File content is empty');
    }
    
    const content = atob(fileData.content.replace(/\n/g, ''));
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

// เพิ่ม logging เพื่อ debug - แก้ไขให้เป็น standalone function
export const testGitHubConnection = async (githubToken: string) => {
  console.log('Token exists:', !!githubToken);
  console.log('Token length:', githubToken?.length);
  
  try {
    const testUrl = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}`;
    const response = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    
    console.log('Repo access test:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

// Alternative fallback using raw URL
export const getGitHubFileDataFallback = async () => {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${FILE_PATH}`,
      {
        cache: 'no-cache'
      }
    );
    
    if (!response.ok) throw new Error('Failed to fetch raw file');
    
    const currentContent = await response.json();
    return {
      content: currentContent,
      sha: null,
      fileData: null
    };
  } catch (error) {
    console.error('Raw URL fallback failed:', error);
    throw error;
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
          'Authorization': `Bearer ${githubToken}`, // เปลี่ยนเป็น Bearer
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
    // Try fallback
    try {
      const fallbackData = await getGitHubFileDataFallback();
      if (Array.isArray(fallbackData.content) && fallbackData.content.length > 0) {
        const lastTokenId = Math.max(...fallbackData.content.map((user: any) => {
          const tokenId = parseInt(user.tokenId);
          return isNaN(tokenId) ? 0 : tokenId;
        }));
        return (lastTokenId + 1).toString();
      }
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
    }
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