import { useState } from 'react';
import { useTree } from '../hooks/useTree';
import TreeCanvas from '../components/tree/TreeCanvas';
import Sidebar from '../components/sidebar/Sidebar';
import CreateIdeaModal from '../components/modals/CreateIdeaModal';
import type { Domain, IdeaNode } from '../types';

const Home = () => {
  const {
    tree, loading, error,
    voteIdea, addArgument, addAmendment, createIdea, promoteIdea,
    updateIdea, deleteIdea,
    createBranch, updateBranch, deleteBranch,
    createTrunkValue, updateTrunkValue, deleteTrunkValue,
    updateArgument, deleteArgument,
    updateAmendment, deleteAmendment,
  } = useTree();

  const [createBranchId, setCreateBranchId] = useState<string | undefined>(undefined);
  const [showCreate, setShowCreate] = useState(false);
  const [searchIdeaId, setSearchIdeaId] = useState<string | null>(null);

  const handleRequestCreate = (branchId?: string) => {
    setCreateBranchId(branchId);
    setShowCreate(true);
  };

  const handleCreateIdea = async (title: string, content: string, domain: Domain, branchId?: string) => {
    await createIdea(title, content, domain, branchId);
  };

  const handleSelectFromSearch = (idea: IdeaNode) => {
    setSearchIdeaId(idea.id);
  };

  if (loading) return (
    <div className="loading">
      <div className="loading-pulse" />
      <p>Chargement de l'arbre...</p>
    </div>
  );

  if (error) return (
    <div className="error"><p>{error}</p></div>
  );

  return (
    <div className="home">
      <Sidebar
        branches={tree?.branches ?? []}
        ideas={tree?.ideas ?? []}
        trunkValues={tree?.trunkValues ?? []}
        onSelectIdea={handleSelectFromSearch}
        onCreateBranch={createBranch}
        onUpdateBranch={updateBranch}
        onDeleteBranch={deleteBranch}
        onCreateTrunkValue={createTrunkValue}
        onUpdateTrunkValue={updateTrunkValue}
        onDeleteTrunkValue={deleteTrunkValue}
      />

      <main className="tree-container" style={{ position: 'relative' }}>
        <TreeCanvas
          tree={tree}
          onVoteIdea={voteIdea}
          onAddArgument={addArgument}
          onAddAmendment={addAmendment}
          onPromote={promoteIdea}
          onRequestCreate={handleRequestCreate}
          onDeleteIdea={deleteIdea}
          onUpdateIdea={updateIdea}
          onUpdateArgument={updateArgument}
          onDeleteArgument={deleteArgument}
          onUpdateAmendment={updateAmendment}
          onDeleteAmendment={deleteAmendment}
          requestOpenIdeaId={searchIdeaId}
          onIdeaOpened={() => setSearchIdeaId(null)}
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
