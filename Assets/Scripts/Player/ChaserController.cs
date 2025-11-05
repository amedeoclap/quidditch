using UnityEngine;
using UnityEngine.Events;
using SkySpheres.Core;

namespace SkySpheres.Player
{
    /// <summary>
    /// Chaser Controller - Lancia Score Orbs negli anelli per segnare punti
    /// Focus su precisione e tattica
    /// </summary>
    public class ChaserController : PlayerController
    {
        [Header("Chaser Specific")]
        [SerializeField] private float throwForce = 25f;
        [SerializeField] private float maxThrowForce = 40f;
        [SerializeField] private float throwCooldown = 2f;
        [SerializeField] private float catchRange = 5f;
        [SerializeField] private LayerMask scoreOrbLayer;
        [SerializeField] private LayerMask goalRingLayer;

        [Header("Aiming")]
        [SerializeField] private float aimAssistRadius = 2f;
        [SerializeField] private LayerMask aimAssistLayer;
        [SerializeField] private LineRenderer trajectoryPreview;
        [SerializeField] private int trajectoryPoints = 30;

        [Header("Scoring")]
        [SerializeField] private int pointsPerGoal = 10;
        [SerializeField] private float perfectShotAngle = 15f;

        // Events
        public UnityEvent<Transform> OnOrbCaught;
        public UnityEvent<Vector3> OnOrbThrown;
        public UnityEvent<int> OnGoalScored; // punti
        public UnityEvent OnPerfectShot;

        private Transform heldOrb;
        private bool isAiming;
        private Vector3 aimDirection;
        private float chargeTime;
        private float lastThrowTime;
        private int goalsScored;
        private Transform nearestGoal;

        protected override void InitializeRole()
        {
            Debug.Log("Chaser inizializzato - Focus: Precisione e Punteggio");
        }

        protected override void Update()
        {
            base.Update();

            FindNearestGoal();

            if (heldOrb == null)
            {
                TryPickupOrb();
            }

            if (isAiming)
            {
                UpdateAim();
                ShowTrajectoryPreview();
            }
        }

        /// <summary>
        /// Trova l'anello più vicino
        /// </summary>
        private void FindNearestGoal()
        {
            Collider[] goals = Physics.OverlapSphere(
                transform.position,
                100f,
                goalRingLayer
            );

            float minDistance = float.MaxValue;
            Transform nearest = null;

            foreach (Collider goal in goals)
            {
                // Verifica che sia l'anello nemico
                GoalRing goalRing = goal.GetComponent<GoalRing>();
                if (goalRing != null && goalRing.team != GameManager.Instance.GetPlayerTeam())
                {
                    float distance = Vector3.Distance(transform.position, goal.transform.position);
                    if (distance < minDistance)
                    {
                        minDistance = distance;
                        nearest = goal.transform;
                    }
                }
            }

            nearestGoal = nearest;
        }

        /// <summary>
        /// Prova a raccogliere un Score Orb
        /// </summary>
        private void TryPickupOrb()
        {
            Collider[] orbs = Physics.OverlapSphere(
                transform.position,
                catchRange,
                scoreOrbLayer
            );

            if (orbs.Length > 0)
            {
                PickupOrb(orbs[0].transform);
            }
        }

        /// <summary>
        /// Raccoglie un Score Orb
        /// </summary>
        private void PickupOrb(Transform orb)
        {
            heldOrb = orb;
            heldOrb.SetParent(transform);
            heldOrb.localPosition = Vector3.forward * 2f; // Davanti al giocatore

            // Disabilita fisica dell'orb
            Rigidbody orbRb = heldOrb.GetComponent<Rigidbody>();
            if (orbRb != null)
            {
                orbRb.isKinematic = true;
            }

            OnOrbCaught?.Invoke(heldOrb);
            Debug.Log("Score Orb raccolto!");
        }

        /// <summary>
        /// Aggiorna la mira
        /// </summary>
        private void UpdateAim()
        {
            if (nearestGoal != null)
            {
                // Aim assist verso l'anello
                aimDirection = (nearestGoal.position - transform.position).normalized;
            }
            else
            {
                // Mira nella direzione forward
                aimDirection = transform.forward;
            }

            chargeTime += Time.deltaTime;
            chargeTime = Mathf.Clamp(chargeTime, 0f, 2f);
        }

        /// <summary>
        /// Mostra l'anteprima della traiettoria
        /// </summary>
        private void ShowTrajectoryPreview()
        {
            if (trajectoryPreview == null || heldOrb == null) return;

            trajectoryPreview.enabled = true;
            Vector3[] points = CalculateTrajectory();
            trajectoryPreview.positionCount = points.Length;
            trajectoryPreview.SetPositions(points);
        }

        /// <summary>
        /// Calcola la traiettoria prevista
        /// </summary>
        private Vector3[] CalculateTrajectory()
        {
            Vector3[] points = new Vector3[trajectoryPoints];
            Vector3 startPos = transform.position;
            float currentThrowForce = Mathf.Lerp(throwForce, maxThrowForce, chargeTime / 2f);
            Vector3 velocity = aimDirection * currentThrowForce;

            for (int i = 0; i < trajectoryPoints; i++)
            {
                float t = i * 0.1f;
                points[i] = startPos + velocity * t + Physics.gravity * t * t * 0.5f;
            }

            return points;
        }

