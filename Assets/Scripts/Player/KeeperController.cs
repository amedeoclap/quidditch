using UnityEngine;
using UnityEngine.Events;
using SkySpheres.Core;
using System.Collections.Generic;

namespace SkySpheres.Player
{
    /// <summary>
    /// Keeper Controller - Difende gli anelli dagli Score Orbs nemici
    /// Focus su posizionamento e riflessi
    /// </summary>
    public class KeeperController : PlayerController
    {
        [Header("Keeper Specific")]
        [SerializeField] private float saveRange = 6f;
        [SerializeField] private float diveSpeed = 15f;
        [SerializeField] private float diveDistance = 8f;
        [SerializeField] private LayerMask orbLayer;
        [SerializeField] private LayerMask goalRingLayer;

        [Header("Positioning")]
        [SerializeField] private Vector3 homePosition;
        [SerializeField] private float maxDistanceFromGoal = 15f;
        [SerializeField] private List<Transform> defendedGoals = new List<Transform>();

        [Header("Save System")]
        [SerializeField] private float perfectSaveWindow = 0.2f;
        [SerializeField] private GameObject saveEffectPrefab;

        // Events
        public UnityEvent<Transform> OnOrbDetected;
        public UnityEvent<bool> OnSave; // true = perfect save
        public UnityEvent OnDive;
        public UnityEvent OnGoalConceded;

        private bool isDiving;
        private Vector3 diveTarget;
        private float diveStartTime;
        private int savesMade;
        private int goalsConceded;
        private Transform incomingOrb;
        private List<Transform> trackedOrbs = new List<Transform>();

        protected override void InitializeRole()
        {
            // Keeper ha bonus di riflessi
            turnSpeed += 30f;

            Debug.Log("Keeper inizializzato - Focus: Difesa e Posizionamento");
            FindDefendedGoals();
            SetHomePosition();
        }

        protected override void Update()
        {
            base.Update();

            if (!isDiving)
            {
                TrackIncomingOrbs();
                MaintainPosition();
            }
            else
            {
                ExecuteDive();
            }
        }

        /// <summary>
        /// Trova gli anelli da difendere
        /// </summary>
        private void FindDefendedGoals()
        {
            Collider[] goals = Physics.OverlapSphere(
                transform.position,
                100f,
                goalRingLayer
            );

            Team playerTeam = GameManager.Instance.GetPlayerTeam();

            foreach (Collider goal in goals)
            {
                GoalRing goalRing = goal.GetComponent<GoalRing>();
                if (goalRing != null && goalRing.team == playerTeam)
                {
                    defendedGoals.Add(goal.transform);
                }
            }

            Debug.Log($"Trovati {defendedGoals.Count} anelli da difendere");
        }

        /// <summary>
        /// Imposta la posizione base del portiere
        /// </summary>
        private void SetHomePosition()
        {
            if (defendedGoals.Count > 0)
            {
                // Posizionati al centro degli anelli da difendere
                Vector3 center = Vector3.zero;
                foreach (Transform goal in defendedGoals)
                {
                    center += goal.position;
                }
                homePosition = center / defendedGoals.Count;
                homePosition += Vector3.forward * 5f; // Leggermente davanti agli anelli
            }
        }

        /// <summary>
        /// Traccia Score Orbs in arrivo
        /// </summary>
        private void TrackIncomingOrbs()
        {
            trackedOrbs.Clear();

            Collider[] orbs = Physics.OverlapSphere(
                transform.position,
                50f,
                orbLayer
            );

            foreach (Collider orb in orbs)
            {
                Rigidbody orbRb = orb.GetComponent<Rigidbody>();
                if (orbRb != null && orbRb.velocity.magnitude > 1f)
                {
                    // Verifica se si sta dirigendo verso i nostri anelli
                    foreach (Transform goal in defendedGoals)
                    {
                        Vector3 toGoal = (goal.position - orb.transform.position).normalized;
                        float dotProduct = Vector3.Dot(orbRb.velocity.normalized, toGoal);

                        if (dotProduct > 0.7f) // Si sta dirigendo verso l'anello
                        {
                            trackedOrbs.Add(orb.transform);
                            incomingOrb = orb.transform;
                            OnOrbDetected?.Invoke(orb.transform);
                            break;
                        }
                    }
                }
            }
        }

        /// <summary>
        /// Mantiene la posizione ottimale
        /// </summary>
        private void MaintainPosition()
        {
            if (incomingOrb != null)
            {
                // Posizionati tra l'orb e l'anello più vicino
                Transform nearestGoal = GetNearestGoal(incomingOrb.position);
                if (nearestGoal != null)
                {
                    Vector3 optimalPosition = Vector3.Lerp(
                        incomingOrb.position,
                        nearestGoal.position,
                        0.3f
                    );

                    // Muoviti verso la posizione ottimale
                    Vector3 direction = (optimalPosition - transform.position).normalized;
                    SetMoveDirection(direction);
                }
            }
            else
            {
                // Torna alla home position
                float distance = Vector3.Distance(transform.position, homePosition);
                if (distance > 2f)
                {
                    Vector3 direction = (homePosition - transform.position).normalized;
                    SetMoveDirection(direction * 0.5f);
                }
            }
        }

        /// <summary>
        /// Trova l'anello più vicino a una posizione
        /// </summary>
        private Transform GetNearestGoal(Vector3 position)
        {
            Transform nearest = null;
            float minDistance = float.MaxValue;

            foreach (Transform goal in defendedGoals)
            {
                float distance = Vector3.Distance(position, goal.position);
                if (distance < minDistance)
                {
                    minDistance = distance;
                    nearest = goal;
                }
            }

            return nearest;
        }

