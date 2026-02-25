// ============================================================
// QuizRoom - Logique d'une salle de quiz
// A IMPLEMENTER : remplir le corps de chaque methode
// ============================================================

import WebSocket from 'ws'
import type { QuizQuestion, QuizPhase, ServerMessage } from '../../packages/shared-types'
import { send, broadcast } from './utils'

/** Represente un joueur connecte */
interface Player {
  id: string
  name: string
  ws: WebSocket
}

export class QuizRoom {
  /** Identifiant unique de la salle */
  readonly id: string

  /** Code a 6 caracteres que les joueurs utilisent pour rejoindre */
  readonly code: string

  /** Phase actuelle du quiz */
  phase: QuizPhase = 'lobby'

  /** WebSocket du host (presentateur) */
  hostWs: WebSocket | null = null

  /** Map des joueurs : playerId -> Player */
  players: Map<string, Player> = new Map()

  /** Liste des questions du quiz */
  questions: QuizQuestion[] = []

  /** Titre du quiz */
  title: string = ''

  /** Index de la question en cours (0-based) */
  currentQuestionIndex: number = -1

  /** Map des reponses pour la question en cours : playerId -> choiceIndex */
  answers: Map<string, number> = new Map()

  /** Map des scores cumules : playerId -> score total */
  scores: Map<string, number> = new Map()

  /** Timer ID pour le compte a rebours (pour pouvoir l'annuler) */
  timerId: ReturnType<typeof setInterval> | null = null

  /** Temps restant pour la question en cours */
  remaining: number = 0

  constructor(id: string, code: string) {
    this.id = id
    this.code = code
  }

  /**
   * Ajoute un joueur a la salle.
   * - Creer un objet Player avec un ID unique
   * - L'ajouter a this.players
   * - Initialiser son score a 0 dans this.scores
   * - Envoyer un message 'joined' a TOUS les clients (host + players)
   *   avec la liste des noms de joueurs
   * @returns l'ID du joueur cree
   */
  addPlayer(name: string, ws: WebSocket): string {
    // TODO: Generer un ID unique (ex: crypto.randomUUID() ou Math.random())
    const playerID = crypto.randomUUID()
    const player = {
      id: playerID,
      name,
      ws
    }
    // TODO: Creer le Player et l'ajouter a this.players
    this.players.set(playerID, player)
    // TODO: Initialiser le score a 0
    this.scores.set(playerID, 0)
    // TODO: Envoyer 'joined' a tous les clients
    this.broadcastToAll({
      type: 'joined',
      playerId: playerID,
      players: Array.from(this.players.values()).map((player) => player.name)
    })
    // TODO: Retourner l'ID du joueur
    return playerID
  }

  /**
   * Demarre le quiz.
   * - Verifier qu'on est en phase 'lobby'
   * - Verifier qu'il y a au moins 1 joueur
   * - Passer a la premiere question en appelant nextQuestion()
   */
  start(): void {
    // TODO: Verifier la phase et le nombre de joueurs
    if (this.phase !== 'lobby' || this.players.size < 1) return
    // TODO: Appeler nextQuestion()
    this.nextQuestion()
  }

  /**
   * Passe a la question suivante.
   * - Annuler le timer precedent s'il existe
   * - Incrementer currentQuestionIndex
   * - Si on a depasse la derniere question, appeler broadcastLeaderboard() et return
   * - Vider la map answers
   * - Passer en phase 'question'
   * - Appeler broadcastQuestion()
   * - Demarrer le timer (setInterval toutes les secondes)
   *   qui decremente remaining et envoie un 'tick' a tous
   *   Quand remaining atteint 0, appeler timeUp()
   */
  nextQuestion(): void {
    // TODO: Annuler le timer existant (clearInterval)
    if (this.timerId) clearInterval(this.timerId)
    // TODO: Incrementer l'index
    this.currentQuestionIndex++
    // TODO: Verifier si le quiz est termine
    if (this.currentQuestionIndex >= this.questions.length) {
      this.broadcastLeaderboard()
      return
    }
    // TODO: Reinitialiser answers
    this.answers.clear()
    // TODO: Changer la phase
    this.phase = 'question'
    // TODO: Envoyer la question
    this.broadcastQuestion()
    // TODO: Demarrer le compte a rebours
    this.remaining = this.questions[this.currentQuestionIndex].timerSec
    this.timerId = setInterval(() => this.tick(), 1000)
  }

  /**
   * Traite la reponse d'un joueur.
   * - Verifier qu'on est en phase 'question'
   * - Verifier que le joueur n'a pas deja repondu
   * - Enregistrer la reponse dans this.answers
   * - Si la reponse est correcte, calculer et ajouter les points :
   *   score = 1000 + Math.round(500 * (this.remaining / question.timerSec))
   * - Si tous les joueurs ont repondu, appeler timeUp() immediatement
   */
  handleAnswer(playerId: string, choiceIndex: number): void {
    // TODO: Verifier la phase
    if (this.phase !== 'question') return
    // TODO: Verifier que le joueur n'a pas deja repondu
    if (this.answers.has(playerId)) return
    // TODO: Enregistrer la reponse
    this.answers.set(playerId, choiceIndex)
    // TODO: Calculer le score si correct
    const isCorrectAnswer = choiceIndex === this.questions[this.currentQuestionIndex].correctIndex
    if (isCorrectAnswer) {
      const score = 1000 + Math.round(500 * (this.remaining / this.questions[this.currentQuestionIndex].timerSec))
      this.scores.set(playerId, (this.scores.get(playerId) || 0) + score)
    }
    // TODO: Si tout le monde a repondu, terminer la question
    if (this.answers.size === this.players.size) {
      this.timeUp()
    }
  }

