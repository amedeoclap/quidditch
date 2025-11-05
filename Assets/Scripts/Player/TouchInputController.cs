using UnityEngine;
using UnityEngine.Events;
using UnityEngine.EventSystems;

namespace SkySpheres.Player
{
    /// <summary>
    /// Touch Input Controller - Gestisce tutti gli input touch per mobile
    /// Supporta swipe, tap, hold, pinch e gestures avanzate
    /// </summary>
    public class TouchInputController : MonoBehaviour
    {
        [Header("References")]
        [SerializeField] private PlayerController playerController;

        [Header("Movement Settings")]
        [SerializeField] private float swipeSensitivity = 0.5f;
        [SerializeField] private float verticalSwipeSensitivity = 0.3f;
        [SerializeField] private bool invertVertical = false;

        [Header("Tap Settings")]
        [SerializeField] private float tapThreshold = 0.3f; // Tempo massimo per tap
        [SerializeField] private float doubleTapWindow = 0.3f;
        [SerializeField] private float tapMoveThreshold = 50f; // Pixel

        [Header("Hold Settings")]
        [SerializeField] private float holdThreshold = 0.5f;

        [Header("UI Exclusion")]
        [SerializeField] private float uiTopZone = 200f; // Pixel dall'alto
        [SerializeField] private float uiBottomZone = 150f; // Pixel dal basso

        // Events
        public UnityEvent OnSingleTap;
        public UnityEvent OnDoubleTap;
        public UnityEvent OnHoldStart;
        public UnityEvent OnHoldEnd;
        public UnityEvent OnSwipeUp;
        public UnityEvent OnSwipeDown;
        public UnityEvent OnSwipeLeft;
        public UnityEvent OnSwipeRight;
        public UnityEvent<Vector2> OnDrag;

        // Touch tracking
        private Vector2 touchStartPos;
        private Vector2 touchCurrentPos;
        private float touchStartTime;
        private float lastTapTime;
        private bool isTouching;
        private bool isHolding;
        private bool isDragging;
        private int tapCount;

        // Movement
        private Vector3 moveDirection;
        private bool isBoosting;

        // Platform detection
        private bool isMobile;

        private void Start()
        {
            // Auto-find player controller if not assigned
            if (playerController == null)
            {
                playerController = FindObjectOfType<PlayerController>();
            }

            // Detect platform
            isMobile = Application.isMobilePlatform;

#if UNITY_EDITOR
            isMobile = true; // Simula mobile in editor
#endif
        }

        private void Update()
        {
            if (isMobile)
            {
                HandleTouchInput();
            }
            else
            {
                HandleKeyboardInput(); // Fallback per testing
            }

            // Aggiorna il player controller
            if (playerController != null)
            {
                playerController.SetMoveDirection(moveDirection);
                playerController.SetBoosting(isBoosting);
            }
        }

        #region Touch Input

        /// <summary>
        /// Gestisce l'input touch
        /// </summary>
        private void HandleTouchInput()
        {
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);

                // Ignora touch su UI
                if (IsTouchOverUI(touch.position))
                {
                    return;
                }

                switch (touch.phase)
                {
                    case TouchPhase.Began:
                        OnTouchBegan(touch.position);
                        break;

                    case TouchPhase.Moved:
                        OnTouchMoved(touch.position);
                        break;

                    case TouchPhase.Stationary:
                        OnTouchStationary(touch.position);
                        break;

                    case TouchPhase.Ended:
                        OnTouchEnded(touch.position);
                        break;

                    case TouchPhase.Canceled:
                        OnTouchCanceled();
                        break;
                }

