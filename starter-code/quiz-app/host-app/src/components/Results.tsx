// ============================================================
// Results - Affichage des resultats d'une question
// ============================================================

interface ResultsProps {
  correctIndex: number
  distribution: number[]
  choices: string[]
  onNext: () => void
  /** Desactive le bouton (ex: WebSocket deconnecte) */
  nextDisabled?: boolean
}

function Results({ correctIndex, distribution, choices, onNext }: ResultsProps) {
  const maxCount = Math.max(...distribution, 1)

  return (
    <div className="phase-container">
      <div className="results-container">
        <h1>Resultats</h1>

        {choices.map((choice, index) => {
          const count = distribution[index]
          const width = `${(count / maxCount) * 100}%`
          const isCorrect = index === correctIndex

          return (
            <div key={index} className="result-bar-container">
              <div className="result-bar-label">
                {choice}
                {isCorrect && (
                  <span className="correct-label"> (Bonne reponse)</span>
                )}
              </div>
              <div className="result-bar-wrapper">
                <div
                  className={`result-bar ${isCorrect ? 'correct' : 'incorrect'}`}
                  style={{ width }}
                >
                  {count}
                </div>
              </div>
            </div>
          )
        })}

        <button className="btn-primary" onClick={onNext}>
          Question suivante
        </button>
      </div>
    </div>
  )
}

export default Results
