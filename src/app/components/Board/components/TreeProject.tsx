import React, { useEffect, useState, useMemo, memo } from 'react';
import { FiFolder, FiChevronRight, FiChevronDown, FiCheckSquare } from 'react-icons/fi';
import { useAppStore } from '@/app/store/appStore';
import apiClient from '@/app/utils/apiClient';

interface TreeNode {
  id: number;
  title: string;
  type: string;
  children?: TreeNode[];
}

// Add helper function to find path to node
const findPathToNode = (node: TreeNode, targetId: number): number[] => {
  if (node.id === targetId) return [node.id];
  
  if (node.children) {
    for (const child of node.children) {
      const path = findPathToNode(child, targetId);
      if (path.length > 0) {
        return [node.id, ...path];
      }
    }
  }
  return [];
};

const TreeItem = memo<{
  node: TreeNode; 
  level: number;
  currentId?: number | null;
  expandedNodes: Set<number>;
}>(({ node, level, currentId, expandedNodes }) => {
  const [isExpanded, setIsExpanded] = useState(expandedNodes.has(node.id));
  const { history, setHistory } = useAppStore();

  useEffect(() => {
    setIsExpanded(expandedNodes.has(node.id));
  }, [expandedNodes, node.id]);

  const handleClick = () => {
    if (node.children?.length) {
      setIsExpanded(!isExpanded);
    }
    setHistory([...history, {
      id: node.id,
      url: `/api/project/${node.id}/child/`,
      title: node.title
    }]);
  };

  return (
    <div className="select-none">
      <div 
        className={`flex items-center py-1 px-1.5 rounded cursor-pointer
                   hover:bg-[var(--accent)] transition-colors gap-1
                   ${currentId === node.id ? 'bg-[var(--accent)]' : ''}`}
        style={{ paddingLeft: `${level * 8}px` }}
        onClick={handleClick}>
        {node.children && node.children.length > 0 && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-[var(--muted)] rounded">
            {isExpanded ? 
              <FiChevronDown className="w-3 h-3" /> : 
              <FiChevronRight className="w-3 h-3" />
            }
          </button>
        )}
        {node.type.toLowerCase() === 'task' ? 
          <FiCheckSquare className="w-3 h-3" /> : 
          <FiFolder className="w-3 h-3" />
        }
        <span className="truncate text-xs">{node.title}</span>
      </div>
      {isExpanded && node.children && (
        <div className="ml-2">
          {node.children.map(child => (
            <TreeItem 
              key={child.id} 
              node={child} 
              level={level + 1}
              currentId={currentId}
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
});

TreeItem.displayName = 'TreeItem';

const TreeProject = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const { history } = useAppStore();
  const currentId = history[history.length - 1]?.id;

  useEffect(() => {
    if (treeData && currentId) {
      const path = findPathToNode(treeData, currentId);
      setExpandedNodes(new Set(path));
    }
  }, [treeData, currentId]);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const response = await apiClient.get('/api/project/tree_personal/');
        setTreeData(response.data);
      } catch {
      }
    };

    fetchTreeData();
  }, []);

  const renderTree = useMemo(() => {
    if (!treeData) return null;
    return (
      <TreeItem
        node={treeData}
        level={0} 
        currentId={currentId}
        expandedNodes={expandedNodes}
      />
    );
  }, [treeData, currentId, expandedNodes]);

  if (!treeData) {
    return (
      <div className="w-64 bg-[var(--card)] border-r border-[var(--border)] p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Cá Nhân</h2>
        <div className="text-sm text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto bg-[var(--background)]">
      <div className="p-4">
        <h2 className="text-lg font-medium mb-4 text-[var(--foreground)]">Cá Nhân</h2>
        <div className="space-y-1">
          {renderTree}
        </div>
      </div>
    </div>
  );
};

export default memo(TreeProject);
