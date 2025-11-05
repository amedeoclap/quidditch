using UnityEngine;
using SkySpheres.Core;

namespace SkySpheres.AI
{
    /// <summary>
    /// Base AI Controller - Classe astratta per tutti gli AI nel gioco
    /// Implementa comportamenti comuni e state machine
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public abstract class BaseAI : MonoBehaviour
    {
        [Header("AI Settings")]
        [SerializeField] protected Difficulty aiDifficulty = Difficulty.Medium;
        [SerializeField] protected Team aiTeam = Team.Red;
        [SerializeField] protected PlayerRole aiRole;

        [Header("Movement")]
        [SerializeField] protected float moveSpeed = 10f;
        [SerializeField] protected float turnSpeed = 5f;
        [SerializeField] protected float reactionTime = 0.5f;

        [Header("Perception")]
        [SerializeField] protected float visionRange = 30f;
        [SerializeField] protected float visionAngle = 120f;
        [SerializeField] protected LayerMask detectionLayers;

        [Header("Decision Making")]
        [SerializeField] protected float decisionInterval = 0.5f;
        [SerializeField] protected float randomness = 0.2f; // 0-1, più alto = più errori

        // Components
        protected Rigidbody rb;
        protected Transform target;

        // State
        protected AIState currentState = AIState.Idle;
        protected Vector3 moveDirection;
        protected float lastDecisionTime;
        protected bool isStunned;
        protected float stunnedUntil;

        // Stats modificati da difficoltà
        protected float difficultySpeedMultiplier = 1f;
        protected float difficultyAccuracyMultiplier = 1f;
        protected float difficultyReactionMultiplier = 1f;

        protected enum AIState
        {
            Idle,
            Moving,
            Attacking,
            Defending,
            Retreating,
            Stunned
        }

        protected virtual void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.useGravity = false;
            ApplyDifficultyModifiers();
        }

        protected virtual void Start()
        {
            lastDecisionTime = Time.time;
        }

        protected virtual void Update()
        {
            // Check stun
            if (isStunned)
            {
                if (Time.time >= stunnedUntil)
                {
                    isStunned = false;
                    ChangeState(AIState.Idle);
                }
                return;
            }

            // Decision making
            if (Time.time - lastDecisionTime >= decisionInterval)
            {
                MakeDecision();
                lastDecisionTime = Time.time;
            }

            // Update state
            UpdateState();
        }

        protected virtual void FixedUpdate()
        {
            if (!isStunned)
            {
                Move();
            }
        }

        #region Decision Making

        /// <summary>
        /// Prende decisioni basate sullo stato corrente
        /// </summary>
        protected abstract void MakeDecision();

        /// <summary>
        /// Aggiorna lo stato corrente
        /// </summary>
        protected virtual void UpdateState()
        {
            switch (currentState)
            {
                case AIState.Idle:
                    UpdateIdle();
                    break;
                case AIState.Moving:
                    UpdateMoving();
                    break;
                case AIState.Attacking:
                    UpdateAttacking();
                    break;
                case AIState.Defending:
                    UpdateDefending();
                    break;
                case AIState.Retreating:
                    UpdateRetreating();
                    break;
                case AIState.Stunned:
                    UpdateStunned();
                    break;
            }
        }

        protected virtual void UpdateIdle() { }
        protected virtual void UpdateMoving() { }
        protected virtual void UpdateAttacking() { }
        protected virtual void UpdateDefending() { }
        protected virtual void UpdateRetreating() { }
        protected virtual void UpdateStunned() { }

        /// <summary>
        /// Cambia stato AI
        /// </summary>
        protected virtual void ChangeState(AIState newState)
        {
            currentState = newState;
            OnStateChanged(newState);
        }

        protected virtual void OnStateChanged(AIState newState) { }

        #endregion

        #region Movement

        /// <summary>
        /// Movimento base dell'AI
        /// </summary>
        protected virtual void Move()
        {
            if (moveDirection.magnitude < 0.1f) return;

            // Applica movimento
            float speed = moveSpeed * difficultySpeedMultiplier;
            Vector3 velocity = moveDirection.normalized * speed;
            rb.velocity = Vector3.Lerp(rb.velocity, velocity, Time.fixedDeltaTime * 5f);

            // Rotazione verso la direzione
            if (moveDirection != Vector3.zero)
            {
                Quaternion targetRotation = Quaternion.LookRotation(moveDirection);
                transform.rotation = Quaternion.Slerp(
                    transform.rotation,
                    targetRotation,
                    turnSpeed * Time.fixedDeltaTime
                );
            }
        }

        /// <summary>
        /// Si muove verso un target
        /// </summary>
        protected virtual void MoveTowards(Vector3 targetPosition)
        {
            Vector3 direction = (targetPosition - transform.position).normalized;

            // Aggiungi randomness basato su difficoltà
            if (randomness > 0)
            {
                direction += new Vector3(
                    Random.Range(-randomness, randomness),
                    Random.Range(-randomness * 0.5f, randomness * 0.5f),
                    Random.Range(-randomness, randomness)
                );
                direction.Normalize();
            }

            moveDirection = direction;
        }