        /// <summary>
        /// Azione specifica: Lancia il Score Orb
        /// </summary>
        public override void PerformRoleAction()
        {
            if (heldOrb == null) return;
            if (Time.time - lastThrowTime < throwCooldown) return;

            ThrowOrb();
            lastThrowTime = Time.time;
        }

        /// <summary>
        /// Lancia l'orb
        /// </summary>
        private void ThrowOrb()
        {
            float currentThrowForce = Mathf.Lerp(throwForce, maxThrowForce, chargeTime / 2f);

            // Riattiva fisica
            Rigidbody orbRb = heldOrb.GetComponent<Rigidbody>();
            if (orbRb != null)
            {
                orbRb.isKinematic = false;
                orbRb.velocity = Vector3.zero;
                orbRb.AddForce(aimDirection * currentThrowForce, ForceMode.Impulse);
            }

            // Aggiungi component per tracking
            ScoreOrbTracker tracker = heldOrb.gameObject.AddComponent<ScoreOrbTracker>();
            tracker.thrower = this;
            tracker.thrownDirection = aimDirection;

            OnOrbThrown?.Invoke(heldOrb.position);

            heldOrb.SetParent(null);
            heldOrb = null;
            isAiming = false;
            chargeTime = 0f;

            if (trajectoryPreview != null)
            {
                trajectoryPreview.enabled = false;
            }

            Debug.Log("Score Orb lanciato!");
        }

        /// <summary>
        /// Inizia a mirare
        /// </summary>
        public void StartAiming()
        {
            if (heldOrb == null) return;
            isAiming = true;
            chargeTime = 0f;
        }

        /// <summary>
        /// Rilascia il tiro
        /// </summary>
        public void ReleaseThrow()
        {
            if (isAiming && heldOrb != null)
            {
                PerformRoleAction();
            }
        }

        /// <summary>
        /// Chiamato quando un goal viene segnato
        /// </summary>
        public void OnGoal(bool isPerfectShot)
        {
            goalsScored++;
            int points = isPerfectShot ? pointsPerGoal * 2 : pointsPerGoal;

            GameManager.Instance.AddScore(GameManager.Instance.GetPlayerTeam(), points);
            OnGoalScored?.Invoke(points);

            if (isPerfectShot)
            {
                OnPerfectShot?.Invoke();
                Debug.Log("PERFECT SHOT!");
            }

            Debug.Log($"GOAL! +{points} punti");
        }

        /// <summary>
        /// Passaggio a un compagno
        /// </summary>
        public void PassToTeammate(Transform teammate)
        {
            if (heldOrb == null) return;

            aimDirection = (teammate.position - transform.position).normalized;
            ThrowOrb();

            Debug.Log("Passaggio effettuato!");
        }

        /// <summary>
        /// Abilità speciale: Tiro curvato
        /// </summary>
        public void CurvedShot()
        {
            if (stamina < 30f || heldOrb == null) return;

            // Lancia con effetto curva
            ThrowOrb();

            Rigidbody orbRb = heldOrb.GetComponent<Rigidbody>();
            if (orbRb != null)
            {
                // Aggiungi spin
                orbRb.AddTorque(Vector3.up * 50f, ForceMode.Impulse);
            }

            stamina -= 30f;
            Debug.Log("Curved Shot!");
        }

        private void OnDrawGizmosSelected()
        {
            // Visualizza range di raccolta
            Gizmos.color = Color.blue;
            Gizmos.DrawWireSphere(transform.position, catchRange);

            // Visualizza direzione di mira
            if (isAiming)
            {
                Gizmos.color = Color.green;
                Gizmos.DrawRay(transform.position, aimDirection * 10f);
            }
        }

        public bool HasOrb() => heldOrb != null;
        public Transform GetHeldOrb() => heldOrb;
        public int GetGoalsScored() => goalsScored;
        public float GetChargeProgress() => chargeTime / 2f;
    }

    /// <summary>
    /// Component aggiunto al Score Orb per tracciare il lancio
    /// </summary>
    public class ScoreOrbTracker : MonoBehaviour
    {
        public ChaserController thrower;
        public Vector3 thrownDirection;

        private void OnTriggerEnter(Collider other)
        {
            GoalRing goal = other.GetComponent<GoalRing>();
            if (goal != null && thrower != null)
            {
                // Verifica se è un perfect shot
                float angle = Vector3.Angle(thrownDirection, (other.transform.position - transform.position).normalized);
                bool isPerfect = angle < thrower.perfectShotAngle;

                thrower.OnGoal(isPerfect);
                Destroy(gameObject);
            }
        }
    }

    /// <summary>
    /// Component per gli anelli (goal)
    /// </summary>
    public class GoalRing : MonoBehaviour
    {
        public Team team;
        public int ringHeight; // 1 = basso, 2 = medio, 3 = alto (punti diversi?)
    }
}
