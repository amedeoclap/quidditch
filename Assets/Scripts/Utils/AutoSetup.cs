using UnityEngine;
#if UNITY_EDITOR
using UnityEditor;
#endif
using SkySpheres.Core;
using SkySpheres.Player;
using SkySpheres.Gameplay;

namespace SkySpheres.Utils
{
    /// <summary>
    /// Auto Setup - Crea automaticamente una scena di test funzionante
    /// Uso: Menu > Sky Spheres > Setup Demo Scene
    /// </summary>
    public class AutoSetup : MonoBehaviour
    {
#if UNITY_EDITOR
        [MenuItem("Sky Spheres/Setup Demo Scene (Quick Test)")]
        public static void CreateDemoScene()
        {
            if (!EditorUtility.DisplayDialog(
                "Setup Demo Scene",
                "Questa operazione creerà una scena di test con:\n\n" +
                "- Player (Seeker)\n" +
                "- Radiant Globe\n" +
                "- Camera Follow\n" +
                "- Game Manager\n\n" +
                "Vuoi continuare?",
                "Sì, crea!",
                "Annulla"))
            {
                return;
            }

            Debug.Log("=== Sky Spheres Auto Setup ===");

            // Clear existing objects
            foreach (var obj in GameObject.FindObjectsOfType<GameObject>())
            {
                if (obj.scene.name != null) // Only scene objects
                {
                    if (obj.name != "Main Camera")
                    {
                        DestroyImmediate(obj);
                    }
                }
            }

            // 1. Create Managers
            GameObject managers = new GameObject("--- MANAGERS ---");

            GameObject gmObj = new GameObject("GameManager");
            gmObj.transform.SetParent(managers.transform);
            gmObj.AddComponent<GameManager>();

            GameObject progObj = new GameObject("ProgressionSystem");
            progObj.transform.SetParent(managers.transform);
            progObj.AddComponent<ProgressionSystem>();

            GameObject hoodObj = new GameObject("DestinyHood");
            hoodObj.transform.SetParent(managers.transform);
            var hood = hoodObj.AddComponent<DestinyHood>();

            Debug.Log("✓ Managers creati");

            // 2. Create Player
            GameObject player = GameObject.CreatePrimitive(PrimitiveType.Capsule);
            player.name = "Player";
            player.tag = "Player";
            player.layer = LayerMask.NameToLayer("Default");
            player.transform.position = new Vector3(0, 2, 0);

            // Add Rigidbody
            Rigidbody playerRb = player.AddComponent<Rigidbody>();
            playerRb.useGravity = false;
            playerRb.drag = 2f;
            playerRb.constraints = RigidbodyConstraints.FreezeRotation;

            // Add Seeker Controller
            var seekerController = player.AddComponent<SeekerController>();

            // Add Touch Input
            var touchInput = player.AddComponent<TouchInputController>();

            // Make it colorful
            var playerRenderer = player.GetComponent<Renderer>();
            playerRenderer.material = new Material(Shader.Find("Standard"));
            playerRenderer.material.color = Color.cyan;

            Debug.Log("✓ Player creato (Cyan Capsule)");

            // 3. Create Radiant Globe
            GameObject globe = GameObject.CreatePrimitive(PrimitiveType.Sphere);
            globe.name = "RadiantGlobe";
            globe.transform.position = new Vector3(10, 8, 10);
            globe.transform.localScale = Vector3.one * 0.5f;

            Rigidbody globeRb = globe.AddComponent<Rigidbody>();
            globeRb.useGravity = false;
            globeRb.drag = 0.5f;

            var radiantGlobe = globe.AddComponent<RadiantGlobe>();

            // Golden material
            var globeRenderer = globe.GetComponent<Renderer>();
            globeRenderer.material = new Material(Shader.Find("Standard"));
            globeRenderer.material.color = new Color(1f, 0.84f, 0f); // Gold
            globeRenderer.material.SetFloat("_Metallic", 1f);
            globeRenderer.material.SetFloat("_Smoothness", 0.9f);

            // Add glow
            Light glowLight = globe.AddComponent<Light>();
            glowLight.type = LightType.Point;
            glowLight.color = Color.yellow;
            glowLight.range = 10f;
            glowLight.intensity = 2f;

            Debug.Log("✓ Radiant Globe creato (Golden Sphere)");

            // 4. Create Ground
            GameObject ground = GameObject.CreatePrimitive(PrimitiveType.Plane);
            ground.name = "Ground";
            ground.transform.position = new Vector3(0, -5, 0);
            ground.transform.localScale = new Vector3(10, 1, 10);

            var groundRenderer = ground.GetComponent<Renderer>();
            groundRenderer.material = new Material(Shader.Find("Standard"));
            groundRenderer.material.color = new Color(0.3f, 0.5f, 0.3f); // Green

            Debug.Log("✓ Ground creato");

            // 5. Create Boundaries
            GameObject boundaries = new GameObject("--- BOUNDARIES ---");
            CreateInvisibleWall(boundaries.transform, new Vector3(0, 10, 50), new Vector3(100, 20, 1)); // North
            CreateInvisibleWall(boundaries.transform, new Vector3(0, 10, -50), new Vector3(100, 20, 1)); // South
            CreateInvisibleWall(boundaries.transform, new Vector3(50, 10, 0), new Vector3(1, 20, 100)); // East
            CreateInvisibleWall(boundaries.transform, new Vector3(-50, 10, 0), new Vector3(1, 20, 100)); // West

            Debug.Log("✓ Boundaries creati");

            // 6. Setup Camera
            Camera mainCam = Camera.main;
            if (mainCam != null)
            {
                mainCam.transform.position = new Vector3(0, 12, -15);
                mainCam.transform.rotation = Quaternion.Euler(30, 0, 0);
                mainCam.clearFlags = CameraClearFlags.Skybox;

                // Add camera follow
                var camFollow = mainCam.gameObject.AddComponent<CameraFollow>();

                Debug.Log("✓ Camera configurata");
            }

            // 7. Add Lighting
            GameObject sun = new GameObject("Directional Light");
            Light sunLight = sun.AddComponent<Light>();
            sunLight.type = LightType.Directional;
            sunLight.color = Color.white;
            sunLight.intensity = 1f;
            sun.transform.rotation = Quaternion.Euler(50, -30, 0);

            Debug.Log("✓ Lighting aggiunto");

            // 8. Configure Game Manager references
            var gameManager = gmObj.GetComponent<GameManager>();
            // Usa reflection per impostare il campo privato se necessario
            // O aggiungi metodo pubblico SetDestinyHood in GameManager

            Debug.Log("=== Setup Completato! ===");
            Debug.Log("\n📋 CONTROLLI:");
            Debug.Log("WASD = Movimento");
            Debug.Log("Spazio = Vola su");
            Debug.Log("Ctrl = Vola giù");
            Debug.Log("E = Cattura Globe (quando vicino)");
            Debug.Log("Shift = Boost");
            Debug.Log("\n▶️ Premi PLAY per testare!");

            EditorUtility.DisplayDialog(
                "Setup Completato!",
                "Scena di test creata con successo!\n\n" +
                "CONTROLLI:\n" +
                "WASD = Movimento\n" +
                "Spazio/Ctrl = Vola su/giù\n" +
                "E = Cattura Globe\n" +
                "Shift = Boost\n\n" +
                "Premi PLAY per testare!",
                "OK"
            );
        }

