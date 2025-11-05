using System.Collections;
using System.Collections.Generic;
using UnityEngine;

namespace SkySpheres.Utils
{
    /// <summary>
    /// Audio Manager - Gestisce musica ed effetti sonori
    /// </summary>
    public class AudioManager : MonoBehaviour
    {
        [System.Serializable]
        public class Sound
        {
            public string name;
            public AudioClip clip;

            [Range(0f, 1f)]
            public float volume = 1f;

            [Range(0.1f, 3f)]
            public float pitch = 1f;

            public bool loop = false;
            public bool playOnAwake = false;

            [HideInInspector]
            public AudioSource source;
        }

        public static AudioManager Instance;

        [Header("Music")]
        [SerializeField] private Sound[] musicTracks;
        [SerializeField] private float musicVolume = 0.7f;

        [Header("Sound Effects")]
        [SerializeField] private Sound[] soundEffects;
        [SerializeField] private float sfxVolume = 1f;

        [Header("Settings")]
        [SerializeField] private int maxSimultaneousSounds = 10;
        [SerializeField] private bool muteOnStart = false;

        private Dictionary<string, Sound> soundDictionary;
        private List<AudioSource> activeSources;
        private AudioSource musicSource;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;
            DontDestroyOnLoad(gameObject);

            Initialize();
        }

        /// <summary>
        /// Inizializza il sistema audio
        /// </summary>
        private void Initialize()
        {
            soundDictionary = new Dictionary<string, Sound>();
            activeSources = new List<AudioSource>();

            // Setup music
            if (musicTracks != null)
            {
                foreach (Sound music in musicTracks)
                {
                    music.source = gameObject.AddComponent<AudioSource>();
                    music.source.clip = music.clip;
                    music.source.volume = music.volume * musicVolume;
                    music.source.pitch = music.pitch;
                    music.source.loop = music.loop;
                    music.source.playOnAwake = music.playOnAwake;

                    soundDictionary[music.name] = music;
                }
            }

            // Setup SFX
            if (soundEffects != null)
            {
                foreach (Sound sfx in soundEffects)
                {
                    soundDictionary[sfx.name] = sfx;
                }
            }

            // Create music source
            musicSource = gameObject.AddComponent<AudioSource>();
            musicSource.loop = true;

            if (muteOnStart)
            {
                MuteAll(true);
            }
        }

        #region Music

        /// <summary>
        /// Play music track
        /// </summary>
        public void PlayMusic(string name, bool fade = true)
        {
            if (!soundDictionary.ContainsKey(name))
            {
                Debug.LogWarning($"Music track '{name}' not found!");
                return;
            }

            Sound music = soundDictionary[name];

            if (fade && musicSource.isPlaying)
            {
                StartCoroutine(CrossfadeMusic(music));
            }
            else
            {
                musicSource.clip = music.clip;
                musicSource.volume = music.volume * musicVolume;
                musicSource.pitch = music.pitch;
                musicSource.Play();
            }
        }

        /// <summary>
        /// Crossfade tra tracce musicali
        /// </summary>
        private IEnumerator CrossfadeMusic(Sound newMusic)
        {
            float fadeDuration = 1f;
            float elapsed = 0f;
            float startVolume = musicSource.volume;

            // Fade out
            while (elapsed < fadeDuration)
            {
                elapsed += Time.deltaTime;
                musicSource.volume = Mathf.Lerp(startVolume, 0f, elapsed / fadeDuration);
                yield return null;
            }

            // Change track
            musicSource.clip = newMusic.clip;
            musicSource.volume = 0f;
            musicSource.Play();

            // Fade in
            elapsed = 0f;
            float targetVolume = newMusic.volume * musicVolume;

            while (elapsed < fadeDuration)
            {
                elapsed += Time.deltaTime;
                musicSource.volume = Mathf.Lerp(0f, targetVolume, elapsed / fadeDuration);
                yield return null;
            }

            musicSource.volume = targetVolume;
        }

        /// <summary>
        /// Stop music
        /// </summary>
        public void StopMusic(bool fade = true)
        {
            if (fade)
            {
                StartCoroutine(FadeOutMusic());
            }
            else
            {
                musicSource.Stop();
            }
        }

        private IEnumerator FadeOutMusic()
        {
            float fadeDuration = 1f;
            float elapsed = 0f;
            float startVolume = musicSource.volume;

            while (elapsed < fadeDuration)
            {
                elapsed += Time.deltaTime;
                musicSource.volume = Mathf.Lerp(startVolume, 0f, elapsed / fadeDuration);
                yield return null;
            }

            musicSource.Stop();
        }

