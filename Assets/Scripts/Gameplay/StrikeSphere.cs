using UnityEngine;
using SkySpheres.Core;
using SkySpheres.AI;

namespace SkySpheres.Gameplay
{
    /// <summary>
    /// Strike Sphere - Sfera aggressiva che cerca e attacca i giocatori
    /// (Equivalente del Bludger)
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class StrikeSphere : MonoBehaviour
    {
        [Header("Movement")]
        [SerializeField] private float moveSpeed = 12f;
        [SerializeField] private float maxSpeed = 20f;
        [SerializeField] private float acceleration = 5f;
        [SerializeField] private float rotationSpeed = 10f;

        [Header("Targeting")]
        [SerializeField] private float detectionRange = 30f;
        [SerializeField] private float attackRange = 2f;
        [SerializeField] private float targetSwitchInterval = 5f;
        [SerializeField] private LayerMask targetLayers;

        [Header("Damage")]
        [SerializeField] private float stunDuration = 2f;
        [SerializeField] private float knockbackForce = 15f;
        [SerializeField] private float damageCooldown = 3f;

        [Header("Bounds")]
        [SerializeField] private Vector3 boundsCenter = Vector3.zero;
        [SerializeField] private Vector3 boundsSize = new Vector3(50f, 30f, 50f);

        [Header("Visual Effects")]
        [SerializeField] private GameObject trailEffect;
        [SerializeField] private GameObject hitEffectPrefab;
        [SerializeField] private Material aggressiveMaterial;
        [SerializeField] private MeshRenderer meshRenderer;

        [Header("Audio")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip whooshSound;
        [SerializeField] private AudioClip hitSound;
        [SerializeField] private AudioClip deflectedSound;

        private Rigidbody rb;
        private Transform currentTarget;
        private float lastTargetSwitchTime;
        private float lastDamageTime;
        private bool isControlled; // Se controllato da un Beater
        private float controlledUntil;
        private Team controllingTeam;
        private Vector3 currentDirection;

        private enum SphereState
        {
            Hunting,
            Attacking,
            Deflected,
            Controlled
        }

        private SphereState currentState = SphereState.Hunting;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.useGravity = false;
            rb.drag = 0.3f;

            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
            audioSource.spatialBlend = 1f;
            audioSource.loop = true;
        }

        private void Start()
        {
            if (whooshSound != null && audioSource != null)
            {
                audioSource.clip = whooshSound;
                audioSource.Play();
            }

            if (trailEffect != null)
            {
                trailEffect.SetActive(true);
            }
        }

        private void Update()
        {
            // Check se il controllo è terminato
            if (isControlled && Time.time >= controlledUntil)
            {
                isControlled = false;
                currentState = SphereState.Hunting;
            }

            UpdateState();
        }

        private void FixedUpdate()
        {
            Move();
            StayInBounds();
        }

        #region State Machine

        /// <summary>
        /// Aggiorna lo stato corrente
        /// </summary>
        private void UpdateState()
        {
            switch (currentState)
            {
                case SphereState.Hunting:
                    UpdateHunting();
                    break;
                case SphereState.Attacking:
                    UpdateAttacking();
                    break;
                case SphereState.Deflected:
                    UpdateDeflected();
                    break;
                case SphereState.Controlled:
                    UpdateControlled();
                    break;
            }
        }

        /// <summary>
        /// Hunting state - cerca un target
        /// </summary>
        private void UpdateHunting()
        {
            // Switch target periodicamente
            if (Time.time - lastTargetSwitchTime >= targetSwitchInterval || currentTarget == null)
            {
                FindNewTarget();
                lastTargetSwitchTime = Time.time;
            }

            if (currentTarget != null)
            {
                float distance = Vector3.Distance(transform.position, currentTarget.position);

                if (distance <= attackRange)
                {
                    currentState = SphereState.Attacking;
                }
            }
        }

        /// <summary>
        /// Attacking state - attacca il target
        /// </summary>
        private void UpdateAttacking()
        {
            if (currentTarget == null)
            {
                currentState = SphereState.Hunting;
                return;
            }

            float distance = Vector3.Distance(transform.position, currentTarget.position);

            if (distance > attackRange * 2f)
            {
                currentState = SphereState.Hunting;
            }
        }

        /// <summary>
        /// Deflected state - deviata da un colpo
        /// </summary>
        private void UpdateDeflected()
        {
            // Torna a hunting dopo un po'
            if (rb.velocity.magnitude < moveSpeed * 0.5f)
            {
                currentState = SphereState.Hunting;
            }
        }

        /// <summary>
        /// Controlled state - controllata da un Beater
        /// </summary>
        private void UpdateControlled()
        {
            // Cerca target del team avversario
            if (currentTarget == null || IsTargetSameTeam())
            {
                FindTargetForTeam(GetOppositeTeam(controllingTeam));
            }
        }

        #endregion

        #region Movement

        /// <summary>
        /// Movimento della sfera
        /// </summary>
        private void Move()
        {
            Vector3 targetDirection = Vector3.zero;

            if (currentTarget != null && currentState != SphereState.Deflected)
            {
                // Movimento predittivo
                Vector3 predictedPosition = PredictTargetPosition();
                targetDirection = (predictedPosition - transform.position).normalized;
            }
            else if (currentState == SphereState.Deflected)
            {
                // Continua nella direzione corrente quando deviata
                targetDirection = rb.velocity.normalized;
            }
            else
            {
                // Movimento random
                if (currentDirection == Vector3.zero || Random.value < 0.01f)
                {
                    currentDirection = Random.insideUnitSphere.normalized;
                }
                targetDirection = currentDirection;
            }

            // Accelera verso il target
            float currentSpeed = isControlled ? maxSpeed * 1.2f : moveSpeed;
            Vector3 targetVelocity = targetDirection * currentSpeed;
            rb.velocity = Vector3.Lerp(rb.velocity, targetVelocity, acceleration * Time.fixedDeltaTime);

            // Limita velocità
            if (rb.velocity.magnitude > maxSpeed)
            {
                rb.velocity = rb.velocity.normalized * maxSpeed;
            }

            // Rotazione
            if (rb.velocity.magnitude > 0.1f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(rb.velocity);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.fixedDeltaTime);
            }

            // Rotazione su se stessa
            transform.Rotate(Vector3.up * 360f * Time.fixedDeltaTime, Space.Self);
        }

