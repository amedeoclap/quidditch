using System;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

namespace SkySpheres.Core
{
    /// <summary>
    /// Sistema di progressione - Gestisce XP, livelli, skill tree e unlock
    /// </summary>
    [System.Serializable]
    public class PlayerProgress
    {
        public int level = 1;
        public int experience = 0;
        public int totalMatches = 0;
        public int wins = 0;
        public int losses = 0;
        public int draws = 0;

        // Stats per ruolo
        public Dictionary<PlayerRole, RoleStats> roleStats = new Dictionary<PlayerRole, RoleStats>();

        // Currency
        public int coins = 0;
        public int gems = 0;

        // Unlocks
        public List<string> unlockedSkins = new List<string>();
        public List<string> unlockedAbilities = new List<string>();
        public List<Achievement> achievements = new List<Achievement>();

        // Settings
        public string currentSkin = "default";
        public PlayerRole favoriteRole = PlayerRole.None;
    }

    [System.Serializable]
    public class RoleStats
    {
        public int matchesPlayed = 0;
        public int skillPoints = 0;
        public int level = 1;

        // Skill upgrades (0-10)
        public int speedUpgrade = 0;
        public int staminaUpgrade = 0;
        public int agilityUpgrade = 0;
        public int accuracyUpgrade = 0;
        public int powerUpgrade = 0;

        // Role-specific stats
        public int totalActions = 0; // catture, parate, goal, colpi
        public int successfulActions = 0;
    }

    [System.Serializable]
    public class Achievement
    {
        public string id;
        public string name;
        public string description;
        public bool unlocked;
        public DateTime unlockedDate;
        public int rewardCoins;
        public int rewardGems;
    }

    /// <summary>
    /// Progression System Manager
    /// </summary>
    public class ProgressionSystem : MonoBehaviour
    {
        private static ProgressionSystem instance;
        public static ProgressionSystem Instance
        {
            get
            {
                if (instance == null)
                {
                    instance = FindObjectOfType<ProgressionSystem>();
                    if (instance == null)
                    {
                        GameObject go = new GameObject("ProgressionSystem");
                        instance = go.AddComponent<ProgressionSystem>();
                    }
                }
                return instance;
            }
        }

        [Header("Progression Settings")]
        [SerializeField] private int baseXPRequirement = 100;
        [SerializeField] private float xpScalingFactor = 1.5f;
        [SerializeField] private int skillPointsPerLevel = 3;

        [Header("Rewards")]
        [SerializeField] private int coinsPerWin = 50;
        [SerializeField] private int coinsPerLoss = 20;
        [SerializeField] private int coinsPerDraw = 30;

        // Events
        public UnityEvent<int> OnLevelUp;
        public UnityEvent<int> OnExperienceGained;
        public UnityEvent<Achievement> OnAchievementUnlocked;
        public UnityEvent<int> OnCoinsChanged;
        public UnityEvent<int> OnGemsChanged;

        private PlayerProgress playerProgress;
        private List<Achievement> allAchievements;

        private void Awake()
        {
            if (instance != null && instance != this)
            {
                Destroy(gameObject);
                return;
            }
            instance = this;
            DontDestroyOnLoad(gameObject);

            InitializeAchievements();
            LoadProgress();
        }

        #region Experience & Levels

        /// <summary>
        /// Aggiunge esperienza
        /// </summary>
        public void AddExperience(int amount)
        {
            playerProgress.experience += amount;
            OnExperienceGained?.Invoke(amount);

            // Check level up
            int requiredXP = GetRequiredXP(playerProgress.level);
            while (playerProgress.experience >= requiredXP)
            {
                LevelUp();
                requiredXP = GetRequiredXP(playerProgress.level);
            }

            SaveProgress();
        }

        /// <summary>
        /// Level up
        /// </summary>
        private void LevelUp()
        {
            playerProgress.experience -= GetRequiredXP(playerProgress.level);
            playerProgress.level++;

            // Rewards
            int coinsReward = playerProgress.level * 10;
            AddCoins(coinsReward);

            OnLevelUp?.Invoke(playerProgress.level);
            Debug.Log($"LEVEL UP! Livello {playerProgress.level} raggiunto! +{coinsReward} coins");

            SaveProgress();
        }

        /// <summary>
        /// Calcola XP richiesto per il prossimo livello
        /// </summary>
        public int GetRequiredXP(int level)
        {
            return Mathf.FloorToInt(baseXPRequirement * Mathf.Pow(xpScalingFactor, level - 1));
        }

        /// <summary>
        /// Ottiene la percentuale verso il prossimo livello
        /// </summary>
        public float GetLevelProgress()
        {
            int requiredXP = GetRequiredXP(playerProgress.level);
            return (float)playerProgress.experience / requiredXP;
        }

        #endregion

        #region Match Results

