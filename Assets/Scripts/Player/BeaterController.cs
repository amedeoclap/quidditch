using UnityEngine;
using UnityEngine.Events;
using SkySpheres.Core;

namespace SkySpheres.Player
{
    /// <summary>
    /// Beater Controller - Colpisce Strike Spheres per proteggere i compagni
    /// Focus su timing e riflessi
    /// </summary>
    public class BeaterController : PlayerController
    {
        [Header("Beater Specific")]
        [SerializeField] private float hitRange = 8f;
        [SerializeField] private float hitForce = 30f;
        [SerializeField] private float hitCooldown = 1.5f;
        [SerializeField] private LayerMask strikeSphereLayer;
        [SerializeField] private LayerMask enemyLayer;

        [Header("Equipment")]
        [SerializeField] private Transform batTransform;
        [SerializeField] private GameObject hitEffectPrefab;
        [SerializeField] private GameObject chargeEffectPrefab;

        [Header("Combat")]
        [SerializeField] private float perfectHitWindow = 0.3f;
        [SerializeField] private float chargeTimeMax = 2f;

        // Events
        public UnityEvent<Transform> OnStrikeSphereHit;
        public UnityEvent<bool> OnPerfectHit; // true = perfect, false = normal
        public UnityEvent OnBatSwing;

        private float lastHitTime;
        private float chargeTime;
        private bool isCharging;
        private int consecutiveHits;

        protected override void InitializeRole()
        {
            // Beater ha bonus di forza
            Debug.Log("Beater inizializzato - Focus: Colpi e Difesa");
        }

        protected override void Update()
        {
            base.Update();

            HandleCharging();
            DetectIncomingThreats();
        }

        /// <summary>
        /// Gestisce la carica del colpo
        /// </summary>
        private void HandleCharging()
        {
            if (isCharging)
            {
                chargeTime += Time.deltaTime;
                if (chargeTime > chargeTimeMax)
                {
                    chargeTime = chargeTimeMax;
                }

                // Effetto visivo di carica
                if (chargeEffectPrefab != null && chargeTime > 0.5f)
                {
                    // Mostra effetto
                }
            }
        }

        /// <summary>
        /// Rileva Strike Spheres pericolose in arrivo
        /// </summary>
        private void DetectIncomingThreats()
        {
            Collider[] threats = Physics.OverlapSphere(
                transform.position,
                hitRange * 1.5f,
                strikeSphereLayer
            );

            foreach (Collider threat in threats)
            {
                Rigidbody sphereRb = threat.GetComponent<Rigidbody>();
                if (sphereRb != null)
                {
                    // Calcola se la sfera si sta avvicinando
                    Vector3 direction = (transform.position - threat.transform.position).normalized;
                    float dotProduct = Vector3.Dot(sphereRb.velocity.normalized, direction);

                    if (dotProduct > 0.5f) // Si sta avvicinando
                    {
                        // Visual warning
                        Debug.Log("ATTENZIONE: Strike Sphere in arrivo!");
                    }
                }
            }
        }

        /// <summary>
        /// Azione specifica: Colpisce Strike Sphere o nemico
        /// </summary>
        public override void PerformRoleAction()
        {
            if (Time.time - lastHitTime < hitCooldown) return;

            SwingBat();

            // Cerca Strike Spheres nel range
            Collider[] spheres = Physics.OverlapSphere(
                batTransform != null ? batTransform.position : transform.position,
                hitRange,
                strikeSphereLayer
            );

            if (spheres.Length > 0)
            {
                HitStrikeSphere(spheres[0].transform);
            }
            else
            {
                // Cerca nemici
                Collider[] enemies = Physics.OverlapSphere(
                    batTransform != null ? batTransform.position : transform.position,
                    hitRange,
                    enemyLayer
                );

                if (enemies.Length > 0)
                {
                    HitEnemy(enemies[0].transform);
                }
            }

            lastHitTime = Time.time;
        }

        /// <summary>
        /// Animazione swing della mazza
        /// </summary>
        private void SwingBat()
        {
            OnBatSwing?.Invoke();

            // Qui si attiverebbe l'animazione della mazza
            if (batTransform != null)
            {
                // Rotazione rapida della mazza
                StartCoroutine(AnimateBatSwing());
            }
        }