        /// <summary>
        /// Predice la posizione futura del target
        /// </summary>
        private Vector3 PredictTargetPosition()
        {
            if (currentTarget == null) return transform.position;

            Rigidbody targetRb = currentTarget.GetComponent<Rigidbody>();
            if (targetRb != null)
            {
                float distance = Vector3.Distance(transform.position, currentTarget.position);
                float timeToReach = distance / moveSpeed;
                return currentTarget.position + targetRb.velocity * timeToReach;
            }

            return currentTarget.position;
        }

        /// <summary>
        /// Rimani dentro i bounds
        /// </summary>
        private void StayInBounds()
        {
            Vector3 pos = transform.position;
            Vector3 min = boundsCenter - boundsSize * 0.5f;
            Vector3 max = boundsCenter + boundsSize * 0.5f;

            bool outOfBounds = false;

            if (pos.x < min.x || pos.x > max.x)
            {
                rb.velocity = new Vector3(-rb.velocity.x, rb.velocity.y, rb.velocity.z);
                outOfBounds = true;
            }
            if (pos.y < min.y || pos.y > max.y)
            {
                rb.velocity = new Vector3(rb.velocity.x, -rb.velocity.y, rb.velocity.z);
                outOfBounds = true;
            }
            if (pos.z < min.z || pos.z > max.z)
            {
                rb.velocity = new Vector3(rb.velocity.x, rb.velocity.y, -rb.velocity.z);
                outOfBounds = true;
            }

            if (outOfBounds)
            {
                pos.x = Mathf.Clamp(pos.x, min.x, max.x);
                pos.y = Mathf.Clamp(pos.y, min.y, max.y);
                pos.z = Mathf.Clamp(pos.z, min.z, max.z);
                transform.position = pos;
            }
        }

        #endregion

        #region Targeting

        /// <summary>
        /// Trova un nuovo target
        /// </summary>
        private void FindNewTarget()
        {
            Collider[] targets = Physics.OverlapSphere(transform.position, detectionRange, targetLayers);

            if (targets.Length == 0)
            {
                currentTarget = null;
                return;
            }

            // Scegli un target casuale tra quelli disponibili
            Transform newTarget = targets[Random.Range(0, targets.Length)].transform;

            // Se controllata, evita target dello stesso team
            if (isControlled)
            {
                foreach (Collider col in targets)
                {
                    // Qui si verificherebbe il team del target
                    // Per ora scegliamo casualmente
                    newTarget = col.transform;
                    break;
                }
            }

            currentTarget = newTarget;
        }

