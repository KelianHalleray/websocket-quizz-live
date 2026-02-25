// ============================================================
// Leaderboard - Classement des joueurs
// A IMPLEMENTER : liste triee avec scores
// ============================================================

interface LeaderboardProps {
  /** Classement trie par score decroissant */
  rankings: { name: string; score: number }[]
  /** Callback quand le host clique sur "Terminer le quiz" */
  onEnd?: () => void
  /** Desactive le bouton (ex: WebSocket deconnecte) */
  endDisabled?: boolean
}

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
          <li key={`${player.name}-${index}`} className="leaderboard-item">
            <span className="leaderboard-rank">{index + 1}</span>
            <span className="leaderboard-name">{player.name}</span>
            <span className="leaderboard-score">{player.score}</span>
          </li>
        ))}
        
        {/* TODO: Pour chaque joueur dans rankings, afficher un .leaderboard-item */}
        {/* TODO: Afficher rang, nom et score */}
      </div>
      {onEnd && (
        <button
          type="button"
          className="btn-primary"
          onClick={onEnd}
          disabled={endDisabled}
        >
          Terminer le quiz
        </button>
      )}
    </div>
  )
}

export default Leaderboard
