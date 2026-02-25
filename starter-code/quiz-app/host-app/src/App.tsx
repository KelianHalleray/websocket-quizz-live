// ============================================================
// Host App - Composant principal
// Gestion des messages, routage par phase, et logique status/phase
// ============================================================

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import type { QuizPhase, QuizQuestion, ServerMessage } from '@shared/index'
import CreateQuiz from './components/CreateQuiz'
import Lobby from './components/Lobby'
import QuestionView from './components/QuestionView'
import Results from './components/Results'
import Leaderboard from './components/Leaderboard'

const WS_URL = 'ws://localhost:3001'

/** Indique si une action WebSocket peut etre effectuee (connexion etablie) */
function canPerformAction(status: string): boolean {
  return status === 'connected'
}

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | 'create'>('create')
  const [quizCode, setQuizCode] = useState('')
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<QuizQuestion, 'correctIndex'> | null>(null)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [questionTotal, setQuestionTotal] = useState(0)
  const [remaining, setRemaining] = useState(0)
  const [answerCount, setAnswerCount] = useState(0)
  const [correctIndex, setCorrectIndex] = useState(-1)
  const [distribution, setDistribution] = useState<number[]>([])
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>([])

  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return

    switch (lastMessage.type) {
      case 'sync': {
        // Reconnexion / synchronisation : reconstituer tout l'etat depuis les donnees serveur
        const { phase: syncPhase, data } = lastMessage
        setPhase(syncPhase)

        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>

          if (typeof d.quizCode === 'string') setQuizCode(d.quizCode)

          if (Array.isArray(d.players)) {
            setPlayers(d.players as string[])
          } else if (syncPhase === 'lobby') {
            setPlayers([])
          }

          // Phase question : question courante, timer, index
          if (syncPhase === 'question' && d.question && typeof d.question === 'object') {
            const q = d.question as Omit<QuizQuestion, 'correctIndex'>
            setCurrentQuestion(q)
            if (typeof d.index === 'number') setQuestionIndex(d.index)
            if (typeof d.total === 'number') setQuestionTotal(d.total)
            if (typeof d.remaining === 'number') setRemaining(d.remaining)
            setAnswerCount(0)
            setCorrectIndex(-1)
            setDistribution([])
          }

          // Phase results : distribution, bonne reponse
          if (syncPhase === 'results') {
            if (Array.isArray(d.distribution)) setDistribution(d.distribution as number[])
            if (typeof d.correctIndex === 'number') setCorrectIndex(d.correctIndex)
            const totalAnswers = Array.isArray(d.distribution)
              ? (d.distribution as number[]).reduce((sum, n) => sum + n, 0)
              : 0
            setAnswerCount(totalAnswers)
            if (d.question && typeof d.question === 'object') {
              setCurrentQuestion(d.question as Omit<QuizQuestion, 'correctIndex'>)
            }
          }

          // Phase leaderboard : classement
          if (syncPhase === 'leaderboard' && Array.isArray(d.rankings)) {
            setRankings(
              (d.rankings as { name?: string; score?: number }[]).map((r) => ({
                name: r.name ?? '',
                score: r.score ?? 0
              }))
            )
          }
        }
        break
      }

      case 'joined': {
        setPlayers(lastMessage.players)
        break
      }

      case 'question': {
        setCurrentQuestion(lastMessage.question)
        setQuestionIndex(lastMessage.index)
        setQuestionTotal(lastMessage.total)
        setRemaining(lastMessage.question.timerSec)
        setAnswerCount(0)
        setCorrectIndex(-1)
        setDistribution([])
        setPhase('question')
        break
      }

      case 'tick': {
        setRemaining(lastMessage.remaining)
        break
      }

      case 'results': {
        setCorrectIndex(lastMessage.correctIndex)
        setDistribution(lastMessage.distribution)
        const totalAnswers = lastMessage.distribution.reduce((sum, n) => sum + n, 0)
        setAnswerCount(totalAnswers)
        setPhase('results')
        break
      }

      case 'leaderboard': {
        setRankings(lastMessage.rankings)
        setPhase('leaderboard')
        break
      }

      case 'ended': {
        setPhase('ended')
        break
      }

      case 'error': {
        console.error(lastMessage.message)
        alert(lastMessage.message)
        break
      }
    }
  }, [lastMessage])

  // --- Handlers ---

  /** Appele quand le host soumet le formulaire de creation */
  const handleCreateQuiz = (title: string, questions: QuizQuestion[]) => {
    sendMessage({ type: 'host:create', title, questions })
  }

  /** Appele quand le host clique sur "Demarrer" dans le lobby */
  const handleStart = () => {
    sendMessage({ type: 'host:start' })
  }

  /** Appele quand le host clique sur "Question suivante" */
  const handleNext = () => {
    sendMessage({ type: 'host:next' })
  }

  /** Appele quand le host clique sur "Terminer le quiz" (phase leaderboard) */
  const handleEnd = () => {
    sendMessage({ type: 'host:end' })
  }

  /** Reinitialise l'etat et revient au formulaire de creation */
  const handleBackToCreate = () => {
    setPhase('create')
    setQuizCode('')
    setPlayers([])
    setCurrentQuestion(null)
    setQuestionIndex(0)
    setQuestionTotal(0)
    setRemaining(0)
    setAnswerCount(0)
    setCorrectIndex(-1)
    setDistribution([])
    setRankings([])
  }

  const canAct = canPerformAction(status)

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'create':
        return <CreateQuiz onSubmit={handleCreateQuiz} disabled={!canAct} />

      case 'lobby':
        return (
          <Lobby
            quizCode={quizCode}
            players={players}
            onStart={handleStart}
            startDisabled={!canAct || players.length === 0}
          />
        )

      case 'question':
        return currentQuestion ? (
          <QuestionView
            question={currentQuestion}
            index={questionIndex}
            total={questionTotal}
            remaining={remaining}
            answerCount={answerCount}
            totalPlayers={players.length}
          />
        ) : null

      case 'results':
        return currentQuestion ? (
          <Results
            correctIndex={correctIndex}
            distribution={distribution}
            choices={currentQuestion.choices}
            onNext={handleNext}
            nextDisabled={!canAct}
          />
        ) : null

      case 'leaderboard':
        return (
          <Leaderboard
            rankings={rankings}
            onEnd={handleEnd}
            endDisabled={!canAct}
          />
        )

      case 'ended':
        return (
          <div className="phase-container">
            <h1>Quiz termine !</h1>
            <button className="btn-primary" onClick={handleBackToCreate}>
              Creer un nouveau quiz
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h2>Quiz Host</h2>
        <span className={`status-badge status-${status}`}>
          {status === 'connected' ? 'Connecte' : status === 'connecting' ? 'Connexion...' : 'Deconnecte'}
        </span>
      </header>
      <main className="app-main">
        {renderPhase()}
      </main>
    </div>
  )
}

export default App
