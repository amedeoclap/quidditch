using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace SkySpheres.Core
{
    /// <summary>
    /// Destiny Hood - Il cappello magico parlante che assegna i ruoli ai giocatori
    /// Include dialoghi ironici e personalità distintiva
    /// </summary>
    public class DestinyHood : MonoBehaviour
    {
        [Header("Role Assignment")]
        [SerializeField] private bool randomizeRole = true;
        [SerializeField] private PlayerRole forcedRole = PlayerRole.None;

        [Header("Dialogue Settings")]
        [SerializeField] private float dialogueSpeed = 0.05f;
        [SerializeField] private float pauseBetweenLines = 1.5f;

        [Header("Events")]
        public UnityEvent<PlayerRole> OnRoleAssigned;
        public UnityEvent<string> OnDialogueLine;
        public UnityEvent OnSelectionComplete;

        private PlayerRole selectedRole;

        // Dialoghi ironici per ogni ruolo
        private Dictionary<PlayerRole, List<string>> roleDialogues = new Dictionary<PlayerRole, List<string>>()
        {
            { PlayerRole.Seeker, new List<string>
                {
                    "Ah! Vedo velocità nei tuoi riflessi... o forse è solo nervosismo?",
                    "Il Radiant Globe ti chiama! Oppure è solo il tuo stomaco che brontola?",
                    "Cercatore! Perfetto per chi ama inseguire sogni... e sfere luminose.",
                    "Hmm... sì, sì! Hai l'agilità di un falco... o di un pollo spaventato. Cercatore!"
                }
            },
            { PlayerRole.Beater, new List<string>
                {
                    "Forza e determinazione! O forse solo voglia di colpire cose?",
                    "Battitore! Perfetto per chi risolve i problemi... a colpi di mazza!",
                    "Vedo in te l'arte della protezione violenta. Battitore è il tuo destino!",
                    "Ah! Ami i fuochi d'artificio? Bene, perché le Strike Spheres esplodono! Battitore!"
                }
            },
            { PlayerRole.Chaser, new List<string>
                {
                    "Precisione e lavoro di squadra! Sei tu o è il tuo curriculum falso?",
                    "Cacciatore! Per chi ama segnare... punti, intendo. Solo punti.",
                    "Vedo strategia tattica... o forse hai solo guardato troppe partite. Cacciatore!",
                    "Il canestro è la tua casa! Non letteralmente, spero. Cacciatore!"
                }
            },
            { PlayerRole.Keeper, new List<string>
                {
                    "Portiere! Per chi preferisce stare fermo... ma con stile!",
                    "Difesa inespugnabile! Come quella volta che hai evitato le responsabilità. Portiere!",
                    "Ah! L'arte del 'Non passerai!' è forte in te. Portiere!",
                    "Riflessi di ferro... o almeno di alluminio. Portiere sarà!"
                }
            }
        };

        private List<string> introDialogues = new List<string>
        {
            "Bene, bene, bene... un altro aspirante giocatore!",
            "Fammi pensare... *rumori di stoffa che si muove*",
            "Ah! Le mie cuciture magiche stanno tremando!",
            "Hmm... interessante. Molto interessante... o forse no.",
            "Silenzio! Sto leggendo il tuo destino... o forse il menu del pranzo."
        };

        private List<string> closingDialogues = new List<string>
        {
            "Il tuo destino è segnato! O almeno fino alla prossima partita.",
            "Ora vai e rendi orgoglioso il tuo cappello magico!",
            "Non deludermi... ho una reputazione da mantenere!",
            "Ricorda: la grandezza ti aspetta! O la sconfitta. Probabilmente la sconfitta."
        };

        private void Start()
        {
            if (!randomizeRole && forcedRole != PlayerRole.None)
            {
                selectedRole = forcedRole;
            }
        }

        /// <summary>
        /// Avvia la cerimonia di assegnazione del ruolo
        /// </summary>
        public void StartRoleSelection()
        {
            StartCoroutine(RoleSelectionCeremony());
        }

        /// <summary>
        /// Cerimonia completa con dialoghi
        /// </summary>
        private IEnumerator RoleSelectionCeremony()
        {
            // Dialogo introduttivo
            string intro = introDialogues[Random.Range(0, introDialogues.Count)];
            yield return StartCoroutine(DisplayDialogue(intro));
            yield return new WaitForSeconds(pauseBetweenLines);

            // Determina il ruolo
            if (randomizeRole || forcedRole == PlayerRole.None)
            {
                selectedRole = GetRandomRole();
            }
            else
            {
                selectedRole = forcedRole;
            }

            // Dialogo specifico per il ruolo
            List<string> roleSpecificDialogues = roleDialogues[selectedRole];
            string roleDialogue = roleSpecificDialogues[Random.Range(0, roleSpecificDialogues.Count)];
            yield return StartCoroutine(DisplayDialogue(roleDialogue));
            yield return new WaitForSeconds(pauseBetweenLines);

            // Annuncio del ruolo
            string announcement = $"Sarai... {GetRoleName(selectedRole).ToUpper()}!";
            yield return StartCoroutine(DisplayDialogue(announcement));
            yield return new WaitForSeconds(pauseBetweenLines);

            // Dialogo di chiusura
            string closing = closingDialogues[Random.Range(0, closingDialogues.Count)];
            yield return StartCoroutine(DisplayDialogue(closing));
            yield return new WaitForSeconds(0.5f);

            // Trigger eventi
            OnRoleAssigned?.Invoke(selectedRole);
            OnSelectionComplete?.Invoke();
        }

        /// <summary>
        /// Visualizza il dialogo carattere per carattere
        /// </summary>
        private IEnumerator DisplayDialogue(string dialogue)
        {
            OnDialogueLine?.Invoke(dialogue);
            yield return new WaitForSeconds(dialogue.Length * dialogueSpeed);
        }

        /// <summary>
        /// Seleziona un ruolo casuale
        /// </summary>
        private PlayerRole GetRandomRole()
        {
            PlayerRole[] roles = { PlayerRole.Seeker, PlayerRole.Beater, PlayerRole.Chaser, PlayerRole.Keeper };
            return roles[Random.Range(0, roles.Length)];
        }

        /// <summary>
        /// Ottiene il nome tradotto del ruolo
        /// </summary>
        private string GetRoleName(PlayerRole role)
        {
            return role switch
            {
                PlayerRole.Seeker => "Cercatore",
                PlayerRole.Beater => "Battitore",
                PlayerRole.Chaser => "Cacciatore",
                PlayerRole.Keeper => "Portiere",
                _ => "Sconosciuto"
            };
        }

        /// <summary>
        /// Ottiene il ruolo selezionato
        /// </summary>
        public PlayerRole GetSelectedRole()
        {
            return selectedRole;
        }

        /// <summary>
        /// Forza un ruolo specifico (per testing o story mode)
        /// </summary>
        public void ForceRole(PlayerRole role)
        {
            forcedRole = role;
            randomizeRole = false;
            selectedRole = role;
        }

        /// <summary>
        /// Attiva la randomizzazione
        /// </summary>
        public void EnableRandomization(bool enable)
        {
            randomizeRole = enable;
        }

        /// <summary>
        /// Mini-quiz di allenamento con il Destiny Hood
        /// </summary>
        public IEnumerator TrainingQuiz(System.Action<bool> onComplete)
        {
            List<string> questions = new List<string>
            {
                "Velocità o precisione? Rispondi velocemente!",
                "Difesa o attacco? Scegli saggiamente!",
                "Squadra o gloria personale? Il cappello vuole saperlo!"
            };

            string question = questions[Random.Range(0, questions.Count)];
            yield return StartCoroutine(DisplayDialogue(question));

            // Qui si integrerebbe la logica di risposta
            // Per ora simuliamo
            yield return new WaitForSeconds(2f);

            bool success = Random.value > 0.5f;
            string result = success ?
                "Risposta eccellente! +10 Saggezza!" :
                "Mmmh... potevi fare di meglio. +5 Esperienza comunque.";

            yield return StartCoroutine(DisplayDialogue(result));
            onComplete?.Invoke(success);
        }
    }
}
