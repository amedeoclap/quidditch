using UnityEngine;

namespace SkySpheres.Utils
{
    /// <summary>
    /// Camera Follow - Camera che segue il giocatore con smoothing
    /// </summary>
    public class CameraFollow : MonoBehaviour
    {
        [Header("Target")]
        [SerializeField] private Transform target;
        [SerializeField] private bool findPlayerAutomatically = true;

        [Header("Follow Settings")]
        [SerializeField] private Vector3 offset = new Vector3(0f, 5f, -10f);
        [SerializeField] private float smoothSpeed = 10f;
        [SerializeField] private bool useFixedUpdate = true;

        [Header("Rotation")]
        [SerializeField] private bool lookAtTarget = true;
        [SerializeField] private Vector3 lookAtOffset = Vector3.up * 2f;
        [SerializeField] private float rotationSpeed = 5f;

        [Header("Boundaries")]
        [SerializeField] private bool useBoundaries = false;
        [SerializeField] private Vector3 minBounds = new Vector3(-50f, 2f, -50f);
        [SerializeField] private Vector3 maxBounds = new Vector3(50f, 30f, 50f);

        [Header("Zoom")]
        [SerializeField] private bool enableZoom = false;
        [SerializeField] private float minZoom = 5f;
        [SerializeField] private float maxZoom = 15f;
        [SerializeField] private float zoomSpeed = 2f;
        private float currentZoom;

        private Vector3 currentVelocity;

        private void Start()
        {
            if (findPlayerAutomatically && target == null)
            {
                GameObject player = GameObject.FindGameObjectWithTag("Player");
                if (player != null)
                {
                    target = player.transform;
                }
            }

            currentZoom = offset.magnitude;
        }

        private void Update()
        {
            if (!useFixedUpdate && target != null)
            {
                FollowTarget();
            }

            if (enableZoom)
            {
                HandleZoom();
            }
        }

        private void FixedUpdate()
        {
            if (useFixedUpdate && target != null)
            {
                FollowTarget();
            }
        }

        private void LateUpdate()
        {
            if (lookAtTarget && target != null)
            {
                LookAtTargetSmooth();
            }
        }

        /// <summary>
        /// Segue il target con smoothing
        /// </summary>
        private void FollowTarget()
        {
            Vector3 desiredPosition = target.position + offset;

            // Smooth follow
            Vector3 smoothedPosition = Vector3.SmoothDamp(
                transform.position,
                desiredPosition,
                ref currentVelocity,
                1f / smoothSpeed
            );

            // Apply boundaries
            if (useBoundaries)
            {
                smoothedPosition.x = Mathf.Clamp(smoothedPosition.x, minBounds.x, maxBounds.x);
                smoothedPosition.y = Mathf.Clamp(smoothedPosition.y, minBounds.y, maxBounds.y);
                smoothedPosition.z = Mathf.Clamp(smoothedPosition.z, minBounds.z, maxBounds.z);
            }

            transform.position = smoothedPosition;
        }

        /// <summary>
        /// Guarda verso il target con smoothing
        /// </summary>
        private void LookAtTargetSmooth()
        {
            Vector3 lookPosition = target.position + lookAtOffset;
            Quaternion targetRotation = Quaternion.LookRotation(lookPosition - transform.position);

            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                targetRotation,
                rotationSpeed * Time.deltaTime
            );
        }

        /// <summary>
        /// Gestisce lo zoom
        /// </summary>
        private void HandleZoom()
        {
            // Qui si potrebbe implementare zoom touch
            // Per ora è un placeholder

            // Aggiorna offset basato su zoom
            offset = offset.normalized * currentZoom;
        }

        /// <summary>
        /// Imposta il target
        /// </summary>
        public void SetTarget(Transform newTarget)
        {
            target = newTarget;
        }

        /// <summary>
        /// Imposta l'offset
        /// </summary>
        public void SetOffset(Vector3 newOffset)
        {
            offset = newOffset;
        }

        /// <summary>
        /// Zoom in/out
        /// </summary>
        public void Zoom(float amount)
        {
            currentZoom = Mathf.Clamp(currentZoom + amount, minZoom, maxZoom);
        }

        private void OnDrawGizmosSelected()
        {
            if (useBoundaries)
            {
                Gizmos.color = Color.yellow;
                Vector3 center = (minBounds + maxBounds) * 0.5f;
                Vector3 size = maxBounds - minBounds;
                Gizmos.DrawWireCube(center, size);
            }

            if (target != null)
            {
                Gizmos.color = Color.green;
                Gizmos.DrawLine(transform.position, target.position);
            }
        }
    }
}
