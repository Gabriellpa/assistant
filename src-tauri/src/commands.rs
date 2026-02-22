use crate::models::{AIRequest, AIResponse, ChatMessage};

#[tauri::command]
pub fn start_text_capture() -> Result<String, String> {
    Ok("capturing_text".into())
}

#[tauri::command]
pub fn start_selection_mode() -> Result<String, String> {
    Ok("capturing_image".into())
}

#[tauri::command]
pub fn send_to_ai(_request: AIRequest) -> Result<AIResponse, String> {
    Ok(AIResponse {
        message: ChatMessage {
            role: "assistant".into(),
            text: Some("Stub da Fase 1: integração com provider será feita na Fase 3".into()),
            timestamp: 0,
        },
        error: None,
    })
}

#[tauri::command]
pub fn save_api_key(_key: String) -> Result<bool, String> {
    Ok(true)
}

#[tauri::command]
pub fn validate_api_key() -> Result<bool, String> {
    Ok(false)
}
