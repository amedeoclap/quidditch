using UnityEngine;
using SkySpheres.Core;

namespace SkySpheres.AI
{
    /// <summary>
    /// Seeker AI - Insegue e tenta di catturare il Radiant Globe
    /// </summary>
    public class SeekerAI : BaseAI
    {
        [Header("Seeker Specific")]
        [SerializeField] private LayerMask radiantGlobeLayer;
        [SerializeField] private float captureRange = 3f;
        [SerializeField] private float pursuitSpeed = 15f;
        [SerializeField] private float predictionTime = 1f;

        private Transform radiantGlobe;
        private bool isChasing;
        private Vector3 interceptPoint;
        private float captureProgress;

        protected override void Start()
        {
            base.Start();
            aiRole = PlayerRole.Seeker;
            moveSpeed = pursuitSpeed;
        }

        protected override void MakeDecision()
        {
            // Cerca il Radiant Globe
            if (radiantGlobe == null)
            {
                FindRadiantGlobe();
            }

            if (radiantGlobe != null)
            {
                float distance = Vector3.Distance(transform.position, radiantGlobe.position);

                if (distance <= captureRange)
                {
                    ChangeState(AIState.Attacking);
                }
                else
                {
                    ChangeState(AIState.Moving);
                    isChasing = true;
                }
            }
            else
            {
                ChangeState(AIState.Idle);
                isChasing = false;
            }
        }

        protected override void UpdateIdle()
        {
            // Patrol casuale mentre cerca il globe
            if (Random.value < 0.1f) // 10% chance ogni frame
            {
                Vector3 randomPoint = transform.position + new Vector3(
                    Random.Range(-20f, 20f),
                    Random.Range(-5f, 5f),
                    Random.Range(-20f, 20f)
                );
                moveDirection = (randomPoint - transform.position).normalized;
            }
        }

        protected override void UpdateMoving()
        {
            if (radiantGlobe != null)
            {
                // Calcola punto di intercettazione
                CalculateInterceptPoint();

                // Muovi verso il punto
                MoveTowards(interceptPoint);
            }
        }

        protected override void UpdateAttacking()
        {
            if (radiantGlobe != null)
            {
                float distance = Vector3.Distance(transform.position, radiantGlobe.position);

                if (distance <= captureRange)
                {
                    AttemptCapture();
                }
                else
                {
                    ChangeState(AIState.Moving);
                }
            }
            else
            {
                ChangeState(AIState.Idle);
            }
        }

        /// <summary>
        /// Cerca il Radiant Globe
        /// </summary>
        private void FindRadiantGlobe()
        {
            Collider[] globes = Physics.OverlapSphere(
                transform.position,
                visionRange * 2f, // Seeker ha range detection maggiore
                radiantGlobeLayer
            );

            if (globes.Length > 0)
            {
                radiantGlobe = globes[0].transform;
                Debug.Log($"{gameObject.name} ha rilevato il Radiant Globe!");
            }
        }

        /// <summary>
        /// Calcola il punto di intercettazione predittivo
        /// </summary>
        private void CalculateInterceptPoint()
        {
            if (radiantGlobe == null) return;

            Rigidbody globeRb = radiantGlobe.GetComponent<Rigidbody>();
            if (globeRb != null && globeRb.velocity.magnitude > 0.1f)
            {
                // Predizione avanzata basata su difficoltà
                float prediction = predictionTime * difficultyAccuracyMultiplier;

                // Aggiungi errore basato su difficoltà
                if (ShouldMakeMistake())
                {
                    prediction *= Random.Range(0.5f, 1.5f);
                }

                interceptPoint = radiantGlobe.position + globeRb.velocity * prediction;
            }
            else
            {
                interceptPoint = radiantGlobe.position;
            }
        }

        /// <summary>
        /// Tenta di catturare il Globe
        /// </summary>
        private void AttemptCapture()
        {
            // Simula tempo di cattura
            captureProgress += Time.deltaTime * difficultyAccuracyMultiplier;

            // Difficoltà influenza velocità di cattura
            float captureThreshold = 1f / difficultyAccuracyMultiplier;

            if (captureProgress >= captureThreshold)
            {
                CaptureGlobe();
            }
        }

        /// <summary>
        /// Cattura il Globe
        /// </summary>
        private void CaptureGlobe()
        {
            Debug.Log($"{gameObject.name} (Team {aiTeam}) ha catturato il Radiant Globe!");

            // Notifica GameManager
            GameManager.Instance.OnRadiantGlobeCaptured(aiTeam);

            // Distruggi il globe
            if (radiantGlobe != null)
            {
                Destroy(radiantGlobe.gameObject);
            }

            radiantGlobe = null;
            isChasing = false;
            captureProgress = 0f;
            ChangeState(AIState.Idle);
        }

        /// <summary>
        /// Abilità: Quick dash verso il globe
        /// </summary>
        private void QuickDash()
        {
            if (radiantGlobe == null) return;

            Vector3 direction = (radiantGlobe.position - transform.position).normalized;
            rb.AddForce(direction * pursuitSpeed * 5f, ForceMode.Impulse);
        }

        protected override void OnStateChanged(AIState newState)
        {
            switch (newState)
            {
                case AIState.Attacking:
                    captureProgress = 0f;
                    break;
            }
        }

        protected override void OnDrawGizmosSelected()
        {
            base.OnDrawGizmosSelected();

            // Visualizza intercept point
            if (isChasing && radiantGlobe != null)
            {
                Gizmos.color = Color.green;
                Gizmos.DrawWireSphere(interceptPoint, 1f);
                Gizmos.DrawLine(transform.position, interceptPoint);
            }

            // Visualizza capture range
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireSphere(transform.position, captureRange);
        }
    }
}