        /// <summary>
        /// Trova target per un team specifico
        /// </summary>
        private void FindTargetForTeam(Team team)
        {
            Collider[] targets = Physics.OverlapSphere(transform.position, detectionRange, targetLayers);

            foreach (Collider col in targets)
            {
                // Qui si verificherebbe il team
                // Per ora scegliamo il primo disponibile
                currentTarget = col.transform;
                break;
            }
        }

        /// <summary>
        /// Verifica se il target è dello stesso team
        /// </summary>
        private bool IsTargetSameTeam()
        {
            if (currentTarget == null) return false;
            // Qui si verificherebbe il team del target
            return false;
        }

        private Team GetOppositeTeam(Team team)
        {
            return team == Team.Blue ? Team.Red : Team.Blue;
        }

        #endregion

        #region Hit & Deflect

        /// <summary>
        /// Colpisce un target
        /// </summary>
        private void OnCollisionEnter(Collision collision)
        {
            // Hit effect
            if (hitEffectPrefab != null)
            {
                Instantiate(hitEffectPrefab, collision.contacts[0].point, Quaternion.identity);
            }

            // Check se colpisce un giocatore o AI
            if (Time.time - lastDamageTime < damageCooldown) return;

            var player = collision.gameObject.GetComponent<Player.PlayerController>();
            var ai = collision.gameObject.GetComponent<BaseAI>();

            if (player != null)
            {
                HitTarget(collision.gameObject, collision.contacts[0].normal);
            }
            else if (ai != null)
            {
                HitAI(ai, collision.contacts[0].normal);
            }

            // Play hit sound
            if (hitSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(hitSound);
            }
        }

        /// <summary>
        /// Colpisce un target
        /// </summary>
        private void HitTarget(GameObject target, Vector3 normal)
        {
            Debug.Log($"Strike Sphere colpisce {target.name}!");

            // Knockback
            Rigidbody targetRb = target.GetComponent<Rigidbody>();
            if (targetRb != null)
            {
                Vector3 knockback = -normal * knockbackForce;
                targetRb.AddForce(knockback, ForceMode.Impulse);
            }

            // Stun (qui si chiamerebbe un metodo sul player per stun)
            // target.GetComponent<PlayerController>()?.ApplyStun(stunDuration);

            lastDamageTime = Time.time;
            currentTarget = null;
            currentState = SphereState.Hunting;
        }

        /// <summary>
        /// Colpisce un'AI
        /// </summary>
        private void HitAI(BaseAI ai, Vector3 normal)
        {
            ai.ApplyStun(stunDuration);

            // Knockback
            Rigidbody aiRb = ai.GetComponent<Rigidbody>();
            if (aiRb != null)
            {
                Vector3 knockback = -normal * knockbackForce;
                aiRb.AddForce(knockback, ForceMode.Impulse);
            }

            lastDamageTime = Time.time;
            currentTarget = null;
            currentState = SphereState.Hunting;
        }

        /// <summary>
        /// Viene deviata da un Beater
        /// </summary>
        public void Deflect(Vector3 direction, float force, Team team)
        {
            rb.velocity = direction.normalized * force;
            currentState = SphereState.Deflected;
            isControlled = true;
            controllingTeam = team;
            controlledUntil = Time.time + 5f;

            if (deflectedSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(deflectedSound);
            }

            // Cambia colore per indicare controllo
            if (meshRenderer != null && aggressiveMaterial != null)
            {
                meshRenderer.material = aggressiveMaterial;
            }
        }

        #endregion

        private void OnDrawGizmosSelected()
        {
            // Detection range
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, detectionRange);

            // Attack range
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, attackRange);

            // Bounds
            Gizmos.color = Color.cyan;
            Gizmos.DrawWireCube(boundsCenter, boundsSize);

            // Target line
            if (currentTarget != null && Application.isPlaying)
            {
                Gizmos.color = Color.magenta;
                Gizmos.DrawLine(transform.position, currentTarget.position);
            }
        }

        public Transform GetCurrentTarget() => currentTarget;
        public bool IsControlled() => isControlled;
        public Team GetControllingTeam() => controllingTeam;
    }
}
