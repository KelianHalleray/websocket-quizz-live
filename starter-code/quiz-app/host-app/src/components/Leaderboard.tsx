// ============================================================
// Leaderboard - Classement des joueurs
// A IMPLEMENTER : liste triee avec scores
// ============================================================

interface LeaderboardProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[]
}
const  classementsMock: LeaderboardProps = {

/**
 * Composant affichant le classement des joueurs.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Classement" (classe .leaderboard-title)
 * - Une liste ordonnee des joueurs (classe .leaderboard)
 * - Chaque joueur affiche (classe .leaderboard-item) :
 *   - Son rang (1, 2, 3...) dans .leaderboard-rank
 *   - Son nom dans .leaderboard-name
 *   - Son score dans .leaderboard-score
 * - Les 3 premiers ont des styles speciaux via :nth-child (deja dans le CSS)
 *
 * Note : les rankings sont deja tries par score decroissant
 */
function Leaderboard({ rankings }: LeaderboardProps) {
  return (
    <div className="phase-container">
      <h1 className="leaderboard-title">Classement</h1>
      {/* TODO: Titre "Classement" avec .leaderboard-title */}
      <div className="leaderboard">

        {rankings.map((player, index) => (
          <div key={player} 'leaderboard-item'>
            <p>Rank : {index + 1}</p>
            <p>Name : {player.name}</p>
            <p>Score : {player.score}</p>
          </div>
          
        {/* TODO: Pour chaque joueur dans rankings, afficher un .leaderboard-item */}
        {/* TODO: Afficher rang, nom et score */}
      </div>
    </div>
  )
}

export default Leaderboard
