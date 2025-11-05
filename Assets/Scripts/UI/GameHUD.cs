using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SkySpheres.Core;
using SkySpheres.Player;

namespace SkySpheres.UI
{
    /// <summary>
    /// Game HUD - Interfaccia di gioco durante la partita
    /// </summary>
    public class GameHUD : MonoBehaviour
    {
        [Header("Score Display")]
        [SerializeField] private TextMeshProUGUI blueScoreText;
        [SerializeField] private TextMeshProUGUI redScoreText;
        [SerializeField] private Image blueScoreBar;
        [SerializeField] private Image redScoreBar;

        [Header("Timer")]
        [SerializeField] private TextMeshProUGUI timerText;
        [SerializeField] private Image timerBar;

        [Header("Player Stats")]
        [SerializeField] private Image staminaBar;
        [SerializeField] private TextMeshProUGUI roleText;
        [SerializeField] private Image roleIcon;

        [Header("Action Display")]
        [SerializeField] private TextMeshProUGUI actionText;
        [SerializeField] private Image actionCooldownBar;
        [SerializeField] private GameObject chargeIndicator;
        [SerializeField] private Image chargeBar;

        [Header("Notifications")]
        [SerializeField] private GameObject notificationPanel;
        [SerializeField] private TextMeshProUGUI notificationText;
        [SerializeField] private float notificationDuration = 3f;

        [Header("Mini Map")]
        [SerializeField] private RawImage miniMapCamera;
        [SerializeField] private Transform playerMarker;

        [Header("Controls Hints")]
        [SerializeField] private GameObject controlsPanel;
        [SerializeField] private TextMeshProUGUI controlsHintText;

        [Header("Pause Menu")]
        [SerializeField] private GameObject pausePanel;
        [SerializeField] private Button resumeButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button quitButton;

        private PlayerController playerController;
        private float notificationTimer;
        private int maxScore = 150;

        private void Start()
        {
            // Subscribe to events
            if (GameManager.Instance != null)
            {
                GameManager.Instance.OnScoreChanged.AddListener(UpdateScore);
                GameManager.Instance.OnTimerUpdate.AddListener(UpdateTimer);
                GameManager.Instance.OnPlayerRoleSet.AddListener(UpdateRole);
            }

            // Buttons
            if (resumeButton != null)
                resumeButton.onClick.AddListener(ResumeGame);
            if (settingsButton != null)
                settingsButton.onClick.AddListener(OpenSettings);
            if (quitButton != null)
                quitButton.onClick.AddListener(QuitToMenu);

            // Find player
            playerController = FindObjectOfType<PlayerController>();

            // Hide pause panel
            if (pausePanel != null)
                pausePanel.SetActive(false);

            // Hide notification
            if (notificationPanel != null)
                notificationPanel.SetActive(false);
        }

        private void Update()
        {
            UpdatePlayerStats();
            UpdateActionDisplay();
            UpdateNotificationTimer();
        }

        #region Score & Timer

        /// <summary>
        /// Aggiorna il punteggio
        /// </summary>
        private void UpdateScore(int blueScore, int redScore)
        {
            if (blueScoreText != null)
                blueScoreText.text = blueScore.ToString();

            if (redScoreText != null)
                redScoreText.text = redScore.ToString();

            // Aggiorna barre
            if (blueScoreBar != null)
                blueScoreBar.fillAmount = (float)blueScore / maxScore;

            if (redScoreBar != null)
                redScoreBar.fillAmount = (float)redScore / maxScore;
        }

        /// <summary>
        /// Aggiorna il timer
        /// </summary>
        private void UpdateTimer(float timeRemaining)
        {
            if (timerText != null)
            {
                int minutes = Mathf.FloorToInt(timeRemaining / 60f);
                int seconds = Mathf.FloorToInt(timeRemaining % 60f);
                timerText.text = string.Format("{0:00}:{1:00}", minutes, seconds);

                // Colore rosso quando manca poco tempo
                if (timeRemaining < 30f)
                {
                    timerText.color = Color.red;
                }
                else
                {
                    timerText.color = Color.white;
                }
            }

            if (timerBar != null)
            {
                timerBar.fillAmount = timeRemaining / 300f; // 5 minuti
            }
        }

        #endregion

        #region Player Stats

        /// <summary>
        /// Aggiorna le statistiche del giocatore
        /// </summary>
        private void UpdatePlayerStats()
        {
            if (playerController == null) return;

            // Stamina
            if (staminaBar != null)
            {
                float staminaPercent = playerController.GetStamina() / playerController.GetMaxStamina();
                staminaBar.fillAmount = staminaPercent;

                // Cambia colore in base alla stamina
                if (staminaPercent < 0.3f)
                    staminaBar.color = Color.red;
                else if (staminaPercent < 0.6f)
                    staminaBar.color = Color.yellow;
                else
                    staminaBar.color = Color.green;
            }
        }

