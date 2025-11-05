using UnityEngine;

namespace SkySpheres.Gameplay
{
    /// <summary>
    /// Radiant Globe - Sfera dorata luminosa che termina la partita quando catturata
    /// (Equivalente del Golden Snitch)
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class RadiantGlobe : MonoBehaviour
    {
        [Header("Movement Settings")]
        [SerializeField] private float moveSpeed = 8f;
        [SerializeField] private float maxSpeed = 15f;
        [SerializeField] private float erraticMovementIntensity = 5f;
        [SerializeField] private float directionChangeInterval = 2f;

        [Header("Bounds")]
        [SerializeField] private Vector3 boundsCenter = Vector3.zero;
        [SerializeField] private Vector3 boundsSize = new Vector3(50f, 30f, 50f);

        [Header("Evasion")]
        [SerializeField] private float detectionRange = 15f;
        [SerializeField] private float evasionForce = 10f;
        [SerializeField] private LayerMask playerLayer;

        [Header("Visual Effects")]
        [SerializeField] private GameObject trailEffectPrefab;
        [SerializeField] private Light glowLight;
        [SerializeField] private float pulseSpeed = 2f;
        [SerializeField] private float minGlow = 0.5f;
        [SerializeField] private float maxGlow = 2f;

        [Header("Audio")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip hoverSound;
        [SerializeField] private AudioClip capturedSound;

        private Rigidbody rb;
        private Vector3 currentDirection;
        private float lastDirectionChangeTime;
        private bool isBeingPursued;
        private Transform pursuer;
        private ParticleSystem trailEffect;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.useGravity = false;
            rb.drag = 0.5f;

            // Setup audio
            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
            audioSource.loop = true;
            audioSource.spatialBlend = 1f; // 3D sound

            // Setup trail effect
            if (trailEffectPrefab != null)
            {
                GameObject trail = Instantiate(trailEffectPrefab, transform);
                trailEffect = trail.GetComponent<ParticleSystem>();
            }
        }

        private void Start()
        {
            // Direzione iniziale casuale
            ChangeDirection();

            // Play hover sound
            if (hoverSound != null && audioSource != null)
            {
                audioSource.clip = hoverSound;
                audioSource.Play();
            }
        }

        private void Update()
        {
            DetectPursuers();
            UpdateGlow();

            // Cambia direzione periodicamente
            if (Time.time - lastDirectionChangeTime >= directionChangeInterval)
            {
                ChangeDirection();
            }
        }

        private void FixedUpdate()
        {
            Move();
            AvoidPursuers();
            StayInBounds();
        }

        #region Movement

        /// <summary>
        /// Movimento erratico del Globe
        /// </summary>
        private void Move()
        {
            // Movimento base
            Vector3 movement = currentDirection * moveSpeed;

            // Aggiungi movimento erratico
            Vector3 erratic = new Vector3(
                Mathf.PerlinNoise(Time.time * 0.5f, 0f) - 0.5f,
                Mathf.PerlinNoise(0f, Time.time * 0.5f) - 0.5f,
                Mathf.PerlinNoise(Time.time * 0.5f, Time.time * 0.5f) - 0.5f
            ) * erraticMovementIntensity;

            Vector3 finalMovement = movement + erratic;

            // Applica velocità
            rb.velocity = Vector3.Lerp(rb.velocity, finalMovement, Time.fixedDeltaTime * 2f);

            // Limita velocità massima
            if (rb.velocity.magnitude > maxSpeed)
            {
                rb.velocity = rb.velocity.normalized * maxSpeed;
            }

            // Rotazione
            if (rb.velocity.magnitude > 0.1f)
            {
                Quaternion targetRotation = Quaternion.LookRotation(rb.velocity);
                transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, Time.fixedDeltaTime * 5f);
            }

            // Rotazione su se stesso per effetto
            transform.Rotate(Vector3.up, 180f * Time.fixedDeltaTime);
        }

