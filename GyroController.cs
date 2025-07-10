using UnityEngine;

public class GyroController : MonoBehaviour
{
    private Gyroscope _gyro;
    private bool _gyroEnabled;

    void Start()
    {
        // Check if the device supports a gyroscope
        if (SystemInfo.supportsGyroscope)
        {
            _gyro = Input.gyro;
            _gyro.enabled = false; // Start disabled by default
            _gyroEnabled = false;
            Debug.Log("Gyroscope is supported on this device.");
        }
        else
        {
            Debug.LogWarning("Gyroscope is not supported on this device.");
        }
    }

    // Call this function to ENABLE the gyroscope
    public void EnableGyro()
    {
        if (!SystemInfo.supportsGyroscope) return;

        if (!_gyroEnabled)
        {
            _gyro.enabled = true;
            _gyroEnabled = true;
            Debug.Log("Gyroscope ENABLED.");
        }
    }

    // Call this function to DISABLE the gyroscope
    public void DisableGyro()
    {
        if (!SystemInfo.supportsGyroscope) return;

        if (_gyroEnabled)
        {
            _gyro.enabled = false;
            _gyroEnabled = false;
            Debug.Log("Gyroscope DISABLED.");
        }
    }

    // Example: Get the current gyro rotation (read-only)
    public Quaternion GetGyroRotation()
    {
        if (_gyroEnabled)
        {
            return _gyro.attitude;
        }
        return Quaternion.identity;
    }

    // Optional: Reset gyro calibration (if needed)
    public void ResetGyroCalibration()
    {
        if (_gyroEnabled)
        {
            Input.gyro.enabled = false;
            Input.gyro.enabled = true;
            Debug.Log("Gyroscope recalibrated.");
        }
    }
}