        /// <summary>
        /// Processa il risultato di una partita
        /// </summary>
        public void ProcessMatchResult(bool won, bool draw, PlayerRole roleUsed, int score, int enemyScore)
        {
            playerProgress.totalMatches++;

            int xpGained = 0;
            int coinsGained = 0;

            if (won)
            {
                playerProgress.wins++;
                xpGained = 100 + (score - enemyScore) * 2;
                coinsGained = coinsPerWin;
            }
            else if (draw)
            {
                playerProgress.draws++;
                xpGained = 50;
                coinsGained = coinsPerDraw;
            }
            else
            {
                playerProgress.losses++;
                xpGained = 30;
                coinsGained = coinsPerLoss;
            }

            AddExperience(xpGained);
            AddCoins(coinsGained);

            // Update role stats
            UpdateRoleStats(roleUsed);

            // Check achievements
            CheckAchievements();

            SaveProgress();
        }

        #endregion

        #region Role Stats & Upgrades

        /// <summary>
        /// Aggiorna le statistiche del ruolo
        /// </summary>
        private void UpdateRoleStats(PlayerRole role)
        {
            if (!playerProgress.roleStats.ContainsKey(role))
            {
                playerProgress.roleStats[role] = new RoleStats();
            }

            RoleStats stats = playerProgress.roleStats[role];
            stats.matchesPlayed++;

            // Guadagna skill points ogni 5 partite
            if (stats.matchesPlayed % 5 == 0)
            {
                stats.skillPoints += skillPointsPerLevel;
                Debug.Log($"+{skillPointsPerLevel} Skill Points per {role}!");
            }

            SaveProgress();
        }

        /// <summary>
        /// Migliora una skill
        /// </summary>
        public bool UpgradeSkill(PlayerRole role, string skillName)
        {
            if (!playerProgress.roleStats.ContainsKey(role))
            {
                return false;
            }

            RoleStats stats = playerProgress.roleStats[role];

            if (stats.skillPoints <= 0)
            {
                Debug.Log("Skill points insufficienti!");
                return false;
            }

            bool upgraded = false;
            int maxUpgrade = 10;

            switch (skillName.ToLower())
            {
                case "speed":
                    if (stats.speedUpgrade < maxUpgrade)
                    {
                        stats.speedUpgrade++;
                        upgraded = true;
                    }
                    break;
                case "stamina":
                    if (stats.staminaUpgrade < maxUpgrade)
                    {
                        stats.staminaUpgrade++;
                        upgraded = true;
                    }
                    break;
                case "agility":
                    if (stats.agilityUpgrade < maxUpgrade)
                    {
                        stats.agilityUpgrade++;
                        upgraded = true;
                    }
                    break;
                case "accuracy":
                    if (stats.accuracyUpgrade < maxUpgrade)
                    {
                        stats.accuracyUpgrade++;
                        upgraded = true;
                    }
                    break;
                case "power":
                    if (stats.powerUpgrade < maxUpgrade)
                    {
                        stats.powerUpgrade++;
                        upgraded = true;
                    }
                    break;
            }

            if (upgraded)
            {
                stats.skillPoints--;
                Debug.Log($"{skillName} migliorata per {role}!");
                SaveProgress();
                return true;
            }

            return false;
        }

        /// <summary>
        /// Ottiene le statistiche di un ruolo
        /// </summary>
        public RoleStats GetRoleStats(PlayerRole role)
        {
            if (!playerProgress.roleStats.ContainsKey(role))
            {
                playerProgress.roleStats[role] = new RoleStats();
            }
            return playerProgress.roleStats[role];
        }

        #endregion

        #region Currency

        /// <summary>
        /// Aggiunge coins
        /// </summary>
        public void AddCoins(int amount)
        {
            playerProgress.coins += amount;
            OnCoinsChanged?.Invoke(playerProgress.coins);
            SaveProgress();
        }

        /// <summary>
        /// Spende coins
        /// </summary>
        public bool SpendCoins(int amount)
        {
            if (playerProgress.coins >= amount)
            {
                playerProgress.coins -= amount;
                OnCoinsChanged?.Invoke(playerProgress.coins);
                SaveProgress();
                return true;
            }
            return false;
        }

        /// <summary>
        /// Aggiunge gems
        /// </summary>
        public void AddGems(int amount)
        {
            playerProgress.gems += amount;
            OnGemsChanged?.Invoke(playerProgress.gems);
            SaveProgress();
        }

        /// <summary>
        /// Spende gems
        /// </summary>
        public bool SpendGems(int amount)
        {
            if (playerProgress.gems >= amount)
            {
                playerProgress.gems -= amount;
                OnGemsChanged?.Invoke(playerProgress.gems);
                SaveProgress();
                return true;
            }
            return false;
        }

        #endregion

        #region Unlocks

        /// <summary>
        /// Sblocca una skin
        /// </summary>
        public bool UnlockSkin(string skinId, int cost)
        {
            if (playerProgress.unlockedSkins.Contains(skinId))
            {
                Debug.Log("Skin già sbloccata!");
                return false;
            }

            if (SpendCoins(cost))
            {
                playerProgress.unlockedSkins.Add(skinId);
                Debug.Log($"Skin {skinId} sbloccata!");
                SaveProgress();
                return true;
            }

            return false;
        }

