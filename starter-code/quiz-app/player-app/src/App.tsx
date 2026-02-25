// ============================================================
// Player App - Composant principal
// A IMPLEMENTER : gestion des messages et routage par phase
// ============================================================

import { useState, useEffect } from 'react'
import { useWebSocket } from './hooks/useWebSocket'
import type { QuizPhase, QuizQuestion } from '@shared/index'
import JoinScreen from './components/JoinScreen'
import WaitingLobby from './components/WaitingLobby'
import AnswerScreen from './components/AnswerScreen'
import FeedbackScreen from './components/FeedbackScreen'
import ScoreScreen from './components/ScoreScreen'

const WS_URL = 'ws://localhost:3001'

function App() {
  const { status, sendMessage, lastMessage } = useWebSocket(WS_URL)

  // --- Etats de l'application ---
  const [phase, setPhase] = useState<QuizPhase | 'join' | 'feedback'>('join')
  const [playerName, setPlayerName] = useState('')
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [players, setPlayers] = useState<string[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<Omit<QuizQuestion, 'correctIndex'> | null>(null)
  const [remaining, setRemaining] = useState(0)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [lastCorrect, setLastCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [rankings, setRankings] = useState<{ name: string; score: number }[]>([])
  const [error, setError] = useState<string | undefined>(undefined)


  // --- Traitement des messages du serveur ---
  useEffect(() => {
    if (!lastMessage) return
    // TODO: Traiter chaque type de message du serveur
    // Utiliser un switch sur lastMessage.type

    switch (lastMessage.type) {
      case 'joined': {
        // TODO: Mettre a jour la liste des joueurs
        setPlayerId(lastMessage.playerId);
        setPlayers(lastMessage.players);
        // TODO: Passer en phase 'lobby'
        setPhase('lobby');

        // TODO: Effacer les erreurs
        setError(undefined);
        break
      }

      case 'question': {
        // TODO: Mettre a jour currentQuestion avec lastMessage.question
        setCurrentQuestion(lastMessage.question);
        // TODO: Mettre a jour remaining avec lastMessage.question.timerSec
        setRemaining(lastMessage.question.timerSec);
        // TODO: Reinitialiser hasAnswered a false
        setHasAnswered(false);
        setSelectedIndex(null);
        // TODO: Changer la phase en 'question'
        setPhase('question');
        break
      }

      case 'tick': {
        // TODO: Mettre a jour remaining avec lastMessage.remaining
        setRemaining(lastMessage.remaining);
        break
      }

      case 'results': {
        // TODO: Verifier si le joueur a repondu correctement
        //   (comparer la reponse du joueur avec lastMessage.correctIndex)
        if (hasAnswered && selectedIndex !== null && selectedIndex === lastMessage.correctIndex) {
          setLastCorrect(true);
        }
        else {
          setLastCorrect(false);
        }
        // TODO: Mettre a jour lastCorrect (true/false)
        // TODO: Recuperer le score du joueur depuis lastMessage.scores
        const playerScore = playerId ? (lastMessage.scores[playerId] ?? score) : score;
        setScore(playerScore);
        // TODO: Changer la phase en 'feedback'
        setPhase('feedback');
        break
      }

      case 'leaderboard': {
        // TODO: Mettre a jour rankings avec lastMessage.rankings
        setRankings(lastMessage.rankings);
        // TODO: Changer la phase en 'leaderboard'
        setPhase('leaderboard');
        break
      }

      case 'ended': {
        // TODO: Changer la phase en 'ended'
        setPhase('ended');
        break
      }

      case 'error': {
        // TODO: Stocker le message d'erreur dans le state error
        setError(lastMessage.message);
        break
      }
    }
  }, [lastMessage])

  // --- Handlers ---

  /** Appele quand le joueur soumet le formulaire de connexion */
  const handleJoin = (code: string, name: string) => {
    // TODO: Sauvegarder le nom du joueur dans playerName
    setPlayerName(name);
    // TODO: Envoyer un message 'join' au serveur avec sendMessage
    sendMessage({
      type: 'join',
      quizCode: code,
      name
    })
  }

  /** Appele quand le joueur clique sur un choix de reponse */
  const handleAnswer = (choiceIndex: number) => {
    // TODO: Verifier que le joueur n'a pas deja repondu (hasAnswered)
    if (hasAnswered || !currentQuestion) return;
    // TODO: Marquer hasAnswered a true
    setHasAnswered(true);
    setSelectedIndex(choiceIndex);
    // TODO: Envoyer un message 'answer' au serveur avec l'id de la question et le choiceIndex
    sendMessage({
      type: 'answer',
      questionId: currentQuestion.id,
      choiceIndex
    })
  }

  // --- Rendu par phase ---
  const renderPhase = () => {
    switch (phase) {
      case 'join':
        return <JoinScreen onJoin={handleJoin} error={error} />

      case 'lobby':
        return <WaitingLobby players={players} />

      case 'question':
        return currentQuestion ? (
          <AnswerScreen
            question={currentQuestion}
            remaining={remaining}
            onAnswer={handleAnswer}
            hasAnswered={hasAnswered}
          />
        ) : null

      case 'feedback':
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'results':
        // Pendant 'results' on reste sur FeedbackScreen
        return <FeedbackScreen correct={lastCorrect} score={score} />

      case 'leaderboard':
        return <ScoreScreen rankings={rankings} playerName={playerName} />

      case 'ended':
        return (
          <div className="phase-container">
            <h1>Quiz termine !</h1>
            <p className="ended-message">Merci d'avoir participe !</p>
            <button className="btn-primary" onClick={() => setPhase('join')}>
              Rejoindre un autre quiz
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
        <h2>Quiz Player</h2>
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
