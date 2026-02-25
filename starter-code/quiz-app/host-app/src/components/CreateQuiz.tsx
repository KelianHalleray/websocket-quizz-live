// ============================================================
// CreateQuiz - Formulaire de creation d'un quiz
// A IMPLEMENTER : construire le formulaire dynamique
// ============================================================

import { useState } from 'react'
import type { QuizQuestion } from '@shared/index'

interface CreateQuizProps {
  /** Callback appele quand le formulaire est soumis */
  onSubmit: (title: string, questions: QuizQuestion[]) => void
  /** Desactive le formulaire (ex: WebSocket deconnecte) */
  disabled?: boolean
}

/**
 * Composant formulaire pour creer un nouveau quiz.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le titre du quiz
 * - Une liste dynamique de questions (pouvoir en ajouter/supprimer)
 * - Pour chaque question :
 *   - Un champ texte pour la question
 *   - 4 champs texte pour les choix de reponse
 *   - Un selecteur (radio) pour la bonne reponse (correctIndex)
 *   - Un champ pour la duree du timer en secondes
 * - Un bouton pour ajouter une question
 * - Un bouton pour soumettre le formulaire
 *
 * Astuce : utilisez un state pour stocker un tableau de questions
 * et generez un id unique pour chaque question (ex: crypto.randomUUID())
 *
 * Classes CSS disponibles : .create-form, .form-group, .question-card,
 * .question-card-header, .choices-inputs, .choice-input-group,
 * .btn-add-question, .btn-remove, .btn-primary
 */
const DEFAULT_QUESTION: QuizQuestion = {
  id: crypto.randomUUID(),
  text: '',
  choices: ['', '', '', ''],
  correctIndex: 0,
  timerSec: 10
}

function CreateQuiz({ onSubmit, disabled = false }: CreateQuizProps) {
  const [title, setTitle] = useState('')
  const [questions, setQuestions] = useState<QuizQuestion[]>([
    { ...DEFAULT_QUESTION, id: crypto.randomUUID() }
  ])

  const addQuestion = () => {
    setQuestions((q) => [...q, { ...DEFAULT_QUESTION, id: crypto.randomUUID() }])
  }

  const removeQuestion = (index: number) => {
    setQuestions((q) => q.filter((_, i) => i !== index))
  }

  const updateQuestion = (index: number, updates: Partial<QuizQuestion>) => {
    setQuestions((q) =>
      q.map((question, i) => (i === index ? { ...question, ...updates } : question))
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      alert('Le titre est requis')
      return
    }
    if (questions.length === 0) {
      alert('Ajoutez au moins une question')
      return
    }
    const validQuestions = questions.filter(
      (q) =>
        q.text.trim() &&
        q.choices.every((c) => c.trim()) &&
        q.correctIndex >= 0 &&
        q.correctIndex < 4 &&
        q.timerSec > 0
    )
    if (validQuestions.length === 0) {
      alert('Chaque question doit avoir un texte, 4 choix non vides et un timer > 0')
      return
    }
    onSubmit(title, validQuestions)
  }

  return (
    <div className="phase-container">
      <h1>Creer un Quiz</h1>
      <form className="create-form" onSubmit={handleSubmit}>
        <fieldset disabled={disabled}>
          <div className="form-group">
            <label>Titre du quiz</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mon super quiz"
            />
          </div>
          {questions.map((question, index) => (
            <div key={question.id} className="question-card">
              <div className="question-card-header">
                <span>Question {index + 1}</span>
                <button
                  type="button"
                  className="btn-remove"
                  onClick={() => removeQuestion(index)}
                  disabled={questions.length <= 1}
                >
                  Supprimer
                </button>
              </div>
              <div className="form-group">
                <label>Question</label>
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => updateQuestion(index, { text: e.target.value })}
                  placeholder="Texte de la question"
                />
              </div>
              <div className="choices-inputs">
                {question.choices.map((choice, ci) => (
                  <div key={ci} className="choice-input-group">
                    <input
                      type="text"
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...question.choices]
                        newChoices[ci] = e.target.value
                        updateQuestion(index, { choices: newChoices })
                      }}
                      placeholder={`Choix ${ci + 1}`}
                    />
                    <label>
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={question.correctIndex === ci}
                        onChange={() => updateQuestion(index, { correctIndex: ci })}
                      />
                      Bonne reponse
                    </label>
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Timer (secondes)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={question.timerSec}
                  onChange={(e) =>
                    updateQuestion(index, { timerSec: parseInt(e.target.value, 10) || 10 })
                  }
                />
              </div>
            </div>
          ))}
          <button type="button" className="btn-add-question" onClick={addQuestion}>
            Ajouter une question
          </button>
          <button type="submit" className="btn-primary" disabled={disabled}>
            Creer le quiz
          </button>
        </fieldset>
      </form>
    </div>
  )
}

export default CreateQuiz