        /// <summary>
        /// Imposta la skin corrente
        /// </summary>
        public void SetCurrentSkin(string skinId)
        {
            if (playerProgress.unlockedSkins.Contains(skinId))
            {
                playerProgress.currentSkin = skinId;
                SaveProgress();
            }
        }

        #endregion

        #region Achievements

        /// <summary>
        /// Inizializza gli achievements
        /// </summary>
        private void InitializeAchievements()
        {
            allAchievements = new List<Achievement>
            {
                new Achievement
                {
                    id = "first_win",
                    name = "Prima Vittoria",
                    description = "Vinci la tua prima partita",
                    rewardCoins = 100,
                    rewardGems = 5
                },
                new Achievement
                {
                    id = "seeker_master",
                    name = "Maestro Cercatore",
                    description = "Cattura 10 Radiant Globes",
                    rewardCoins = 500,
                    rewardGems = 20
                },
                new Achievement
                {
                    id = "perfect_game",
                    name = "Partita Perfetta",
                    description = "Vinci una partita senza subire punti",
                    rewardCoins = 300,
                    rewardGems = 15
                },
                new Achievement
                {
                    id = "level_10",
                    name = "Veterano",
                    description = "Raggiungi il livello 10",
                    rewardCoins = 1000,
                    rewardGems = 50
                },
                new Achievement
                {
                    id = "win_streak_5",
                    name = "Inarrestabile",
                    description = "Vinci 5 partite consecutive",
                    rewardCoins = 250,
                    rewardGems = 10
                }
            };
        }

        /// <summary>
        /// Controlla gli achievements
        /// </summary>
        private void CheckAchievements()
        {
            foreach (Achievement achievement in allAchievements)
            {
                if (IsAchievementUnlocked(achievement.id))
                    continue;

                bool shouldUnlock = false;

                switch (achievement.id)
                {
                    case "first_win":
                        shouldUnlock = playerProgress.wins >= 1;
                        break;
                    case "level_10":
                        shouldUnlock = playerProgress.level >= 10;
                        break;
                    // Altri achievement...
                }

                if (shouldUnlock)
                {
                    UnlockAchievement(achievement);
                }
            }
        }

        /// <summary>
        /// Sblocca un achievement
        /// </summary>
        private void UnlockAchievement(Achievement achievement)
        {
            achievement.unlocked = true;
            achievement.unlockedDate = DateTime.Now;

            playerProgress.achievements.Add(achievement);

            AddCoins(achievement.rewardCoins);
            AddGems(achievement.rewardGems);

            OnAchievementUnlocked?.Invoke(achievement);
            Debug.Log($"Achievement sbloccato: {achievement.name}!");

            SaveProgress();
        }

        /// <summary>
        /// Verifica se un achievement è sbloccato
        /// </summary>
        public bool IsAchievementUnlocked(string achievementId)
        {
            return playerProgress.achievements.Exists(a => a.id == achievementId);
        }

        #endregion

        #region Save/Load

        /// <summary>
        /// Salva il progresso
        /// </summary>
        public void SaveProgress()
        {
            string json = JsonUtility.ToJson(playerProgress);
            PlayerPrefs.SetString("PlayerProgress", json);
            PlayerPrefs.Save();
        }

        /// <summary>
        /// Carica il progresso
        /// </summary>
        public void LoadProgress()
        {
            if (PlayerPrefs.HasKey("PlayerProgress"))
            {
                string json = PlayerPrefs.GetString("PlayerProgress");
                playerProgress = JsonUtility.FromJson<PlayerProgress>(json);
                Debug.Log("Progresso caricato!");
            }
            else
            {
                playerProgress = new PlayerProgress();
                // Aggiungi skin default
                playerProgress.unlockedSkins.Add("default");
                Debug.Log("Nuovo progresso creato!");
            }
        }

        /// <summary>
        /// Reset del progresso (per debug)
        /// </summary>
        public void ResetProgress()
        {
            PlayerPrefs.DeleteKey("PlayerProgress");
            playerProgress = new PlayerProgress();
            playerProgress.unlockedSkins.Add("default");
            SaveProgress();
            Debug.Log("Progresso resettato!");
        }

        #endregion

        #region Getters

        public PlayerProgress GetProgress() => playerProgress;
        public int GetLevel() => playerProgress.level;
        public int GetExperience() => playerProgress.experience;
        public int GetCoins() => playerProgress.coins;
        public int GetGems() => playerProgress.gems;
        public int GetWins() => playerProgress.wins;
        public int GetLosses() => playerProgress.losses;
        public float GetWinRate() => playerProgress.totalMatches > 0 ?
            (float)playerProgress.wins / playerProgress.totalMatches * 100f : 0f;

        #endregion
    }
}
