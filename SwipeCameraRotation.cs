using UnityEngine;

public class SwipeCameraRotation : MonoBehaviour
{
    public float rotationSpeed = 0.2f; // Adjust for sensitivity
    private Vector2 startTouchPosition;
    private Vector2 currentTouchPosition;
    private bool isDragging = false;

    void Update()
    {
#if UNITY_EDITOR
        HandleMouseInput();
#else
        HandleTouchInput();
#endif
    }

    void HandleMouseInput()
    {
        if (Input.GetMouseButtonDown(0))
        {
            isDragging = true;
            startTouchPosition = Input.mousePosition;
        }

        if (Input.GetMouseButtonUp(0))
        {
            isDragging = false;
        }

        if (isDragging)
        {
            currentTouchPosition = Input.mousePosition;
            float deltaX = currentTouchPosition.x - startTouchPosition.x;

            transform.Rotate(0f, -deltaX * rotationSpeed, 0f, Space.World);
            startTouchPosition = currentTouchPosition;
        }
    }

    void HandleTouchInput()
    {
        if (Input.touchCount == 1)
        {
            Touch touch = Input.GetTouch(0);

            if (touch.phase == TouchPhase.Began)
            {
                isDragging = true;
                startTouchPosition = touch.position;
            }

            if (touch.phase == TouchPhase.Moved && isDragging)
            {
                currentTouchPosition = touch.position;
                float deltaX = currentTouchPosition.x - startTouchPosition.x;

                transform.Rotate(0f, -deltaX * rotationSpeed, 0f, Space.World);
                startTouchPosition = currentTouchPosition;
            }

            if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled)
            {
                isDragging = false;
            }
        }
    }
}