        /// <summary>
        /// Cambia direzione casualmente
        /// </summary>
        private void ChangeDirection()
        {
            currentDirection = new Vector3(
                Random.Range(-1f, 1f),
                Random.Range(-0.5f, 0.5f),
                Random.Range(-1f, 1f)
            ).normalized;

            lastDirectionChangeTime = Time.time;
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
                currentDirection.x = -currentDirection.x;
                outOfBounds = true;
            }
            if (pos.y < min.y || pos.y > max.y)
            {
                currentDirection.y = -currentDirection.y;
                outOfBounds = true;
            }
            if (pos.z < min.z || pos.z > max.z)
            {
                currentDirection.z = -currentDirection.z;
                outOfBounds = true;
            }

            if (outOfBounds)
            {
                // Rimbalza
                pos.x = Mathf.Clamp(pos.x, min.x, max.x);
                pos.y = Mathf.Clamp(pos.y, min.y, max.y);
                pos.z = Mathf.Clamp(pos.z, min.z, max.z);
                transform.position = pos;
            }
        }

        #endregion

        #region Evasion

        /// <summary>
        /// Rileva giocatori in inseguimento
        /// </summary>
        private void DetectPursuers()
        {
            Collider[] players = Physics.OverlapSphere(transform.position, detectionRange, playerLayer);

            if (players.Length > 0)
            {
                isBeingPursued = true;
                pursuer = players[0].transform;

                // Aumenta velocità quando inseguito
                moveSpeed = Mathf.Lerp(moveSpeed, maxSpeed, Time.deltaTime);
            }
            else
            {
                isBeingPursued = false;
                pursuer = null;

                // Rallenta quando non inseguito
                moveSpeed = Mathf.Lerp(moveSpeed, maxSpeed * 0.6f, Time.deltaTime);
            }
        }

        /// <summary>
        /// Evita gli inseguitori
        /// </summary>
        private void AvoidPursuers()
        {
            if (!isBeingPursued || pursuer == null) return;

            // Scappa dal pursuer
            Vector3 awayDirection = (transform.position - pursuer.position).normalized;
            rb.AddForce(awayDirection * evasionForce, ForceMode.Acceleration);

            // Cambia direzione più frequentemente quando inseguito
            if (Time.time - lastDirectionChangeTime >= directionChangeInterval * 0.5f)
            {
                ChangeDirection();
            }
        }

        #endregion

        #region Visual Effects

        /// <summary>
        /// Aggiorna l'effetto glow pulsante
        /// </summary>
        private void UpdateGlow()
        {
            if (glowLight == null) return;

            float pulse = Mathf.Lerp(minGlow, maxGlow, (Mathf.Sin(Time.time * pulseSpeed) + 1f) * 0.5f);
            glowLight.intensity = pulse;

            // Intensità maggiore quando inseguito
            if (isBeingPursued)
            {
                glowLight.intensity *= 1.5f;
            }
        }

        #endregion

        #region Capture

        /// <summary>
        /// Quando viene catturato
        /// </summary>
        public void OnCaptured()
        {
            // Play sound
            if (capturedSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(capturedSound);
            }

            // Particle explosion
            if (trailEffect != null)
            {
                ParticleSystem.EmissionModule emission = trailEffect.emission;
                emission.rateOverTime = 100f;
            }

            // Qui si potrebbe aggiungere un'animazione di cattura
        }

        #endregion

        private void OnDrawGizmosSelected()
        {
            // Visualizza bounds
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireCube(boundsCenter, boundsSize);

            // Visualizza detection range
            Gizmos.color = Color.red;
            Gizmos.DrawWireSphere(transform.position, detectionRange);

            // Visualizza direzione corrente
            if (Application.isPlaying)
            {
                Gizmos.color = Color.green;
                Gizmos.DrawRay(transform.position, currentDirection * 5f);
            }
        }

        #region Getters

        public bool IsBeingPursued() => isBeingPursued;
        public Transform GetPursuer() => pursuer;
        public float GetSpeed() => rb.velocity.magnitude;

        #endregion
    }
}
