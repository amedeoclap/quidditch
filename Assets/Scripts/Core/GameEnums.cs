using UnityEngine;

namespace SkySpheres.Core
{
    /// <summary>
    /// Ruoli disponibili nel gioco Sky Spheres
    /// </summary>
    public enum PlayerRole
    {
        None,
        Seeker,     // Cattura il Radiant Globe
        Beater,     // Colpisce Strike Spheres
        Chaser,     // Lancia Score Orbs negli anelli
        Keeper      // Difende gli anelli
    }

    /// <summary>
    /// Stato corrente della partita
    /// </summary>
    public enum GameState
    {
        Menu,
        RoleSelection,
        Gameplay,
        Paused,
        GameOver,
        Victory
    }

    /// <summary>
    /// Difficoltà del gioco
    /// </summary>
    public enum Difficulty
    {
        Easy,
        Medium,
        Hard,
        Expert
    }

    /// <summary>
    /// Team del giocatore
    /// </summary>
    public enum Team
    {
        Blue,
        Red
    }

    /// <summary>
    /// Tipo di modalità di gioco
    /// </summary>
    public enum GameMode
    {
        Training,
        QuickMatch,
        StoryMode,
        Multiplayer
    }
}
