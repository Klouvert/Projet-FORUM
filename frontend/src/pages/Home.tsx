import { useState } from 'react';
import { useTree } from '../hooks/useTree';
import TreeCanvas from '../components/tree/TreeCanvas';
import Sidebar from '../components/sidebar/Sidebar';
import CreateIdeaModal from '../components/modals/CreateIdeaModal';
import type { Domain } from '../types';

const Home = () => {
  const { tree, loading, error, voteIdea, addArgument, addAmendment, createIdea, promoteIdea, createBranch } = useTree();
  const [showCreate, setShowCreate] = useState(false);

  const handleCreateIdea = async (title: string, content: string, domain: Domain, branchId?: string) => {
    await createIdea(title, content, domain, branchId);
  };

  if (loading) return (
    <div className="loading">
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
        />

        <button
          onClick={() => setShowCreate(true)}
          title="Proposer une idée"
          style={{
            position: 'absolute',
            bottom: '28px',
            right: '28px',
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            background: '#9C27B0',
            border: 'none',
            color: '#fff',
            fontSize: '26px',
            cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(156,39,176,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          +
        </button>
      </main>

      {showCreate && (
        <CreateIdeaModal
          branches={tree?.branches ?? []}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreateIdea}
        />
      )}
    </div>
  );
};

export default Home;