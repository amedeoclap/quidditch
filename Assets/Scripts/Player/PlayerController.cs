using UnityEngine;
using SkySpheres.Core;

namespace SkySpheres.Player
{
    /// <summary>
    /// Controller base per il giocatore - gestisce movimento e volo
    /// Classe astratta che viene estesa dai controller specifici per ruolo
    /// </summary>
    [RequireComponent(typeof(Rigidbody))]
    public abstract class PlayerController : MonoBehaviour
    {
        [Header("Movement Settings")]
        [SerializeField] protected float baseSpeed = 10f;
        [SerializeField] protected float maxSpeed = 20f;
        [SerializeField] protected float acceleration = 5f;
        [SerializeField] protected float turnSpeed = 200f;
        [SerializeField] protected float boostMultiplier = 2f;

        [Header("Flight Settings")]
        [SerializeField] protected float verticalSpeed = 8f;
        [SerializeField] protected float maxAltitude = 50f;
        [SerializeField] protected float minAltitude = 2f;

        [Header("Stats")]
        [SerializeField] protected int level = 1;
        [SerializeField] protected float stamina = 100f;
        [SerializeField] protected float maxStamina = 100f;
        [SerializeField] protected float staminaRegenRate = 10f;

        // Components
        protected Rigidbody rb;
        protected Transform cameraTransform;

        // State
        protected Vector3 moveDirection;
        protected float currentSpeed;
        protected bool isBoosting;
        protected PlayerRole playerRole;

        // Input
        protected Vector2 touchInput;
        protected bool actionPressed;
        protected bool boostPressed;

        protected virtual void Awake()
        {
            rb = GetComponent<Rigidbody>();
            rb.useGravity = false; // Volo magico, no gravità
            rb.drag = 2f;
        }

        protected virtual void Start()
        {
            // Ottieni il ruolo dal GameManager
            playerRole = GameManager.Instance.GetPlayerRole();
            InitializeRole();

            // Setup camera
            if (Camera.main != null)
            {
                cameraTransform = Camera.main.transform;
            }
        }

        protected virtual void Update()
        {
            HandleStamina();
        }

        protected virtual void FixedUpdate()
        {
            HandleMovement();
            HandleFlight();
        }

        /// <summary>
        /// Inizializza impostazioni specifiche del ruolo
        /// </summary>
        protected abstract void InitializeRole();

        /// <summary>
        /// Azione specifica del ruolo (lanciare, colpire, catturare, etc.)
        /// </summary>
        public abstract void PerformRoleAction();

        #region Movement

        /// <summary>
        /// Gestisce il movimento del giocatore
        /// </summary>
        protected virtual void HandleMovement()
        {
            // Calcola velocità target
            float targetSpeed = isBoosting && stamina > 0 ? maxSpeed * boostMultiplier : maxSpeed;
            currentSpeed = Mathf.Lerp(currentSpeed, targetSpeed, acceleration * Time.fixedDeltaTime);

            // Applica movimento
            if (moveDirection.magnitude > 0.1f)
            {
                Vector3 movement = moveDirection.normalized * currentSpeed;
                rb.velocity = new Vector3(movement.x, rb.velocity.y, movement.z);

                // Rotazione verso la direzione di movimento
                Quaternion targetRotation = Quaternion.LookRotation(moveDirection);
                transform.rotation = Quaternion.RotateTowards(
                    transform.rotation,
                    targetRotation,
                    turnSpeed * Time.fixedDeltaTime
                );
            }
        }

        /// <summary>
        /// Gestisce il volo verticale
        /// </summary>
        protected virtual void HandleFlight()
        {
            float verticalMovement = moveDirection.y * verticalSpeed;

            // Limita altitudine
            float currentAltitude = transform.position.y;
            if (currentAltitude >= maxAltitude && verticalMovement > 0)
            {
                verticalMovement = 0;
            }
            else if (currentAltitude <= minAltitude && verticalMovement < 0)
            {
                verticalMovement = 0;
            }

            rb.velocity = new Vector3(rb.velocity.x, verticalMovement, rb.velocity.z);
        }

        /// <summary>
        /// Gestisce la stamina
        /// </summary>
        protected virtual void HandleStamina()
        {
            if (isBoosting && stamina > 0)
            {
                stamina -= 20f * Time.deltaTime;
                if (stamina < 0) stamina = 0;
            }
            else if (!isBoosting && stamina < maxStamina)
            {
                stamina += staminaRegenRate * Time.deltaTime;
                if (stamina > maxStamina) stamina = maxStamina;
            }
        }

        #endregion

        #region Input Methods

        /// <summary>
        /// Imposta la direzione di movimento (chiamato dal touch controller)
        /// </summary>
        public virtual void SetMoveDirection(Vector3 direction)
        {
            moveDirection = direction;
        }

        /// <summary>
        /// Attiva/disattiva il boost
        /// </summary>
        public virtual void SetBoosting(bool boosting)
        {
            isBoosting = boosting;
        }

        /// <summary>
        /// Trigger per l'azione del ruolo
        /// </summary>
        public virtual void TriggerAction()
        {
            actionPressed = true;
            PerformRoleAction();
        }

        #endregion

        #region Stats & Upgrades

        /// <summary>
        /// Aumenta il livello del giocatore
        /// </summary>
        public virtual void LevelUp()
        {
            level++;
            maxSpeed += 1f;
            maxStamina += 10f;
            stamina = maxStamina;
        }

        /// <summary>
        /// Upgrade skill specifiche
        /// </summary>
        public virtual void UpgradeSkill(string skillName, float amount)
        {
            switch (skillName)
            {
                case "speed":
                    maxSpeed += amount;
                    break;
                case "stamina":
                    maxStamina += amount;
                    break;
                case "agility":
                    turnSpeed += amount;
                    break;
            }
        }

        #endregion

        #region Getters

        public float GetStamina() => stamina;
        public float GetMaxStamina() => maxStamina;
        public int GetLevel() => level;
        public PlayerRole GetRole() => playerRole;
        public float GetCurrentSpeed() => currentSpeed;

        #endregion
    }
}