        /// <summary>
        /// Aggiorna il ruolo
        /// </summary>
        private void UpdateRole(PlayerRole role)
        {
            if (roleText != null)
            {
                roleText.text = GetRoleName(role);
            }

            // Aggiorna hints dei controlli
            UpdateControlsHints(role);
        }

        /// <summary>
        /// Aggiorna i suggerimenti dei controlli
        /// </summary>
        private void UpdateControlsHints(PlayerRole role)
        {
            if (controlsHintText == null) return;

            string hints = role switch
            {
                PlayerRole.Seeker => "TAP: Cattura | HOLD: Boost | SWIPE: Movimento",
                PlayerRole.Beater => "TAP: Colpisci | HOLD: Carica colpo | SWIPE: Movimento",
                PlayerRole.Chaser => "TAP: Lancia | HOLD: Carica tiro | SWIPE: Mira",
                PlayerRole.Keeper => "TAP: Parata | DOUBLE TAP: Tuffo | SWIPE: Posizionamento",
                _ => "SWIPE: Movimento | TAP: Azione"
            };

            controlsHintText.text = hints;
        }

        #endregion

        #region Action Display

        /// <summary>
        /// Aggiorna il display dell'azione
        /// </summary>
        private void UpdateActionDisplay()
        {
            if (playerController == null) return;

            // Mostra charge bar se applicabile
            if (playerController is ChaserController chaser)
            {
                if (chargeIndicator != null)
                    chargeIndicator.SetActive(chaser.HasOrb());

                if (chargeBar != null && chaser.HasOrb())
                    chargeBar.fillAmount = chaser.GetChargeProgress();
            }
            else if (playerController is BeaterController beater)
            {
                if (chargeIndicator != null)
                    chargeIndicator.SetActive(true);

                if (chargeBar != null)
                    chargeBar.fillAmount = beater.GetChargeProgress();
            }
            else if (playerController is SeekerController seeker)
            {
                if (chargeIndicator != null)
                    chargeIndicator.SetActive(seeker.GetCurrentGlobe() != null);

                if (chargeBar != null && seeker.GetCurrentGlobe() != null)
                    chargeBar.fillAmount = seeker.GetCaptureProgress();
            }
            else
            {
                if (chargeIndicator != null)
                    chargeIndicator.SetActive(false);
            }
        }

        #endregion

        #region Notifications

        /// <summary>
        /// Mostra una notifica
        /// </summary>
        public void ShowNotification(string message, float duration = 0f)
        {
            if (notificationPanel != null && notificationText != null)
            {
                notificationPanel.SetActive(true);
                notificationText.text = message;
                notificationTimer = duration > 0 ? duration : notificationDuration;
            }
        }

        /// <summary>
        /// Aggiorna il timer delle notifiche
        /// </summary>
        private void UpdateNotificationTimer()
        {
            if (notificationPanel != null && notificationPanel.activeSelf)
            {
                notificationTimer -= Time.deltaTime;
                if (notificationTimer <= 0f)
                {
                    notificationPanel.SetActive(false);
                }
            }
        }

        #endregion

        #region Pause Menu

        /// <summary>
        /// Pausa il gioco
        /// </summary>
        public void PauseGame()
        {
            if (pausePanel != null)
            {
                pausePanel.SetActive(true);
                GameManager.Instance.PauseMatch();
            }
        }

        /// <summary>
        /// Riprendi il gioco
        /// </summary>
        private void ResumeGame()
        {
            if (pausePanel != null)
            {
                pausePanel.SetActive(false);
                GameManager.Instance.ResumeMatch();
            }
        }

        /// <summary>
        /// Apri impostazioni
        /// </summary>
        private void OpenSettings()
        {
            Debug.Log("Apri impostazioni");
            // Qui si aprirebbe il pannello settings
        }

        /// <summary>
        /// Torna al menu
        /// </summary>
        private void QuitToMenu()
        {
            GameManager.Instance.ReturnToMenu();
        }

        #endregion

        #region Utility

        /// <summary>
        /// Ottiene il nome tradotto del ruolo
        /// </summary>
        private string GetRoleName(PlayerRole role)
        {
            return role switch
            {
                PlayerRole.Seeker => "CERCATORE",
                PlayerRole.Beater => "BATTITORE",
                PlayerRole.Chaser => "CACCIATORE",
                PlayerRole.Keeper => "PORTIERE",
                _ => "UNKNOWN"
            };
        }

        /// <summary>
        /// Mostra/nascondi HUD
        /// </summary>
        public void SetHUDVisible(bool visible)
        {
            gameObject.SetActive(visible);
        }

        #endregion
    }
}