        #endregion

        #region Sound Effects

        /// <summary>
        /// Play sound effect
        /// </summary>
        public void PlaySFX(string name)
        {
            if (!soundDictionary.ContainsKey(name))
            {
                Debug.LogWarning($"Sound effect '{name}' not found!");
                return;
            }

            Sound sfx = soundDictionary[name];

            // Limit simultaneous sounds
            if (activeSources.Count >= maxSimultaneousSounds)
            {
                RemoveFinishedSources();
                if (activeSources.Count >= maxSimultaneousSounds)
                {
                    return; // Too many sounds playing
                }
            }

            // Create temporary audio source
            GameObject tempGO = new GameObject($"SFX_{name}");
            tempGO.transform.SetParent(transform);
            AudioSource source = tempGO.AddComponent<AudioSource>();

            source.clip = sfx.clip;
            source.volume = sfx.volume * sfxVolume;
            source.pitch = sfx.pitch;
            source.loop = sfx.loop;
            source.Play();

            activeSources.Add(source);

            if (!sfx.loop)
            {
                Destroy(tempGO, sfx.clip.length);
            }
        }

        /// <summary>
        /// Play 3D sound at position
        /// </summary>
        public void PlaySFX3D(string name, Vector3 position)
        {
            if (!soundDictionary.ContainsKey(name))
            {
                Debug.LogWarning($"Sound effect '{name}' not found!");
                return;
            }

            Sound sfx = soundDictionary[name];

            GameObject tempGO = new GameObject($"SFX3D_{name}");
            tempGO.transform.position = position;
            tempGO.transform.SetParent(transform);

            AudioSource source = tempGO.AddComponent<AudioSource>();
            source.clip = sfx.clip;
            source.volume = sfx.volume * sfxVolume;
            source.pitch = sfx.pitch;
            source.spatialBlend = 1f; // Full 3D
            source.rolloffMode = AudioRolloffMode.Linear;
            source.maxDistance = 50f;
            source.Play();

            activeSources.Add(source);
            Destroy(tempGO, sfx.clip.length);
        }

        /// <summary>
        /// Rimuove source terminate
        /// </summary>
        private void RemoveFinishedSources()
        {
            activeSources.RemoveAll(s => s == null || !s.isPlaying);
        }

        #endregion

        #region Volume Control

        /// <summary>
        /// Imposta volume musica
        /// </summary>
        public void SetMusicVolume(float volume)
        {
            musicVolume = Mathf.Clamp01(volume);
            if (musicSource != null)
            {
                musicSource.volume = musicVolume;
            }
            PlayerPrefs.SetFloat("MusicVolume", musicVolume);
        }

        /// <summary>
        /// Imposta volume SFX
        /// </summary>
        public void SetSFXVolume(float volume)
        {
            sfxVolume = Mathf.Clamp01(volume);
            PlayerPrefs.SetFloat("SFXVolume", sfxVolume);
        }

        /// <summary>
        /// Mute/Unmute tutto
        /// </summary>
        public void MuteAll(bool mute)
        {
            AudioListener.volume = mute ? 0f : 1f;
            PlayerPrefs.SetInt("Muted", mute ? 1 : 0);
        }

        /// <summary>
        /// Toggle mute
        /// </summary>
        public void ToggleMute()
        {
            bool isMuted = AudioListener.volume == 0f;
            MuteAll(!isMuted);
        }

        #endregion

        #region Load/Save Settings

        private void Start()
        {
            LoadAudioSettings();
        }

        private void LoadAudioSettings()
        {
            if (PlayerPrefs.HasKey("MusicVolume"))
            {
                musicVolume = PlayerPrefs.GetFloat("MusicVolume");
            }

            if (PlayerPrefs.HasKey("SFXVolume"))
            {
                sfxVolume = PlayerPrefs.GetFloat("SFXVolume");
            }

            if (PlayerPrefs.HasKey("Muted"))
            {
                bool muted = PlayerPrefs.GetInt("Muted") == 1;
                MuteAll(muted);
            }
        }

        #endregion

        #region Getters

        public float GetMusicVolume() => musicVolume;
        public float GetSFXVolume() => sfxVolume;
        public bool IsMuted() => AudioListener.volume == 0f;

        #endregion
    }
}