        private System.Collections.IEnumerator AnimateBatSwing()
        {
            float duration = 0.3f;
            float elapsed = 0f;
            Quaternion startRot = batTransform.localRotation;
            Quaternion targetRot = startRot * Quaternion.Euler(0, 0, -120f);

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                batTransform.localRotation = Quaternion.Lerp(startRot, targetRot, t);
                yield return null;
            }

            // Ritorna alla posizione iniziale
            elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                batTransform.localRotation = Quaternion.Lerp(targetRot, startRot, t);
                yield return null;
            }
        }

        /// <summary>
        /// Colpisce una Strike Sphere
        /// </summary>
        private void HitStrikeSphere(Transform sphere)
        {
            bool isPerfectHit = chargeTime >= chargeTimeMax;

            // Calcola direzione e forza
            Vector3 hitDirection = (sphere.position - transform.position).normalized;
            float finalForce = hitForce * (1f + chargeTime / chargeTimeMax);

            Rigidbody sphereRb = sphere.GetComponent<Rigidbody>();
            if (sphereRb != null)
            {
                sphereRb.velocity = Vector3.zero;
                sphereRb.AddForce(hitDirection * finalForce, ForceMode.Impulse);
            }

            // Effetti
            if (hitEffectPrefab != null)
            {
                Instantiate(hitEffectPrefab, sphere.position, Quaternion.identity);
            }

            // Combo
            consecutiveHits++;
            if (consecutiveHits >= 3)
            {
                Debug.Log($"COMBO x{consecutiveHits}!");
            }

            OnStrikeSphereHit?.Invoke(sphere);
            OnPerfectHit?.Invoke(isPerfectHit);

            Debug.Log(isPerfectHit ? "COLPO PERFETTO!" : "Colpo riuscito!");
            ResetCharge();
        }

        /// <summary>
        /// Colpisce un nemico (stun temporaneo)
        /// </summary>
        private void HitEnemy(Transform enemy)
        {
            Debug.Log($"Colpito nemico: {enemy.name}");

            // Applica knockback
            Rigidbody enemyRb = enemy.GetComponent<Rigidbody>();
            if (enemyRb != null)
            {
                Vector3 knockbackDirection = (enemy.position - transform.position).normalized;
                enemyRb.AddForce(knockbackDirection * hitForce * 0.5f, ForceMode.Impulse);
            }

            // Qui si applicherebbe uno stun all'AI nemica
            // enemy.GetComponent<AIController>()?.ApplyStun(2f);

            if (hitEffectPrefab != null)
            {
                Instantiate(hitEffectPrefab, enemy.position, Quaternion.identity);
            }
        }

        /// <summary>
        /// Inizia a caricare il colpo
        /// </summary>
        public void StartCharging()
        {
            isCharging = true;
            chargeTime = 0f;
        }

        /// <summary>
        /// Rilascia il colpo caricato
        /// </summary>
        public void ReleaseCharge()
        {
            if (isCharging)
            {
                PerformRoleAction();
                ResetCharge();
            }
        }

        private void ResetCharge()
        {
            isCharging = false;
            chargeTime = 0f;
        }

        /// <summary>
        /// Abilità speciale: Colpo rotante ad area
        /// </summary>
        public void SpinAttack()
        {
            if (stamina < 40f) return;

            Collider[] allTargets = Physics.OverlapSphere(
                transform.position,
                hitRange * 1.5f,
                strikeSphereLayer | enemyLayer
            );

            foreach (Collider target in allTargets)
            {
                Vector3 direction = (target.transform.position - transform.position).normalized;
                Rigidbody targetRb = target.GetComponent<Rigidbody>();
                if (targetRb != null)
                {
                    targetRb.AddForce(direction * hitForce * 1.5f, ForceMode.Impulse);
                }
            }

            stamina -= 40f;
            Debug.Log("SPIN ATTACK!");
        }

        private void OnDrawGizmosSelected()
        {
            // Visualizza range di colpo
            Gizmos.color = Color.red;
            Vector3 center = batTransform != null ? batTransform.position : transform.position;
            Gizmos.DrawWireSphere(center, hitRange);
        }

        public float GetChargeProgress() => chargeTime / chargeTimeMax;
        public int GetConsecutiveHits() => consecutiveHits;
        public void ResetCombo() => consecutiveHits = 0;
    }
}
