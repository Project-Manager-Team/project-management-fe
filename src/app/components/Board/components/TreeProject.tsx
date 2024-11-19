import React, { useEffect, useState, useMemo, memo } from "react";
import {
  FiFolder,
  FiChevronRight,
  FiChevronDown,
  FiCheckSquare,
  FiSmile,
} from "react-icons/fi";
import { useAppStore } from "@/app/store/appStore";
import apiClient from "@/app/utils/apiClient";

interface TreeNode {
  id: number;
  title: string;
  type: string;
  children?: TreeNode[];
  managers?: { username: string }[];  // Thêm thông tin managers cho mỗi node
}

// Add helper function to find path to node
function findPathToNode(node: TreeNode, targetId: number): number[] {
  if (node.id === targetId) {
    return [node.id];
  }

  if (node.children) {
    for (const child of node.children) {
      const path = findPathToNode(child, targetId);
      if (path.length > 0) {
        return [node.id, ...path];
      }
    }
  }
  return [];
}

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
    
    // Kiểm tra xem project đã tồn tại trong history chưa
    const lastItem = history[history.length - 1];
    if (lastItem?.id !== node.id) {
      setHistory([
        ...history,
        {
          id: node.id,
          url: `/api/project/${node.id}/child/`,
          title: node.title,
        },
      ]);
    }
  };

  return (
    <div className="select-none text-sm sm:text-base">
      <div
        className={`flex items-center py-1 px-1.5 rounded cursor-pointer
                   hover:bg-[var(--accent)] transition-colors gap-1
                   ${currentId === node.id ? "bg-[var(--accent)]" : ""}`}
        style={{ paddingLeft: `${level * 6}px` }}
        onClick={handleClick}
      >
        {node.children && node.children.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-[var(--muted)] rounded"
          >
            {isExpanded ? (
              <FiChevronDown className="w-3 h-3" />
            ) : (
              <FiChevronRight className="w-3 h-3" />
            )}
          </button>
        )}
        {node.type?.toLowerCase() === "task" ? (
          <FiCheckSquare className="w-3 h-3" />
        ) : (
          <FiFolder className="w-3 h-3" />
        )}
        <span className="truncate text-xs sm:text-sm">{node.title}</span>
      </div>
      {isExpanded && node.children && (
        <div className="ml-2">
          {node.children.map((child) => (
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

TreeItem.displayName = "TreeItem";

interface PetProps {
  animal: string;
  color: string;
  actions: string[];
}

const Pet = memo(({ animal, color, actions }: PetProps) => {
  const [position, setPosition] = useState(0);
  const [direction, setDirection] = useState(1);
  const [action, setAction] = useState(actions[0]);

  useEffect(() => {
    const moveInterval = setInterval(() => {
      setPosition((prev) => {
        const speed = action === "walk" ? 1 : action === "walk_fast" ? 2 : action === "run" ? 3 : 0;
        const newPosition = prev + speed * direction;
        if (newPosition > 90) {
          setDirection(-1);
          return 90;
        }
        if (newPosition < 0) {
          setDirection(1);
          return 0;
        }
        return newPosition;
      });
    }, 150);

    const actionInterval = setInterval(() => {
      setAction(actions[Math.floor(Math.random() * actions.length)]);
    }, 5000);

    return () => {
      clearInterval(moveInterval);
      clearInterval(actionInterval);
    };
  }, [direction, action, actions]);

  return (
    <div 
      className="absolute bottom-4 transition-all duration-150 select-none"
      style={{ 
        left: `${position}%`,
        transform: `scaleX(${direction > 0 ? 1 : -1})`,
      }}
    >
      <img 
        src={`/assets/${animal}/${color}_${action}_8fps.gif`} 
        alt={`${animal}`} 
        className="w-12 h-12" // Reduced size
      />
    </div>
  );
});

Pet.displayName = "Pet";

const petsConfig = [
  { animal: "dog", color: "akita", actions: ["idle", "lie", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "dog", color: "red", actions: ["idle", "lie", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "dog", color: "brown", actions: ["idle", "lie", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "dog", color: "black", actions: ["idle", "lie", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "dog", color: "white", actions: ["idle", "lie", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "crab", color: "red", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "chicken", color: "white", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "clippy", color: "black", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "clippy", color: "brown", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "clippy", color: "green", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "clippy", color: "yellow", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "cockatiel", color: "gray", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "deno", color: "green", actions: ["idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "fox", color: "red", actions: ["lie", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "fox", color: "white", actions: ["lie", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "brown", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "black", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "magical", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "paint_beige", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "paint_black", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "paint_brown", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "socks_beige", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "socks_black", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "socks_brown", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "warrior", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
  { animal: "horse", color: "white", actions: ["stand", "idle", "run", "swipe", "walk", "walk_fast", "with_ball"] },
];

const TreeProject = () => {
  const [treeData, setTreeData] = useState<TreeNode | null>(null);
  const [managedTreeData, setManagedTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const { history } = useAppStore();
  const currentId = history[history.length - 1]?.id;
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [isPetPanelVisible, setIsPetPanelVisible] = useState(false);

  useEffect(() => {
    if (currentId) {
      let path: number[] = [];
      if (treeData) {
        path = findPathToNode(treeData, currentId);
      }
      if (path.length === 0 && managedTreeData.length > 0) {
        for (const tree of managedTreeData) {
          path = findPathToNode(tree, currentId);
          if (path.length > 0) break;
        }
      }
      if (path.length > 0) {
        setExpandedNodes(new Set(path));
      }
    }
  }, [treeData, managedTreeData, currentId]);

  useEffect(() => {
    const fetchTreeData = async () => {
      try {
        const response = await apiClient.get("/api/project/tree_personal/");
        setTreeData(response.data);
      } catch {}
    };

    const fetchManagedTreeData = async () => {
      try {
        const response = await apiClient.get("/api/project/managed_tree/");
        setManagedTreeData(response.data);
      } catch {}
    };

    fetchTreeData();
    fetchManagedTreeData();
  }, []);

  useEffect(() => {
    const savedPets = localStorage.getItem("selectedPets");
    if (savedPets) {
      setSelectedPets(JSON.parse(savedPets));
    }
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

  const renderManagedTrees = useMemo(() => {
    if (!managedTreeData.length) return null;
    return managedTreeData.map((tree) => (
      <TreeItem
        key={tree.id}
        node={tree}
        level={0}
        currentId={currentId}
        expandedNodes={expandedNodes}
      />
    ));
  }, [managedTreeData, currentId, expandedNodes]);

  const handlePetSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    setSelectedPets(prevSelectedPets => {
      const updatedPets = checked ? [...prevSelectedPets, value] : prevSelectedPets.filter(pet => pet !== value);
      localStorage.setItem("selectedPets", JSON.stringify(updatedPets));
      return updatedPets;
    });
  };

  const togglePetPanel = () => {
    setIsPetPanelVisible(!isPetPanelVisible);
  };

  if (!treeData && !managedTreeData.length) {
    return (
      <div className="w-64 bg-[var(--card)] border-r border-[var(--border)] p-4 rounded-lg" style={{ height: 'calc(100% - 20px)' }}>
        <h2 className="text-lg font-medium mb-4">Cá Nhân</h2>
        <div className="text-sm text-[var(--muted-foreground)]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(90%-20px)] overflow-y-auto bg-[var(--background)] relative">
      <div className="relative p-2 sm:p-4">
        {treeData && (
          <>
            <h2 className="text-base sm:text-lg font-medium mb-2 sm:mb-4 text-[var(--foreground)]">
              Cá Nhân
            </h2>
            <div className="space-y-0.5 sm:space-y-1">{renderTree}</div>
          </>
        )}
        
        {managedTreeData.length > 0 && (
          <>
            <h2 className="text-base sm:text-lg font-medium mt-4 mb-2 sm:mb-4 text-[var(--foreground)]">
              Quản Lý
            </h2>
            <div className="space-y-0.5 sm:space-y-1">{renderManagedTrees}</div>
          </>
        )}
      </div>
      <button 
        onClick={togglePetPanel} 
        className="absolute top-4 right-4 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded p-2"
      >
        <FiSmile className="w-5 h-5" />
      </button>
      {isPetPanelVisible && (
        <div className="absolute top-16 right-4 bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] rounded p-2">
          {petsConfig.map((pet, index) => (
            <label key={index} className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                value={index.toString()} 
                onChange={handlePetSelection} 
                checked={selectedPets.includes(index.toString())}
              />
              <span>{`${pet.animal} (${pet.color})`}</span>
            </label>
          ))}
        </div>
      )}
      {selectedPets.length > 0 && selectedPets.map(index => {
        const pet = petsConfig[parseInt(index)];
        return <Pet key={index} animal={pet.animal} color={pet.color} actions={pet.actions} />;
      })}
    </div>
  );
};

export default memo(TreeProject);