        private static void CreateInvisibleWall(Transform parent, Vector3 position, Vector3 scale)
        {
            GameObject wall = GameObject.CreatePrimitive(PrimitiveType.Cube);
            wall.name = "Boundary";
            wall.transform.SetParent(parent);
            wall.transform.position = position;
            wall.transform.localScale = scale;

            // Make invisible
            var renderer = wall.GetComponent<Renderer>();
            renderer.enabled = false;

            // Make static
            wall.isStatic = true;
        }

        [MenuItem("Sky Spheres/Setup Layers")]
        public static void SetupLayers()
        {
            Debug.Log("=== Configurazione Layers ===");
            Debug.Log("Vai manualmente in Edit > Project Settings > Tags and Layers");
            Debug.Log("Aggiungi:");
            Debug.Log("- Layer 8: Player");
            Debug.Log("- Layer 9: Enemy");
            Debug.Log("- Layer 10: RadiantGlobe");
            Debug.Log("- Layer 11: ScoreOrb");
            Debug.Log("- Layer 12: StrikeSphere");
            Debug.Log("- Layer 13: GoalRing");

            EditorUtility.DisplayDialog(
                "Setup Layers",
                "Vai manualmente in:\n\n" +
                "Edit > Project Settings > Tags and Layers\n\n" +
                "Aggiungi i seguenti layer:\n" +
                "- Layer 8: Player\n" +
                "- Layer 9: Enemy\n" +
                "- Layer 10: RadiantGlobe\n" +
                "- Layer 11: ScoreOrb\n" +
                "- Layer 12: StrikeSphere\n" +
                "- Layer 13: GoalRing",
                "OK"
            );
        }

        [MenuItem("Sky Spheres/About")]
        public static void About()
        {
            EditorUtility.DisplayDialog(
                "Sky Spheres - v1.0",
                "🎮 Mobile Fantasy Sports Game\n\n" +
                "Un gioco di sport aereo fantasy ispirato al Quidditch\n" +
                "ma con narrativa completamente originale.\n\n" +
                "Features:\n" +
                "- 4 Ruoli giocabili\n" +
                "- Destiny Hood system\n" +
                "- Controlli touch mobile\n" +
                "- Sistema di progressione\n\n" +
                "Documentazione: README.md",
                "OK"
            );
        }
#endif
    }
}
