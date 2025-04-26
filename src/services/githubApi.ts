// GitHub API data types
export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'dir';
  children?: FileNode[];
  size?: number;
}

export interface RepoData {
  name: string;
  owner: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  fileTree: FileNode[];
  branches: string[];
}

// Helper to extract owner and repo name from GitHub URL
export const parseGithubUrl = (url: string): { owner: string; repo: string } => {
  try {
    // Remove trailing slash if it exists
    const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    
    // Extract the path part from the URL
    const parsedUrl = new URL(cleanUrl);
    const pathParts = parsedUrl.pathname.split('/').filter(Boolean);
    
    if (pathParts.length < 2 || parsedUrl.hostname !== 'github.com') {
      throw new Error('Invalid GitHub repository URL');
    }
    
    return {
      owner: pathParts[0],
      repo: pathParts[1]
    };
  } catch (error) {
    throw new Error('Invalid GitHub repository URL');
  }
};

// Recursively build tree structure from flat file list
export const buildFileTree = (files: any[], excludedFolders: string[] = []): FileNode[] => {
  const root: FileNode[] = [];
  const map = new Map<string, FileNode>();
  
  // First pass: create all nodes and add them to the map
  files.forEach(file => {
    // Skip excluded folders and their contents
    if (excludedFolders.some(folder => file.path.startsWith(folder + '/') || file.path === folder)) {
      return;
    }

    const node: FileNode = {
      name: file.name,
      path: file.path,
      type: file.type,
      size: file.size,
      children: file.type === 'dir' ? [] : undefined
    };
    
    map.set(file.path, node);
  });
  
  // Second pass: establish parent-child relationships
  files.forEach(file => {
    // Skip excluded folders and their contents
    if (excludedFolders.some(folder => file.path.startsWith(folder + '/') || file.path === folder)) {
      return;
    }

    const node = map.get(file.path);
    if (!node) return;
    
    const lastSlashIndex = file.path.lastIndexOf('/');
    
    if (lastSlashIndex === -1) {
      // This is a root level node
      root.push(node);
    } else {
      // This is a child node
      const parentPath = file.path.substring(0, lastSlashIndex);
      const parent = map.get(parentPath);
      
      if (parent && parent.children) {
        parent.children.push(node);
      }
    }
  });
  
  return root;
};

// Fetch repository branches
const fetchBranches = async (owner: string, repo: string): Promise<string[]> => {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches`);
  if (!response.ok) {
    throw new Error('Failed to fetch repository branches');
  }
  const branches = await response.json();
  return branches.map((branch: any) => branch.name);
};

// Main function to fetch repository data
export const fetchRepositoryData = async (
  url: string, 
  branch: string = 'main',
  excludedFolders: string[] = []
): Promise<RepoData> => {
  try {
    const { owner, repo } = parseGithubUrl(url);
    
    // Fetch repository info
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!repoResponse.ok) {
      const errorData = await repoResponse.json();
      throw new Error(errorData.message || 'Failed to fetch repository information');
    }
    
    const repoInfo = await repoResponse.json();
    
    // Fetch branches
    const branches = await fetchBranches(owner, repo);
    
    // Fetch repository contents for the specified branch
    const contentsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`);
    
    let contentsData;
    if (!contentsResponse.ok) {
      if (branch === 'main') {
        // Try master if main doesn't exist
        const masterResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`);
        if (!masterResponse.ok) {
          const errorData = await masterResponse.json();
          throw new Error(errorData.message || 'Failed to fetch repository contents');
        }
        contentsData = await masterResponse.json();
      } else {
        const errorData = await contentsResponse.json();
        throw new Error(errorData.message || 'Failed to fetch repository contents');
      }
    } else {
      contentsData = await contentsResponse.json();
    }
    
    // Process the tree data
    const files = contentsData.tree.map((item: any) => ({
      name: item.path.split('/').pop(),
      path: item.path,
      type: item.type === 'blob' ? 'file' : 'dir',
      size: item.size
    }));
    
    // Add missing directories (GitHub API doesn't include empty directories)
    const allPaths = new Set<string>();
    files.forEach((file: any) => {
      const pathParts = file.path.split('/');
      let currentPath = '';
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
        allPaths.add(currentPath);
      }
    });
    
    // Add missing directories to the files array
    allPaths.forEach(path => {
      if (!files.some((file: any) => file.path === path)) {
        files.push({
          name: path.split('/').pop(),
          path,
          type: 'dir'
        });
      }
    });
    
    // Build the file tree
    const fileTree = buildFileTree(files, excludedFolders);
    
    return {
      name: repoInfo.name,
      owner: repoInfo.owner.login,
      description: repoInfo.description || '',
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      language: repoInfo.language || '',
      branches,
      fileTree
    };
  } catch (error) {
    throw error;
  }
};