using UnityEngine;
using TMPro;
using UnityEngine.SceneManagement;
public class DropDownCounter : MonoBehaviour
{
    public TMP_Dropdown TextMeshPro1;
    public int SceneIndex;
    public void ChangeSceneByIndex ()
    {
        SceneIndex = TextMeshPro1.value;
        SceneManager.LoadScene (SceneIndex);
    }
}