        /// <summary>
        /// Azione specifica: Tentativo di parata
        /// </summary>
        public override void PerformRoleAction()
        {
            if (incomingOrb != null)
            {
                AttemptSave(incomingOrb);
            }
            else
            {
                // Cerca orbs nel range
                Collider[] orbs = Physics.OverlapSphere(
                    transform.position,
                    saveRange,
                    orbLayer
                );

                if (orbs.Length > 0)
                {
                    AttemptSave(orbs[0].transform);
                }
            }
        }

        /// <summary>
        /// Tenta una parata
        /// </summary>
        private void AttemptSave(Transform orb)
        {
            float distance = Vector3.Distance(transform.position, orb.position);

            if (distance <= saveRange)
            {
                // Parata normale
                MakeSave(orb, false);
            }
            else if (distance <= saveRange * 2f && stamina > 20f)
            {
                // Tuffo necessario
                InitiateDive(orb.position);
            }
        }

        /// <summary>
        /// Esegue una parata
        /// </summary>
        private void MakeSave(Transform orb, bool isPerfect)
        {
            savesMade++;

            // Defletti l'orb
            Rigidbody orbRb = orb.GetComponent<Rigidbody>();
            if (orbRb != null)
            {
                Vector3 deflectDirection = (orb.position - transform.position).normalized;
                deflectDirection += Vector3.up * 0.5f; // Defletti verso l'alto
                orbRb.velocity = deflectDirection.normalized * 10f;
            }

            // Effetto visivo
            if (saveEffectPrefab != null)
            {
                Instantiate(saveEffectPrefab, orb.position, Quaternion.identity);
            }

            OnSave?.Invoke(isPerfect);

            string message = isPerfect ? "PARATA PERFETTA!" : "Parata riuscita!";
            Debug.Log(message);

            incomingOrb = null;
        }

        /// <summary>
        /// Inizia un tuffo
        /// </summary>
        private void InitiateDive(Vector3 target)
        {
            if (stamina < 20f) return;

            isDiving = true;
            diveTarget = target;
            diveStartTime = Time.time;
            stamina -= 20f;

            OnDive?.Invoke();
            Debug.Log("TUFFO!");
        }

        /// <summary>
        /// Esegue il tuffo
        /// </summary>
        private void ExecuteDive()
        {
            float diveProgress = (Time.time - diveStartTime) / 0.5f; // 0.5 secondi per tuffo

            if (diveProgress < 1f)
            {
                // Muoviti velocemente verso il target
                Vector3 direction = (diveTarget - transform.position).normalized;
                rb.velocity = direction * diveSpeed;

                // Controlla se intercetti l'orb
                if (incomingOrb != null)
                {
                    float distance = Vector3.Distance(transform.position, incomingOrb.position);
                    if (distance <= saveRange)
                    {
                        MakeSave(incomingOrb, true); // Tuffo = perfect save
                        EndDive();
                    }
                }
            }
            else
            {
                EndDive();
            }
        }

        /// <summary>
        /// Termina il tuffo
        /// </summary>
        private void EndDive()
        {
            isDiving = false;
            rb.velocity *= 0.5f; // Rallenta
        }

        /// <summary>
        /// Chiamato quando si subisce un goal
        /// </summary>
        public void ConcededGoal()
        {
            goalsConceded++;
            OnGoalConceded?.Invoke();
            Debug.Log($"Goal subito. Totale: {goalsConceded}");
        }

        /// <summary>
        /// Abilità speciale: Super parata
        /// </summary>
        public void SuperSave()
        {
            if (stamina < 50f) return;

            // Crea un'area di protezione temporanea
            StartCoroutine(SuperSaveRoutine());
            stamina -= 50f;
        }

        private System.Collections.IEnumerator SuperSaveRoutine()
        {
            float duration = 3f;
            float elapsed = 0f;

            Debug.Log("SUPER SAVE ATTIVA!");

            while (elapsed < duration)
            {
                // Defletti automaticamente tutti gli orbs nel raggio
                Collider[] orbs = Physics.OverlapSphere(
                    transform.position,
                    saveRange * 2f,
                    orbLayer
                );

                foreach (Collider orb in orbs)
                {
                    Rigidbody orbRb = orb.GetComponent<Rigidbody>();
                    if (orbRb != null)
                    {
                        Vector3 direction = (orb.transform.position - transform.position).normalized;
                        orbRb.velocity = direction * 15f;
                    }
                }

                elapsed += Time.deltaTime;
                yield return null;
            }

            Debug.Log("Super Save terminata");
        }

        /// <summary>
        /// Quick positioning
        /// </summary>
        public void QuickPosition(Vector3 targetPosition)
        {
            if (stamina < 15f) return;

            // Movimento rapido verso una posizione
            Vector3 direction = (targetPosition - transform.position).normalized;
            rb.AddForce(direction * diveSpeed * 5f, ForceMode.Impulse);
            stamina -= 15f;
        }

        private void OnDrawGizmosSelected()
        {
            // Visualizza range di parata
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(transform.position, saveRange);

            // Visualizza home position
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(homePosition, 1f);

            // Visualizza max distance
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(homePosition, maxDistanceFromGoal);

            // Linee verso gli anelli difesi
            Gizmos.color = Color.green;
            foreach (Transform goal in defendedGoals)
            {
                if (goal != null)
                {
                    Gizmos.DrawLine(transform.position, goal.position);
                }
            }
        }

        public int GetSavesMade() => savesMade;
        public int GetGoalsConceded() => goalsConceded;
        public float GetSavePercentage() => savesMade + goalsConceded > 0 ?
            (float)savesMade / (savesMade + goalsConceded) * 100f : 0f;
        public bool IsDiving() => isDiving;
    }
}
