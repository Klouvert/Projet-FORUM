import { useState } from 'react';
import { useTree } from '../hooks/useTree';
import TreeCanvas from '../components/tree/TreeCanvas';
import Sidebar from '../components/sidebar/Sidebar';
import CreateIdeaModal from '../components/modals/CreateIdeaModal';
import type { Domain } from '../types';

const Home = () => {
  const { tree, loading, error, voteIdea, addArgument, addAmendment, createIdea, promoteIdea, createBranch } = useTree();
  const [createBranchId, setCreateBranchId] = useState<string | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);

  const handleRequestCreate = (branchId?: string) => {
    setCreateBranchId(branchId);
    setShowCreate(true);
  };

  const handleCreateIdea = async (title: string, content: string, domain: Domain, branchId?: string) => {
    await createIdea(title, content, domain, branchId);
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-pulse" />
      <p>Chargement de l'arbre...</p>
    </div>
  );

  if (error) return (
    <div className="error">
      <p>{error}</p>
    </div>
  );

  return (
    <div className="home">
      <Sidebar
        branches={tree?.branches ?? []}
        ideas={tree?.ideas ?? []}
        onCreateBranch={createBranch}
      />

      <main className="tree-container" style={{ position: 'relative' }}>
        <TreeCanvas
          tree={tree}
          onVoteIdea={voteIdea}
          onAddArgument={addArgument}
          onAddAmendment={addAmendment}
          onPromote={promoteIdea}
          onRequestCreate={handleRequestCreate}
        />
      </main>

      {showCreate && (
        <CreateIdeaModal
          branches={tree?.branches ?? []}
          defaultBranchId={createBranchId}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateIdea}
        />
      )}
    </div>
  );
};

export default Home;
