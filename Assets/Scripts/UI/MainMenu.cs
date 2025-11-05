using UnityEngine;
using UnityEngine.UI;
using TMPro;
using SkySpheres.Core;

namespace SkySpheres.UI
{
    /// <summary>
    /// Main Menu UI - Menu principale del gioco
    /// </summary>
    public class MainMenu : MonoBehaviour
    {
        [Header("Main Panels")]
        [SerializeField] private GameObject mainPanel;
        [SerializeField] private GameObject modeSelectionPanel;
        [SerializeField] private GameObject progressionPanel;
        [SerializeField] private GameObject settingsPanel;
        [SerializeField] private GameObject shopPanel;

        [Header("Main Buttons")]
        [SerializeField] private Button playButton;
        [SerializeField] private Button progressionButton;
        [SerializeField] private Button shopButton;
        [SerializeField] private Button settingsButton;
        [SerializeField] private Button quitButton;

        [Header("Mode Selection")]
        [SerializeField] private Button quickMatchButton;
        [SerializeField] private Button storyModeButton;
        [SerializeField] private Button trainingButton;
        [SerializeField] private Button multiplayerButton;
        [SerializeField] private Button backButton;

        [Header("Player Info Display")]
        [SerializeField] private TextMeshProUGUI playerNameText;
        [SerializeField] private TextMeshProUGUI levelText;
        [SerializeField] private Image levelProgressBar;
        [SerializeField] private TextMeshProUGUI coinsText;
        [SerializeField] private TextMeshProUGUI gemsText;

        [Header("Stats Display")]
        [SerializeField] private TextMeshProUGUI winsText;
        [SerializeField] private TextMeshProUGUI lossesText;
        [SerializeField] private TextMeshProUGUI winRateText;

        [Header("Destiny Hood")]
        [SerializeField] private GameObject destinyHoodDisplay;
        [SerializeField] private TextMeshProUGUI destinyHoodDialogue;

        private void Start()
        {
            SetupButtons();
            ShowMainPanel();
            UpdatePlayerInfo();

            // Subscribe to progression events
            if (ProgressionSystem.Instance != null)
            {
                ProgressionSystem.Instance.OnLevelUp.AddListener(OnLevelUp);
                ProgressionSystem.Instance.OnCoinsChanged.AddListener(UpdateCoins);
                ProgressionSystem.Instance.OnGemsChanged.AddListener(UpdateGems);
            }

            // Destiny Hood greeting
            ShowDestinyHoodGreeting();
        }

        #region Setup

        /// <summary>
        /// Setup dei button listeners
        /// </summary>
        private void SetupButtons()
        {
            // Main buttons
            if (playButton != null)
                playButton.onClick.AddListener(ShowModeSelection);
            if (progressionButton != null)
                progressionButton.onClick.AddListener(ShowProgression);
            if (shopButton != null)
                shopButton.onClick.AddListener(ShowShop);
            if (settingsButton != null)
                settingsButton.onClick.AddListener(ShowSettings);
            if (quitButton != null)
                quitButton.onClick.AddListener(QuitGame);

            // Mode selection
            if (quickMatchButton != null)
                quickMatchButton.onClick.AddListener(() => StartGame(GameMode.QuickMatch));
            if (storyModeButton != null)
                storyModeButton.onClick.AddListener(() => StartGame(GameMode.StoryMode));
            if (trainingButton != null)
                trainingButton.onClick.AddListener(() => StartGame(GameMode.Training));
            if (multiplayerButton != null)
                multiplayerButton.onClick.AddListener(() => StartGame(GameMode.Multiplayer));
            if (backButton != null)
                backButton.onClick.AddListener(ShowMainPanel);
        }

        #endregion

        #region Panel Management

        /// <summary>
        /// Mostra il pannello principale
        /// </summary>
        private void ShowMainPanel()
        {
            HideAllPanels();
            if (mainPanel != null)
                mainPanel.SetActive(true);
        }

        /// <summary>
        /// Mostra la selezione modalità
        /// </summary>
        private void ShowModeSelection()
        {
            HideAllPanels();
            if (modeSelectionPanel != null)
                modeSelectionPanel.SetActive(true);
        }

        /// <summary>
        /// Mostra il pannello progressione
        /// </summary>
        private void ShowProgression()
        {
            HideAllPanels();
            if (progressionPanel != null)
            {
                progressionPanel.SetActive(true);
                UpdateProgressionDisplay();
            }
        }

        /// <summary>
        /// Mostra lo shop
        /// </summary>
        private void ShowShop()
        {
            HideAllPanels();
            if (shopPanel != null)
                shopPanel.SetActive(true);
        }

