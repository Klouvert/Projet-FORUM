import { useTree } from '../hooks/useTree';
import TreeCanvas from '../components/tree/TreeCanvas';
import Sidebar from '../components/sidebar/Sidebar';

const Home = () => {
  const { arbre, loading, error, voteNoeud, voteArgument, addArgument, addAmendement } = useTree();

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
      <Sidebar branches={arbre?.branches ?? []} />
      <main className="tree-container">
        <TreeCanvas
          arbre={arbre}
          onVoteNoeud={voteNoeud}
          onVoteArgument={voteArgument}
          onAddArgument={addArgument}
          onAddAmendement={addAmendement}
        />
      </main>
    </div>
  );
};

export default Home;