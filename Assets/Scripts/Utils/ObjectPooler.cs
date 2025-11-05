using System.Collections.Generic;
using UnityEngine;

namespace SkySpheres.Utils
{
    /// <summary>
    /// Object Pooler - Sistema di pooling per ottimizzare performance
    /// Riutilizza oggetti invece di crearli/distruggerli continuamente
    /// </summary>
    public class ObjectPooler : MonoBehaviour
    {
        [System.Serializable]
        public class Pool
        {
            public string tag;
            public GameObject prefab;
            public int size;
        }

        public static ObjectPooler Instance;

        [SerializeField] private List<Pool> pools = new List<Pool>();
        private Dictionary<string, Queue<GameObject>> poolDictionary;

        private void Awake()
        {
            if (Instance != null && Instance != this)
            {
                Destroy(gameObject);
                return;
            }
            Instance = this;

            poolDictionary = new Dictionary<string, Queue<GameObject>>();

            foreach (Pool pool in pools)
            {
                Queue<GameObject> objectPool = new Queue<GameObject>();

                for (int i = 0; i < pool.size; i++)
                {
                    GameObject obj = Instantiate(pool.prefab);
                    obj.SetActive(false);
                    objectPool.Enqueue(obj);
                }

                poolDictionary.Add(pool.tag, objectPool);
            }
        }

        /// <summary>
        /// Spawna un oggetto dal pool
        /// </summary>
        public GameObject SpawnFromPool(string tag, Vector3 position, Quaternion rotation)
        {
            if (!poolDictionary.ContainsKey(tag))
            {
                Debug.LogWarning($"Pool with tag {tag} doesn't exist.");
                return null;
            }

            GameObject objectToSpawn = poolDictionary[tag].Dequeue();

            objectToSpawn.SetActive(true);
            objectToSpawn.transform.position = position;
            objectToSpawn.transform.rotation = rotation;

            IPooledObject pooledObj = objectToSpawn.GetComponent<IPooledObject>();
            pooledObj?.OnObjectSpawn();

            poolDictionary[tag].Enqueue(objectToSpawn);

            return objectToSpawn;
        }

        /// <summary>
        /// Ritorna un oggetto al pool
        /// </summary>
        public void ReturnToPool(string tag, GameObject obj)
        {
            obj.SetActive(false);

            IPooledObject pooledObj = obj.GetComponent<IPooledObject>();
            pooledObj?.OnObjectReturn();
        }
    }

    /// <summary>
    /// Interface per oggetti pooled
    /// </summary>
    public interface IPooledObject
    {
        void OnObjectSpawn();
        void OnObjectReturn();
    }
}