        /// <summary>
        /// Evita un target
        /// </summary>
        protected virtual void MoveAwayFrom(Vector3 dangerPosition)
        {
            Vector3 direction = (transform.position - dangerPosition).normalized;
            moveDirection = direction;
        }

        /// <summary>
        /// Predice la posizione futura di un target in movimento
        /// </summary>
        protected Vector3 PredictTargetPosition(Transform target, float timeAhead)
        {
            Rigidbody targetRb = target.GetComponent<Rigidbody>();
            if (targetRb != null)
            {
                return target.position + targetRb.velocity * timeAhead;
            }
            return target.position;
        }

        #endregion

        #region Perception

        /// <summary>
        /// Cerca il target più vicino
        /// </summary>
        protected Transform FindNearestTarget(LayerMask layer)
        {
            Collider[] colliders = Physics.OverlapSphere(transform.position, visionRange, layer);
            Transform nearest = null;
            float minDistance = float.MaxValue;

            foreach (Collider col in colliders)
            {
                if (col.transform == transform) continue;

                float distance = Vector3.Distance(transform.position, col.position);
                if (distance < minDistance && IsInFieldOfView(col.transform))
                {
                    minDistance = distance;
                    nearest = col.transform;
                }
            }

            return nearest;
        }

        /// <summary>
        /// Verifica se un transform è nel campo visivo
        /// </summary>
        protected bool IsInFieldOfView(Transform target)
        {
            Vector3 directionToTarget = (target.position - transform.position).normalized;
            float angle = Vector3.Angle(transform.forward, directionToTarget);
            return angle < visionAngle * 0.5f;
        }

        /// <summary>
        /// Raycast per verificare visibilità diretta
        /// </summary>
        protected bool HasLineOfSight(Transform target)
        {
            Vector3 direction = target.position - transform.position;
            RaycastHit hit;

            if (Physics.Raycast(transform.position, direction, out hit, visionRange))
            {
                return hit.transform == target;
            }

            return false;
        }

        #endregion

        #region Difficulty Modifiers

        /// <summary>
        /// Applica modificatori basati sulla difficoltà
        /// </summary>
        protected virtual void ApplyDifficultyModifiers()
        {
            switch (aiDifficulty)
            {
                case Difficulty.Easy:
                    difficultySpeedMultiplier = 0.7f;
                    difficultyAccuracyMultiplier = 0.6f;
                    difficultyReactionMultiplier = 1.5f;
                    randomness = 0.4f;
                    reactionTime = 1.0f;
                    break;

                case Difficulty.Medium:
                    difficultySpeedMultiplier = 1.0f;
                    difficultyAccuracyMultiplier = 0.8f;
                    difficultyReactionMultiplier = 1.0f;
                    randomness = 0.2f;
                    reactionTime = 0.5f;
                    break;

                case Difficulty.Hard:
                    difficultySpeedMultiplier = 1.3f;
                    difficultyAccuracyMultiplier = 0.95f;
                    difficultyReactionMultiplier = 0.7f;
                    randomness = 0.1f;
                    reactionTime = 0.3f;
                    break;

                case Difficulty.Expert:
                    difficultySpeedMultiplier = 1.5f;
                    difficultyAccuracyMultiplier = 1.0f;
                    difficultyReactionMultiplier = 0.5f;
                    randomness = 0.05f;
                    reactionTime = 0.1f;
                    break;
            }
        }

        /// <summary>
        /// Simula errore umano
        /// </summary>
        protected bool ShouldMakeMistake()
        {
            return Random.value < randomness;
        }

        #endregion

        #region Status Effects

        /// <summary>
        /// Applica stun all'AI
        /// </summary>
        public virtual void ApplyStun(float duration)
        {
            isStunned = true;
            stunnedUntil = Time.time + duration;
            ChangeState(AIState.Stunned);
            rb.velocity = Vector3.zero;
            Debug.Log($"{gameObject.name} stordito per {duration}s");
        }

        #endregion

        #region Getters/Setters

        public AIState GetCurrentState() => currentState;
        public Team GetTeam() => aiTeam;
        public PlayerRole GetRole() => aiRole;
        public void SetDifficulty(Difficulty difficulty)
        {
            aiDifficulty = difficulty;
            ApplyDifficultyModifiers();
        }

        #endregion

        protected virtual void OnDrawGizmosSelected()
        {
            // Visualizza vision range
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, visionRange);

            // Visualizza field of view
            Vector3 fovLine1 = Quaternion.AngleAxis(visionAngle * 0.5f, transform.up) * transform.forward * visionRange;
            Vector3 fovLine2 = Quaternion.AngleAxis(-visionAngle * 0.5f, transform.up) * transform.forward * visionRange;

            Gizmos.color = Color.blue;
            Gizmos.DrawLine(transform.position, transform.position + fovLine1);
            Gizmos.DrawLine(transform.position, transform.position + fovLine2);

            // Visualizza target
            if (target != null)
            {
                Gizmos.color = Color.red;
                Gizmos.DrawLine(transform.position, target.position);
            }
        }
    }
}
