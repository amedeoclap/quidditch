using UnityEngine;
using SkySpheres.Core;

namespace SkySpheres.Gameplay
{
    /// <summary>
    /// Score Orb - Sfera da lanciare negli anelli per segnare punti
    /// (Equivalente della Quaffle)
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public class ScoreOrb : MonoBehaviour
    {
        [Header("Properties")]
        [SerializeField] private float mass = 1f;
        [SerializeField] private float drag = 0.5f;
        [SerializeField] private float angularDrag = 0.5f;

        [Header("Respawn")]
        [SerializeField] private Vector3 respawnPosition = Vector3.zero;
        [SerializeField] private float respawnDelay = 2f;
        [SerializeField] private float outOfBoundsY = -10f;

        [Header("Visual")]
        [SerializeField] private Material teamBlueMaterial;
        [SerializeField] private Material teamRedMaterial;
        [SerializeField] private MeshRenderer meshRenderer;
        [SerializeField] private GameObject trailEffect;

        [Header("Audio")]
        [SerializeField] private AudioSource audioSource;
        [SerializeField] private AudioClip pickupSound;
        [SerializeField] private AudioClip throwSound;
        [SerializeField] private AudioClip bounceSound;

        private Rigidbody rb;
        private Team currentTeam = Team.Blue;
        private bool isHeld;
        private Transform holder;
        private Vector3 initialPosition;

        private void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.mass = mass;
            rb.drag = drag;
            rb.angularDrag = angularDrag;

            initialPosition = transform.position;

            if (audioSource == null)
            {
                audioSource = gameObject.AddComponent<AudioSource>();
            }
            audioSource.spatialBlend = 1f;
        }

        private void Start()
        {
            UpdateTeamColor();
        }

        private void Update()
        {
            // Check out of bounds
            if (transform.position.y < outOfBoundsY && !isHeld)
            {
                Respawn();
            }

            // Segui il holder se tenuto
            if (isHeld && holder != null)
            {
                transform.position = holder.position + holder.forward * 2f;
                rb.velocity = Vector3.zero;
                rb.angularVelocity = Vector3.zero;
            }
        }

        #region Pickup/Throw

        /// <summary>
        /// Viene raccolto da un giocatore
        /// </summary>
        public void Pickup(Transform newHolder, Team team)
        {
            isHeld = true;
            holder = newHolder;
            currentTeam = team;

            rb.isKinematic = true;
            rb.velocity = Vector3.zero;

            UpdateTeamColor();

            if (pickupSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(pickupSound);
            }

            if (trailEffect != null)
            {
                trailEffect.SetActive(false);
            }
        }

        /// <summary>
        /// Viene lanciato
        /// </summary>
        public void Throw(Vector3 direction, float force)
        {
            isHeld = false;
            holder = null;

            rb.isKinematic = false;
            rb.AddForce(direction * force, ForceMode.Impulse);

            if (throwSound != null && audioSource != null)
            {
                audioSource.PlayOneShot(throwSound);
            }

            if (trailEffect != null)
            {
                trailEffect.SetActive(true);
            }
        }

        /// <summary>
        /// Rilasciato (drop)
        /// </summary>
        public void Drop()
        {
            isHeld = false;
            holder = null;

            rb.isKinematic = false;
            rb.velocity = Vector3.down * 2f;

            if (trailEffect != null)
            {
                trailEffect.SetActive(false);
            }
        }

        #endregion

        #region Respawn

        /// <summary>
        /// Respawn al centro del campo
        /// </summary>
        private void Respawn()
        {
            Invoke(nameof(DoRespawn), respawnDelay);
            gameObject.SetActive(false);
        }

        private void DoRespawn()
        {
            transform.position = respawnPosition != Vector3.zero ? respawnPosition : initialPosition;
            rb.velocity = Vector3.zero;
            rb.angularVelocity = Vector3.zero;
            isHeld = false;
            holder = null;
            gameObject.SetActive(true);

            currentTeam = Team.Blue; // Reset al team blu
            UpdateTeamColor();
        }

        #endregion

        #region Visual

        /// <summary>
        /// Aggiorna il colore in base al team
        /// </summary>
        private void UpdateTeamColor()
        {
            if (meshRenderer == null) return;

            Material teamMaterial = currentTeam == Team.Blue ? teamBlueMaterial : teamRedMaterial;
            if (teamMaterial != null)
            {
                meshRenderer.material = teamMaterial;
            }
        }

        #endregion

        #region Collision

        private void OnCollisionEnter(Collision collision)
        {
            // Play bounce sound
            if (bounceSound != null && audioSource != null && !isHeld)
            {
                float impactForce = collision.relativeVelocity.magnitude;
                if (impactForce > 2f)
                {
                    audioSource.PlayOneShot(bounceSound, Mathf.Clamp01(impactForce / 10f));
                }
            }

            // Check se entra in un goal ring
            var goalRing = collision.gameObject.GetComponent<Player.GoalRing>();
            if (goalRing != null && !isHeld)
            {
                OnGoalScored(goalRing);
            }
        }

        /// <summary>
        /// Goal segnato
        /// </summary>
        private void OnGoalScored(Player.GoalRing goalRing)
        {
            // Il goal vale solo se lanciato contro il team avversario
            if (goalRing.team != currentTeam)
            {
                Debug.Log($"GOAL! Team {currentTeam} segna!");

                // Aggiungi punti
                int points = 10 * goalRing.ringHeight; // Anelli più alti valgono di più
                GameManager.Instance.AddScore(currentTeam, points);

                // Respawn
                Respawn();
            }
        }

        #endregion

        #region Getters/Setters

        public bool IsHeld() => isHeld;
        public Transform GetHolder() => holder;
        public Team GetTeam() => currentTeam;
        public void SetTeam(Team team)
        {
            currentTeam = team;
            UpdateTeamColor();
        }

        #endregion
    }
}
