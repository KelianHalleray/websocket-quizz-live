// ============================================================
// JoinScreen - Formulaire pour rejoindre un quiz
// A IMPLEMENTER : champs code et nom, bouton rejoindre
// ============================================================

import { useState } from 'react'

interface JoinScreenProps {
  /** Callback appele quand le joueur soumet le formulaire */
  onJoin: (code: string, name: string) => void
  /** Message d'erreur optionnel (ex: "Code invalide") */
  error?: string
}

/**
 * Composant formulaire pour rejoindre un quiz existant.
 *
 * Ce qu'il faut implementer :
 * - Un champ pour le code du quiz (6 caracteres, majuscules)
 *   avec la classe .code-input pour le style monospace
 * - Un champ pour le pseudo du joueur
 * - Un bouton "Rejoindre" (classe .btn-primary)
 * - Afficher le message d'erreur s'il existe (classe .error-message)
 * - Valider que les deux champs ne sont pas vides avant d'appeler onJoin
 *
 * Classes CSS disponibles : .join-form, .form-group, .code-input,
 * .error-message, .btn-primary
 */
function JoinScreen({ onJoin, error }: JoinScreenProps) {
  // TODO: State pour le code du quiz
  const [code, setCode] = useState('');
  // TODO: State pour le pseudo
  const [pseudo,setPseudo] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Valider que les champs ne sont pas vides
    if(!code.trim() || !pseudo.trim()) return;
    // TODO: Appeler onJoin(code.toUpperCase(), name)
    onJoin(code.trim().toUpperCase(), pseudo.trim());
  }

  return (
    <form className="join-form" onSubmit={handleSubmit}>
      <h1>Rejoindre un Quiz</h1>
      {/* TODO: Afficher l'erreur si elle existe */}
      {error && <div className="error-message">{error}</div>}
      {/* TODO: Champ code du quiz avec classe .code-input */}
      <input value={code} type="text" onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))} className='code-input' placeholder='Entrez le code (6 car en maj)...' />
      {/* TODO: Champ pseudo */}
      <input value={pseudo} type="text" onChange={(e) => setPseudo(e.target.value)} placeholder='Entrez votre pseudo...' />
      {/* TODO: Bouton Rejoindre */}
      <button className='btn-primary' type='submit'>Rejoindre</button>
    </form>
  )
}

export default JoinScreen
