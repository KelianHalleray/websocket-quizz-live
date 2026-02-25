// ============================================================
// Results - Affichage des resultats d'une question
// A IMPLEMENTER : barres animees et bonne reponse
// ============================================================

interface ResultsProps {
  /** Index de la bonne reponse (0-3) */
  correctIndex: number
  /** Distribution des reponses [nb_choix_0, nb_choix_1, nb_choix_2, nb_choix_3] */
  distribution: number[]
  /** Texte des choix de reponse */
  choices: string[]
  /** Callback quand le host clique sur "Question suivante" */
  onNext: () => void
  /** Desactive le bouton (ex: WebSocket deconnecte) */
  nextDisabled?: boolean
}

/**
 * Composant affichant les resultats d'une question avec des barres animees.
 *
 * Ce qu'il faut implementer :
 * - Un titre "Resultats"
 * - Pour chaque choix, une barre horizontale proportionnelle au nombre de reponses
 *   (classes .result-bar-container, .result-bar-label, .result-bar-wrapper, .result-bar)
 *   La barre correcte a la classe .correct, les autres .incorrect
 *   Afficher un label "(Bonne reponse)" a cote du bon choix (classe .correct-label)
 * - La largeur de la barre est proportionnelle :
 *   width = `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`
 * - Un bouton "Question suivante" (classe .btn-primary)
 *
 * Astuce : const maxCount = Math.max(...distribution, 1)
 */
function Results({ correctIndex, distribution, choices, onNext, nextDisabled = false }: ResultsProps) {
  const maxCount = Math.max(...distribution, 1)
  return (
    <div className="phase-container">
      <div className="results-container">
        <h1>Resultats</h1>
        {choices.map((choice, i) => (
          <div key={i} className="result-bar-container">
            <span className="result-bar-label">
              {choice}
              {i === correctIndex && <span className="correct-label"> (Bonne reponse)</span>}
            </span>
            <div className="result-bar-wrapper">
              <div
                className={`result-bar ${i === correctIndex ? 'correct' : 'incorrect'}`}
                style={{ width: `${(distribution[i] ?? 0) / maxCount * 100}%` }}
              >
                {distribution[i] ?? 0}
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          className="btn-primary"
          onClick={onNext}
          disabled={nextDisabled}
        >
          Question suivante
        </button>
      </div>
    </div>
  )
}

export default Results
