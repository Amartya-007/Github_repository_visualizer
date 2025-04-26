import React, { useState, useCallback } from 'react';
import { FileNode } from '../services/githubApi';
import { 
  ChevronRight, 
  ChevronDown, 
  Folder, 
  FolderOpen, 
  FileText, 
  FileCode, 
  FileJson,
  FileImage,
  FileArchive,
  Copy,
  Check,
  Search,
  FolderOpen as ExpandIcon,
  FolderClosed as CollapseIcon,
  ExternalLink
} from 'lucide-react';

interface TreeViewProps {
  tree: FileNode[];
  repoUrl: string;
  branch: string;
}

interface TreeNodeProps {
  node: FileNode;
  depth: number;
  searchTerm: string;
  expandAll: boolean;
  repoUrl: string;
  branch: string;
}

const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined) return '';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch(extension) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
    case 'css':
    case 'html':
    case 'vue':
    case 'php':
    case 'py':
    case 'rb':
    case 'go':
    case 'java':
    case 'cpp':
    case 'c':
      return <FileCode className="w-4 h-4 text-purple-300" />;
    case 'json':
    case 'yml':
    case 'yaml':
    case 'xml':
    case 'toml':
      return <FileJson className="w-4 h-4 text-yellow-300" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="w-4 h-4 text-blue-300" />;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return <FileArchive className="w-4 h-4 text-gray-300" />;
    default:
      return <FileText className="w-4 h-4 text-gray-300" />;
  }
};

const generateTextTree = (tree: FileNode[], prefix = ''): string => {
  let result = '';
  
  const sortedTree = [...tree].sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'dir' ? -1 : 1;
  });
  
  sortedTree.forEach((node, index) => {
    const isLast = index === sortedTree.length - 1;
    const linePrefix = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';
    const size = node.size ? ` (${formatFileSize(node.size)})` : '';
    
    result += prefix + linePrefix + node.name + size + '\n';
    
    if (node.type === 'dir' && node.children) {
      result += generateTextTree(node.children, prefix + childPrefix);
    }
  });
  
  return result;
};

const TreeNode: React.FC<TreeNodeProps> = ({ node, depth, searchTerm, expandAll, repoUrl, branch }) => {
  const [expanded, setExpanded] = useState(depth < 1);
  const [showLink, setShowLink] = useState(false);
  const hasChildren = node.type === 'dir' && node.children && node.children.length > 0;
  
  // Generate GitHub URL for the file/folder
  const githubUrl = `${repoUrl}/tree/${branch}/${node.path}`;
  
  // Update expanded state when expandAll changes
  React.useEffect(() => {
    if (hasChildren) {
      setExpanded(expandAll);
    }
  }, [expandAll, hasChildren]);
  
  const toggleExpand = (e: React.MouseEvent) => {
    if (hasChildren) {
      setExpanded(!expanded);
    }
  };
  
  // Check if this node or any of its children match the search term
  const matchesSearch = useCallback((node: FileNode): boolean => {
    if (!searchTerm) return true;
    
    const termLower = searchTerm.toLowerCase();
    if (node.name.toLowerCase().includes(termLower)) return true;
    
    if (node.children) {
      return node.children.some(child => matchesSearch(child));
    }
    
    return false;
  }, [searchTerm]);
  
  // If there's a search term and this node doesn't match, don't render it
  if (searchTerm && !matchesSearch(node)) return null;
  
  const sortedChildren = node.children?.slice().sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'dir' ? -1 : 1;
  });
  
  return (
    <div>
      <div 
        className={`group flex items-center py-1.5 px-1 rounded-md hover:bg-gray-700 transition-colors duration-150`}
        onClick={toggleExpand}
        onMouseEnter={() => setShowLink(true)}
        onMouseLeave={() => setShowLink(false)}
        style={{ paddingLeft: `${depth * 16}px` }}
      >
        <span className="mr-1.5 w-4 flex-shrink-0">
          {hasChildren ? (
            expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : <span className="w-4" />}
        </span>
        
        <span className="mr-2 flex-shrink-0">
          {node.type === 'dir' ? (
            expanded ? 
              <FolderOpen className="w-4 h-4 text-yellow-400" /> : 
              <Folder className="w-4 h-4 text-yellow-400" />
          ) : (
            getFileIcon(node.name)
          )}
        </span>
        
        <span className={`truncate ${node.type === 'dir' ? 'font-medium' : ''}`}>
          {node.name}
        </span>
        
        {node.size && (
          <span className="ml-2 text-xs text-gray-400">
            {formatFileSize(node.size)}
          </span>
        )}
        
        {showLink && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            title="View on GitHub"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 hover:text-white" />
          </a>
        )}
      </div>
      
      {hasChildren && expanded && (
        <div className="animate-expandVertical">
          {sortedChildren?.map((child, index) => (
            <TreeNode 
              key={`${child.path}-${index}`} 
              node={child} 
              depth={depth + 1} 
              searchTerm={searchTerm}
              expandAll={expandAll}
              repoUrl={repoUrl}
              branch={branch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const TreeView: React.FC<TreeViewProps> = ({ tree, repoUrl, branch }) => {
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandAll, setExpandAll] = useState(false);
  
  const sortedTree = tree.slice().sort((a, b) => {
    if (a.type === b.type) {
      return a.name.localeCompare(b.name);
    }
    return a.type === 'dir' ? -1 : 1;
  });
  
  const handleCopy = async () => {
    const treeText = generateTextTree(sortedTree);
    await navigator.clipboard.writeText(treeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 right-0 flex items-center gap-4 p-2 bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-t-lg">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-9 pr-4 py-1.5 bg-gray-700 text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        
        <button
          onClick={() => setExpandAll(!expandAll)}
          className="p-1.5 rounded-md hover:bg-gray-700 transition-colors duration-200"
          title={expandAll ? "Collapse all" : "Expand all"}
        >
          {expandAll ? (
            <CollapseIcon className="w-4 h-4 text-gray-300" />
          ) : (
            <ExpandIcon className="w-4 h-4 text-gray-300" />
          )}
        </button>
        
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center gap-2 text-sm"
          title="Copy file structure"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      
      <div className="text-sm text-gray-200 pt-16">
        {sortedTree.map((node, index) => (
          <TreeNode 
            key={`${node.path}-${index}`} 
            node={node} 
            depth={0} 
            searchTerm={searchTerm}
            expandAll={expandAll}
            repoUrl={repoUrl}
            branch={branch}
          />
        ))}
      </div>
    </div>
  );
};

export default TreeView;