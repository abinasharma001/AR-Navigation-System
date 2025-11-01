using UnityEngine;
using UnityEngine.SceneManagement;

public class SceneChange : MonoBehaviour
{
    public string sceneName;
    public void ChangeSceneByName()
    {
        SceneManager.LoadScene(sceneName);
    }
    /*public void ChangeSceneByIndex(int index)
    {
        SceneManager.
    }*/

}