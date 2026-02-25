// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void
}
function CreateQuiz({ onSubmit }: CreateQuizProps) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Valider que le titre n'est pas vide
    if (!title.trim()) return alert('Le titre est obligatoire.')
    if (questions.length === 0) return alert('Ajoutez au moins une question.')

    for (const q of questions) {
      if (!q.text.trim()) return alert('Une question est vide.')
    }

    onSubmit(title, questions)
  }

  function addQuestion() {
    setQuestions([{
      id: crypto.randomUUID(),
      text: '',
      choices: ['', '', '', ''],
      correctIndex: 0,
      timerSec: 10
    }, ...questions])
  }

  function deleteQuestion(index: number) {
    setQuestions(questions.filter((_, i) => i !== index))
  }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="quiz-title">Titre du quiz</label> 
          <input
            id="quiz-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <div className="question-card-header">
              <h3>Question {index + 1}</h3>
              <button
                type="button"
                className="btn-remove"
                onClick={() => deleteQuestion(index)}
              >
                Supprimer
              </button>
            </div>
            <div className="form-group">
              <label> Ajouter votre question ?</label>
              <input
                type="text"
                value={q.text}
                onChange={(e) => {
                  const newQuestions = [...questions]
                  newQuestions[index].text = e.target.value
                  setQuestions(newQuestions)
                }}
              />
            </div>
            <div className="choices-inputs">
              {q.choices.map((choice, cIndex) => (
                <div key={cIndex} className="choice-input-group">
                  <input
                    type="text"
                    value={choice}
                    onChange={(e) => {
                      const newQuestions = [...questions]
                      newQuestions[index].choices[cIndex] = e.target.value
                      setQuestions(newQuestions)
                    }}
                  />
                  <input
                    type="radio"
                    name={`correct-${q.id}`}
                    checked={q.correctIndex === cIndex}
                    onChange={() => {
                      const newQuestions = [...questions]
                      newQuestions[index].correctIndex = cIndex
                      setQuestions(newQuestions)
                    }}
                  />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Durée du timer (secondes)</label>
              <input
                type="number"
                min={5}
                value={q.timerSec}
                onChange={(e) => {
                  const newQuestions = [...questions]
                  newQuestions[index].timerSec = parseInt(e.target.value) || 10
                  setQuestions(newQuestions)
                }}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          className="btn-add-question"
          onClick={AddQuestion}
        >
          Ajouter une question
        </button>
        <button type="submit" className="btn-primary">
          Soumettre le quiz
        </button>
      </form>
    </div>
  )
}

export default CreateQuiz