  /**
   * Appelee toutes les secondes par le timer.
   * - Decrementer this.remaining
   * - Envoyer un 'tick' a tous les clients avec le temps restant
   * - Si remaining <= 0, appeler timeUp()
   */
  private tick(): void {
    // TODO: Decrementer remaining
    this.remaining--
    // TODO: Envoyer 'tick' a tous
    this.broadcastToAll({
      type: 'tick',
      remaining: this.remaining
    })
    // TODO: Si temps ecoule, appeler timeUp()
    if (this.remaining <= 0) {
      this.timeUp()
    }
  }

  /**
   * Appelee quand le temps est ecoule (ou que tout le monde a repondu).
   * - Annuler le timer
   * - Passer en phase 'results'
   * - Appeler broadcastResults()
   */
  private timeUp(): void {
    // TODO: Annuler le timer
    if (this.timerId) clearInterval(this.timerId)
    // TODO: Changer la phase
    this.phase = 'results'
    // TODO: Envoyer les resultats
    this.broadcastResults()
  }

  /**
   * Retourne la liste de tous les WebSocket des joueurs.
   * Utile pour broadcast.
   */
  private getPlayerWsList(): WebSocket[] {
    // TODO: Extraire les ws de this.players.values()
    return Array.from(this.players.values()).map((player) => player.ws)
  }

  /**
   * Envoie un message a tous les clients : host + tous les joueurs.
   */
  private broadcastToAll(message: ServerMessage): void {
    // TODO: Envoyer au host si connecte
    if (this.hostWs) this.hostWs.send(JSON.stringify(message))
    // TODO: Envoyer a tous les joueurs via broadcast()
    broadcast(this.getPlayerWsList(), message)
  }

  /**
   * Envoie la question en cours a tous les clients.
   * IMPORTANT : ne pas envoyer correctIndex aux clients !
   * Le message 'question' contient : question (sans correctIndex), index, total
   */
  private broadcastQuestion(): void {
    // TODO: Recuperer la question courante
    const question = this.questions[this.currentQuestionIndex]
    // TODO: Creer l'objet question SANS correctIndex (utiliser destructuring)
    const { correctIndex, ...questionWithoutCorrectIndex } = question
    // TODO: Envoyer a tous via broadcastToAll()
    this.broadcastToAll({
      type: 'question',
      question: questionWithoutCorrectIndex,
      index: this.currentQuestionIndex,
      total: this.questions.length
    })
  }

  /**
   * Envoie les resultats de la question en cours.
   * - correctIndex : l'index de la bonne reponse
   * - distribution : tableau du nombre de reponses par choix [0, 5, 2, 1]
   * - scores : objet { nomJoueur: scoreTotal } pour tous les joueurs
   */
  private broadcastResults(): void {
    // TODO: Recuperer la question courante
    const question = this.questions[this.currentQuestionIndex]
    // TODO: Calculer la distribution des reponses
    const distribution = question.choices.map((_, i) => 
      [...this.answers.values()].filter((ci) => ci === i).length)
    // TODO: Construire l'objet scores { nom: score }
    const scores = Array.from(this.players.values()).reduce((acc, player) => {
      acc[player.name] = this.scores.get(player.id) || 0
      return acc
    }, {} as Record<string, number>)
    // TODO: Envoyer 'results' a tous
    this.broadcastToAll({
      type: 'results',
      correctIndex: question.correctIndex,
      distribution,
      scores
    })
  }

  /**
   * Envoie le classement final.
   * - Trier les joueurs par score decroissant
   * - Envoyer un message 'leaderboard' avec rankings: { name, score }[]
   * - Passer en phase 'leaderboard'
   */
  broadcastLeaderboard(): void {
    // TODO: Construire le tableau rankings trie par score decroissant
    const rankings = Array.from(this.players.values()).sort((a, b) => (this.scores.get(b.id) || 0) - (this.scores.get(a.id) || 0))
    // TODO: Changer la phase
    this.phase = 'leaderboard'
    // TODO: Envoyer 'leaderboard' a tous
    this.broadcastToAll({
      type: 'leaderboard',
      rankings: rankings.map((player) => ({ 
        id: player.id,
        name: player.name,
        score: this.scores.get(player.id) || 0
      }))
    })
  }

  /**
   * Termine le quiz.
   * - Annuler le timer
   * - Passer en phase 'ended'
   * - Envoyer 'ended' a tous les clients
   */
  end(): void {
    // TODO: Annuler le timer
    if (this.timerId) clearInterval(this.timerId)
    // TODO: Changer la phase
    this.phase = 'ended'
    // TODO: Envoyer 'ended' a tous
    this.broadcastToAll({
      type: 'ended'
    })
  }
}
