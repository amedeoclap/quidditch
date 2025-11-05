using UnityEngine;
using UnityEngine.Events;
using SkySpheres.Core;

namespace SkySpheres.Player
{
    /// <summary>
    /// Seeker Controller - Cerca e cattura il Radiant Globe
    /// Focus su velocità e agilità
    /// </summary>
    public class SeekerController : PlayerController
    {
        [Header("Seeker Specific")]
        [SerializeField] private float captureRange = 3f;
        [SerializeField] private float globalDetectionRange = 50f;
        [SerializeField] private float speedBonus = 5f;
        [SerializeField] private LayerMask radiantGlobeLayer;

        [Header("Visual Feedback")]
        [SerializeField] private GameObject captureEffectPrefab;
        [SerializeField] private LineRenderer trajectoryLine;

        // Events
        public UnityEvent<Transform> OnGlobeDetected;
        public UnityEvent OnGlobeCaptured;

        private Transform currentGlobe;
        private bool isTrackingGlobe;
        private float captureProgress;

        protected override void InitializeRole()
        {
            // Seeker ha bonus di velocità
            maxSpeed += speedBonus;
            turnSpeed += 50f;

            Debug.Log("Seeker inizializzato - Focus: Velocità e Cattura");
        }

        protected override void Update()
        {
            base.Update();

            DetectRadiantGlobe();

            if (isTrackingGlobe && currentGlobe != null)
            {
                UpdateTrajectoryLine();
            }
        }

        /// <summary>
        /// Rileva il Radiant Globe nelle vicinanze
        /// </summary>
        private void DetectRadiantGlobe()
        {
            Collider[] globes = Physics.OverlapSphere(
                transform.position,
                globalDetectionRange,
                radiantGlobeLayer
            );

            if (globes.Length > 0 && currentGlobe == null)
            {
                currentGlobe = globes[0].transform;
                isTrackingGlobe = true;
                OnGlobeDetected?.Invoke(currentGlobe);
                Debug.Log("Radiant Globe rilevato!");
            }
        }

        /// <summary>
        /// Azione specifica: Tentativo di cattura
        /// </summary>
        public override void PerformRoleAction()
        {
            if (currentGlobe == null) return;

            float distance = Vector3.Distance(transform.position, currentGlobe.position);

            if (distance <= captureRange)
            {
                AttemptCapture();
            }
            else
            {
                Debug.Log($"Troppo lontano! Distanza: {distance:F1}m");
            }
        }

        /// <summary>
        /// Tenta di catturare il Globe
        /// </summary>
        private void AttemptCapture()
        {
            // Sistema di cattura progressivo
            captureProgress += Time.deltaTime * 2f;

            if (captureProgress >= 1f)
            {
                CaptureGlobe();
            }
        }

        /// <summary>
        /// Cattura il Radiant Globe
        /// </summary>
        private void CaptureGlobe()
        {
            Debug.Log("RADIANT GLOBE CATTURATO!");

            // Effetto visivo
            if (captureEffectPrefab != null && currentGlobe != null)
            {
                Instantiate(captureEffectPrefab, currentGlobe.position, Quaternion.identity);
            }

            // Notifica GameManager
            Team playerTeam = GameManager.Instance.GetPlayerTeam();
            GameManager.Instance.OnRadiantGlobeCaptured(playerTeam);

            // Event
            OnGlobeCaptured?.Invoke();

            // Distruggi il globe
            if (currentGlobe != null)
            {
                Destroy(currentGlobe.gameObject);
            }

            currentGlobe = null;
            isTrackingGlobe = false;
            captureProgress = 0f;
        }

        /// <summary>
        /// Aggiorna la linea che mostra la traiettoria verso il Globe
        /// </summary>
        private void UpdateTrajectoryLine()
        {
            if (trajectoryLine != null && currentGlobe != null)
            {
                trajectoryLine.enabled = true;
                trajectoryLine.SetPosition(0, transform.position);
                trajectoryLine.SetPosition(1, currentGlobe.position);
            }
        }

        /// <summary>
        /// Abilità speciale: Dash veloce verso il Globe
        /// </summary>
        public void QuickDash()
        {
            if (stamina < 30f || currentGlobe == null) return;

            Vector3 direction = (currentGlobe.position - transform.position).normalized;
            rb.AddForce(direction * maxSpeed * 10f, ForceMode.Impulse);
            stamina -= 30f;

            Debug.Log("Quick Dash!");
        }

        private void OnDrawGizmosSelected()
        {
            // Visualizza range di cattura
            Gizmos.color = Color.green;
            Gizmos.DrawWireSphere(transform.position, captureRange);

            // Visualizza range di detection
            Gizmos.color = Color.yellow;
            Gizmos.DrawWireSphere(transform.position, globalDetectionRange);
        }

        public Transform GetCurrentGlobe() => currentGlobe;
        public float GetCaptureProgress() => captureProgress;
    }
}