        /// <summary>
        /// Mostra le impostazioni
        /// </summary>
        private void ShowSettings()
        {
            HideAllPanels();
            if (settingsPanel != null)
                settingsPanel.SetActive(true);
        }

        /// <summary>
        /// Nascondi tutti i pannelli
        /// </summary>
        private void HideAllPanels()
        {
            if (mainPanel != null) mainPanel.SetActive(false);
            if (modeSelectionPanel != null) modeSelectionPanel.SetActive(false);
            if (progressionPanel != null) progressionPanel.SetActive(false);
            if (settingsPanel != null) settingsPanel.SetActive(false);
            if (shopPanel != null) shopPanel.SetActive(false);
        }

        #endregion

        #region Player Info

        /// <summary>
        /// Aggiorna le info del giocatore
        /// </summary>
        private void UpdatePlayerInfo()
        {
            if (ProgressionSystem.Instance == null) return;

            // Level
            if (levelText != null)
            {
                int level = ProgressionSystem.Instance.GetLevel();
                levelText.text = $"LVL {level}";
            }

            // Level progress
            if (levelProgressBar != null)
            {
                levelProgressBar.fillAmount = ProgressionSystem.Instance.GetLevelProgress();
            }

            // Coins
            UpdateCoins(ProgressionSystem.Instance.GetCoins());

            // Gems
            UpdateGems(ProgressionSystem.Instance.GetGems());

            // Stats
            if (winsText != null)
                winsText.text = $"Vittorie: {ProgressionSystem.Instance.GetWins()}";
            if (lossesText != null)
                lossesText.text = $"Sconfitte: {ProgressionSystem.Instance.GetLosses()}";
            if (winRateText != null)
                winRateText.text = $"Win Rate: {ProgressionSystem.Instance.GetWinRate():F1}%";
        }

        /// <summary>
        /// Aggiorna i coins
        /// </summary>
        private void UpdateCoins(int coins)
        {
            if (coinsText != null)
                coinsText.text = coins.ToString();
        }

        /// <summary>
        /// Aggiorna i gems
        /// </summary>
        private void UpdateGems(int gems)
        {
            if (gemsText != null)
                gemsText.text = gems.ToString();
        }

        /// <summary>
        /// Callback level up
        /// </summary>
        private void OnLevelUp(int newLevel)
        {
            UpdatePlayerInfo();
            ShowDestinyHoodMessage($"Congratulazioni! Livello {newLevel} raggiunto!");
        }

        #endregion

        #region Progression Display

        /// <summary>
        /// Aggiorna il display della progressione
        /// </summary>
        private void UpdateProgressionDisplay()
        {
            // Qui si mostrerebbero le statistiche dettagliate per ruolo,
            // achievement, skill tree, ecc.
            // Per ora è un placeholder
        }

        #endregion

        #region Destiny Hood

        /// <summary>
        /// Mostra un saluto del Destiny Hood
        /// </summary>
        private void ShowDestinyHoodGreeting()
        {
            string[] greetings = {
                "Bentornato, giovane volatore! Pronto per nuove avventure?",
                "Ah! Le mie cuciture tremano... qualcuno vuole giocare!",
                "Eccoti qui di nuovo. Non avevi niente di meglio da fare?",
                "Benvenuto! Ho già scelto il tuo ruolo... sto scherzando!",
                "Ciao! Oggi mi sento particolarmente magico... o è solo il bucato?"
            };

            string greeting = greetings[Random.Range(0, greetings.Length)];
            ShowDestinyHoodMessage(greeting);
        }

        /// <summary>
        /// Mostra un messaggio del Destiny Hood
        /// </summary>
        private void ShowDestinyHoodMessage(string message)
        {
            if (destinyHoodDisplay != null && destinyHoodDialogue != null)
            {
                destinyHoodDisplay.SetActive(true);
                destinyHoodDialogue.text = message;

                // Nascondi dopo qualche secondo
                Invoke(nameof(HideDestinyHood), 4f);
            }
        }

        private void HideDestinyHood()
        {
            if (destinyHoodDisplay != null)
                destinyHoodDisplay.SetActive(false);
        }

        #endregion

        #region Game Start

        /// <summary>
        /// Avvia il gioco
        /// </summary>
        private void StartGame(GameMode mode)
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.SetGameMode(mode);
                GameManager.Instance.SetGameState(GameState.RoleSelection);
                GameManager.Instance.LoadScene("RoleSelection");
            }
        }

        /// <summary>
        /// Esci dal gioco
        /// </summary>
        private void QuitGame()
        {
#if UNITY_EDITOR
            UnityEditor.EditorApplication.isPlaying = false;
#else
            Application.Quit();
#endif
        }

        #endregion
    }
}
