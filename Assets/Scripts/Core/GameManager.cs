using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;
using UnityEngine.SceneManagement;

namespace SkySpheres.Core
{
    /// <summary>
    /// Game Manager principale - Singleton che gestisce lo stato del gioco
    /// </summary>
    public class GameManager : MonoBehaviour
    {
        private static GameManager instance;
        public static GameManager Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindObjectOfType<GameManager>();
                    if (instance == null)
                    {
                        GameObject go = new GameObject("GameManager");
                        instance = go.AddComponent<GameManager>();
                    }
                }
                return instance;
            }
        }

        [Header("Game Settings")]
        [SerializeField] private GameMode currentGameMode = GameMode.QuickMatch;
        [SerializeField] private Difficulty currentDifficulty = Difficulty.Medium;
        [SerializeField] private Team playerTeam = Team.Blue;

        [Header("Match Settings")]
        [SerializeField] private float matchDuration = 300f; // 5 minuti
        [SerializeField] private int scoreToWin = 150;
        [SerializeField] private int radiantGlobeCapturePoints = 150;

        [Header("References")]
        [SerializeField] private DestinyHood destinyHood;

        // State
        private GameState currentState = GameState.Menu;
        private PlayerRole playerRole;
        private int blueTeamScore = 0;
        private int redTeamScore = 0;
        private float matchTimer = 0f;
        private bool isMatchActive = false;

        // Events
        public UnityEvent<GameState> OnGameStateChanged;
        public UnityEvent<PlayerRole> OnPlayerRoleSet;
        public UnityEvent<int, int> OnScoreChanged; // blue, red
        public UnityEvent<Team> OnMatchWon;
        public UnityEvent OnMatchDraw;
        public UnityEvent<float> OnTimerUpdate;

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }
            instance = this;
            DontDestroyOnLoad(gameObject);
        }

        private void Start()
        {
            // Trova il Destiny Hood se non assegnato
            if (destinyHood == null)
            {
                destinyHood = FindObjectOfType<DestinyHood>();
            }
        }

        private void Update()
        {
            if (isMatchActive)
            {
                UpdateMatchTimer();
            }
        }

        #region Game State Management

        /// <summary>
        /// Cambia lo stato del gioco
        /// </summary>
        public void SetGameState(GameState newState)
        {
            currentState = newState;
            OnGameStateChanged?.Invoke(newState);

            switch (newState)
            {
                case GameState.RoleSelection:
                    StartRoleSelection();
                    break;
                case GameState.Gameplay:
                    StartMatch();
                    break;
                case GameState.GameOver:
                    EndMatch();
                    break;
            }
        }

        /// <summary>
        /// Ottiene lo stato corrente
        /// </summary>
        public GameState GetCurrentState()
        {
            return currentState;
        }

        #endregion

        #region Role Selection

        /// <summary>
        /// Avvia la selezione del ruolo tramite Destiny Hood
        /// </summary>
        public void StartRoleSelection()
        {
            if (destinyHood != null)
            {
                destinyHood.OnRoleAssigned.AddListener(SetPlayerRole);
                destinyHood.OnSelectionComplete.AddListener(OnRoleSelectionComplete);
                destinyHood.StartRoleSelection();
            }
            else
            {
                Debug.LogError("Destiny Hood non trovato!");
                // Fallback: assegna ruolo casuale
                SetPlayerRole(GetRandomRole());
                OnRoleSelectionComplete();
            }
        }

        /// <summary>
        /// Imposta il ruolo del giocatore
        /// </summary>
        private void SetPlayerRole(PlayerRole role)
        {
            playerRole = role;
            OnPlayerRoleSet?.Invoke(role);
            Debug.Log($"Ruolo giocatore impostato: {role}");
        }

        /// <summary>
        /// Callback quando la selezione del ruolo è completata
        /// </summary>
        private void OnRoleSelectionComplete()
        {
            Debug.Log("Selezione ruolo completata. Avvio partita...");
            StartCoroutine(TransitionToGameplay());
        }

        /// <summary>
        /// Transizione fluida verso gameplay
        /// </summary>
        private IEnumerator TransitionToGameplay()
        {
            yield return new WaitForSeconds(2f);
            SetGameState(GameState.Gameplay);
        }

        /// <summary>
        /// Ottiene il ruolo attuale del giocatore
        /// </summary>
        public PlayerRole GetPlayerRole()
        {
            return playerRole;
        }

        private PlayerRole GetRandomRole()
        {
            PlayerRole[] roles = { PlayerRole.Seeker, PlayerRole.Beater, PlayerRole.Chaser, PlayerRole.Keeper };
            return roles[Random.Range(0, roles.Length)];
        }

        #endregion

        #region Match Management

        /// <summary>
        /// Avvia la partita
        /// </summary>
        public void StartMatch()
        {
            isMatchActive = true;
            matchTimer = matchDuration;
            blueTeamScore = 0;
            redTeamScore = 0;
            OnScoreChanged?.Invoke(blueTeamScore, redTeamScore);
            Debug.Log("Partita iniziata!");
        }

        /// <summary>
        /// Aggiorna il timer della partita
        /// </summary>
        private void UpdateMatchTimer()
        {
            matchTimer -= Time.deltaTime;
            OnTimerUpdate?.Invoke(matchTimer);

            if (matchTimer <= 0f)
            {
                matchTimer = 0f;
                CheckMatchEnd();
            }
        }

        /// <summary>
        /// Aggiunge punti a un team
        /// </summary>
        public void AddScore(Team team, int points)
        {
            if (!isMatchActive) return;

            if (team == Team.Blue)
            {
                blueTeamScore += points;
            }
            else
            {
                redTeamScore += points;
            }

            OnScoreChanged?.Invoke(blueTeamScore, redTeamScore);
            CheckMatchEnd();
        }

        /// <summary>
        /// Cattura del Radiant Globe (termina immediatamente la partita)
        /// </summary>
        public void OnRadiantGlobeCaptured(Team team)
        {
            AddScore(team, radiantGlobeCapturePoints);
            CheckMatchEnd(true);
        }

        /// <summary>
        /// Verifica se la partita deve terminare
        /// </summary>
        private void CheckMatchEnd(bool forcedEnd = false)
        {
            if (!isMatchActive) return;

            bool shouldEnd = forcedEnd || matchTimer <= 0f ||
                           blueTeamScore >= scoreToWin ||
                           redTeamScore >= scoreToWin;

            if (shouldEnd)
            {
                EndMatch();
            }
        }

        /// <summary>
        /// Termina la partita
        /// </summary>
        public void EndMatch()
        {
            isMatchActive = false;
            SetGameState(GameState.GameOver);

            // Determina vincitore
            if (blueTeamScore > redTeamScore)
            {
                OnMatchWon?.Invoke(Team.Blue);
            }
            else if (redTeamScore > blueTeamScore)
            {
                OnMatchWon?.Invoke(Team.Red);
            }
            else
            {
                OnMatchDraw?.Invoke();
            }

            Debug.Log($"Partita terminata! Blue: {blueTeamScore}, Red: {redTeamScore}");
        }

        /// <summary>
        /// Mette in pausa la partita
        /// </summary>
        public void PauseMatch()
        {
            if (currentState == GameState.Gameplay)
            {
                SetGameState(GameState.Paused);
                Time.timeScale = 0f;
            }
        }

        /// <summary>
        /// Riprende la partita
        /// </summary>
        public void ResumeMatch()
        {
            if (currentState == GameState.Paused)
            {
                SetGameState(GameState.Gameplay);
                Time.timeScale = 1f;
            }
        }

        #endregion

        #region Getters

        public int GetBlueTeamScore() => blueTeamScore;
        public int GetRedTeamScore() => redTeamScore;
        public float GetMatchTimer() => matchTimer;
        public bool IsMatchActive() => isMatchActive;
        public Team GetPlayerTeam() => playerTeam;
        public GameMode GetGameMode() => currentGameMode;
        public Difficulty GetDifficulty() => currentDifficulty;

        #endregion

        #region Scene Management

        /// <summary>
        /// Carica una scena
        /// </summary>
        public void LoadScene(string sceneName)
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(sceneName);
        }

        /// <summary>
        /// Riavvia la partita corrente
        /// </summary>
        public void RestartMatch()
        {
            Time.timeScale = 1f;
            SceneManager.LoadScene(SceneManager.GetActiveScene().name);
        }

        /// <summary>
        /// Torna al menu principale
        /// </summary>
        public void ReturnToMenu()
        {
            Time.timeScale = 1f;
            SetGameState(GameState.Menu);
            LoadScene("MainMenu");
        }

        #endregion

        #region Settings

        /// <summary>
        /// Imposta la modalità di gioco
        /// </summary>
        public void SetGameMode(GameMode mode)
        {
            currentGameMode = mode;
        }

        /// <summary>
        /// Imposta la difficoltà
        /// </summary>
        public void SetDifficulty(Difficulty difficulty)
        {
            currentDifficulty = difficulty;
        }

        /// <summary>
        /// Imposta il team del giocatore
        /// </summary>
        public void SetPlayerTeam(Team team)
        {
            playerTeam = team;
        }

        #endregion
    }
}