                // Multi-touch per azioni speciali
                if (Input.touchCount == 2)
                {
                    HandleMultiTouch();
                }
            }
            else
            {
                // Nessun touch attivo
                ResetMovement();
            }
        }

        /// <summary>
        /// Touch iniziato
        /// </summary>
        private void OnTouchBegan(Vector2 position)
        {
            touchStartPos = position;
            touchCurrentPos = position;
            touchStartTime = Time.time;
            isTouching = true;
            isDragging = false;
        }

        /// <summary>
        /// Touch in movimento
        /// </summary>
        private void OnTouchMoved(Vector2 position)
        {
            touchCurrentPos = position;
            Vector2 delta = position - touchStartPos;

            // Inizia dragging se si muove oltre la soglia
            if (!isDragging && delta.magnitude > tapMoveThreshold)
            {
                isDragging = true;
            }

            if (isDragging)
            {
                HandleSwipeMovement(delta);
                OnDrag?.Invoke(delta);
            }
        }

        /// <summary>
        /// Touch fermo (hold)
        /// </summary>
        private void OnTouchStationary(Vector2 position)
        {
            float holdTime = Time.time - touchStartTime;

            if (holdTime >= holdThreshold && !isHolding)
            {
                isHolding = true;
                OnHoldStart?.Invoke();
                StartHoldAction();
            }
        }

        /// <summary>
        /// Touch terminato
        /// </summary>
        private void OnTouchEnded(Vector2 position)
        {
            float touchDuration = Time.time - touchStartTime;
            Vector2 delta = position - touchStartPos;

            // Determina il tipo di gesture
            if (isHolding)
            {
                OnHoldEnd?.Invoke();
                EndHoldAction();
            }
            else if (!isDragging && touchDuration < tapThreshold)
            {
                HandleTap(position);
            }
            else if (isDragging)
            {
                HandleSwipeGesture(delta);
            }

            ResetTouch();
        }

        /// <summary>
        /// Touch cancellato
        /// </summary>
        private void OnTouchCanceled()
        {
            ResetTouch();
            ResetMovement();
        }

        /// <summary>
        /// Gestisce il tap
        /// </summary>
        private void HandleTap(Vector2 position)
        {
            float timeSinceLastTap = Time.time - lastTapTime;

            if (timeSinceLastTap < doubleTapWindow)
            {
                // Double tap
                tapCount = 0;
                OnDoubleTap?.Invoke();
                PerformDoubleTapAction();
            }
            else
            {
                // Single tap
                tapCount = 1;
                OnSingleTap?.Invoke();
                PerformTapAction();
            }

            lastTapTime = Time.time;
        }

        /// <summary>
        /// Gestisce il movimento da swipe
        /// </summary>
        private void HandleSwipeMovement(Vector2 delta)
        {
            // Converti delta in direzione di movimento
            float horizontal = delta.x * swipeSensitivity * Time.deltaTime;
            float vertical = delta.y * verticalSwipeSensitivity * Time.deltaTime;

            if (invertVertical)
            {
                vertical = -vertical;
            }

            // Calcola direzione basata sulla camera
            Camera cam = Camera.main;
            if (cam != null)
            {
                Vector3 forward = cam.transform.forward;
                Vector3 right = cam.transform.right;
                forward.y = 0;
                right.y = 0;
                forward.Normalize();
                right.Normalize();

                moveDirection = (forward * delta.y + right * delta.x).normalized;
                moveDirection.y = vertical;
            }
            else
            {
                moveDirection = new Vector3(horizontal, vertical, delta.y * swipeSensitivity * Time.deltaTime);
            }
        }

        /// <summary>
        /// Gestisce gesture di swipe completo
        /// </summary>
        private void HandleSwipeGesture(Vector2 delta)
        {
            float absX = Mathf.Abs(delta.x);
            float absY = Mathf.Abs(delta.y);

            if (absX > absY)
            {
                // Swipe orizzontale
                if (delta.x > 0)
                {
                    OnSwipeRight?.Invoke();
                }
                else
                {
                    OnSwipeLeft?.Invoke();
                }
            }
            else
            {
                // Swipe verticale
                if (delta.y > 0)
                {
                    OnSwipeUp?.Invoke();
                }
                else
                {
                    OnSwipeDown?.Invoke();
                }
            }
        }

        /// <summary>
        /// Gestisce multi-touch (es. pinch per boost)
        /// </summary>
        private void HandleMultiTouch()
        {
            Touch touch1 = Input.GetTouch(0);
            Touch touch2 = Input.GetTouch(1);

            // Calcola distanza per pinch
            Vector2 touch1Prev = touch1.position - touch1.deltaPosition;
            Vector2 touch2Prev = touch2.position - touch2.deltaPosition;

            float prevDistance = (touch1Prev - touch2Prev).magnitude;
            float currentDistance = (touch1.position - touch2.position).magnitude;

            float delta = currentDistance - prevDistance;

            // Pinch out = boost
            if (delta > 5f)
            {
                isBoosting = true;
            }
        }

        #endregion

        #region Actions

        /// <summary>
        /// Azione del tap singolo
        /// </summary>
        private void PerformTapAction()
        {
            if (playerController != null)
            {
                playerController.TriggerAction();
            }
        }

        /// <summary>
        /// Azione del doppio tap
        /// </summary>
        private void PerformDoubleTapAction()
        {
            // Doppio tap = manovra evasiva
            Debug.Log("Manovra evasiva!");
            // Qui si implementerebbe una barrel roll o simile
        }

        /// <summary>
        /// Inizia hold action
        /// </summary>
        private void StartHoldAction()
        {
            // Hold = boost
            isBoosting = true;
            Debug.Log("Boost attivato!");
        }

        /// <summary>
        /// Termina hold action
        /// </summary>
        private void EndHoldAction()
        {
            isBoosting = false;
            isHolding = false;
            Debug.Log("Boost disattivato!");
        }

        #endregion

        #region Keyboard Fallback (Testing)

        /// <summary>
        /// Input da tastiera per testing in editor
        /// </summary>
        private void HandleKeyboardInput()
        {
            float horizontal = Input.GetAxis("Horizontal");
            float vertical = Input.GetAxis("Vertical");
            float verticalFlight = 0f;

            if (Input.GetKey(KeyCode.Space))
            {
                verticalFlight = 1f;
            }
            else if (Input.GetKey(KeyCode.LeftControl))
            {
                verticalFlight = -1f;
            }

            moveDirection = new Vector3(horizontal, verticalFlight, vertical);

            // Boost
            isBoosting = Input.GetKey(KeyCode.LeftShift);

            // Azione
            if (Input.GetKeyDown(KeyCode.E) || Input.GetMouseButtonDown(0))
            {
                PerformTapAction();
            }
        }

        #endregion

        #region Utility

        /// <summary>
        /// Verifica se il touch è sopra un elemento UI
        /// </summary>
        private bool IsTouchOverUI(Vector2 position)
        {
            // Zone UI fisse
            if (position.y > Screen.height - uiTopZone || position.y < uiBottomZone)
            {
                return true;
            }

            // EventSystem check
            if (EventSystem.current != null)
            {
                return EventSystem.current.IsPointerOverGameObject();
            }

            return false;
        }

        /// <summary>
        /// Reset dello stato del touch
        /// </summary>
        private void ResetTouch()
        {
            isTouching = false;
            isDragging = false;
            isHolding = false;
        }

        /// <summary>
        /// Reset del movimento
        /// </summary>
        private void ResetMovement()
        {
            moveDirection = Vector3.zero;
            isBoosting = false;
        }

        #endregion

        #region Public Methods

        /// <summary>
        /// Abilita/disabilita l'input
        /// </summary>
        public void SetInputEnabled(bool enabled)
        {
            this.enabled = enabled;
            if (!enabled)
            {
                ResetTouch();
                ResetMovement();
            }
        }

        /// <summary>
        /// Imposta la sensibilità
        /// </summary>
        public void SetSensitivity(float sensitivity)
        {
            swipeSensitivity = sensitivity;
        }

        /// <summary>
        /// Inverte controlli verticali
        /// </summary>
        public void SetInvertVertical(bool invert)
        {
            invertVertical = invert;
        }

        #endregion

        // Visualizza zone UI in editor
        private void OnGUI()
        {
#if UNITY_EDITOR
            if (Application.isEditor)
            {
                // Top zone
                GUI.Box(new Rect(0, 0, Screen.width, uiTopZone), "UI Zone");
                // Bottom zone
                GUI.Box(new Rect(0, Screen.height - uiBottomZone, Screen.width, uiBottomZone), "UI Zone");
            }
#endif
        }
    }
}
