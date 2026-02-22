use std::time::{SystemTime, UNIX_EPOCH};

use tauri::{AppHandle, Emitter, Manager};

use crate::models::{AIRequest, AIResponse, CapturePayload, ChatMessage, Context, ImageRef};
use crate::services::{
    clipboard_service::ClipboardService, hotkey_service::HotkeyService,
    security_service::SecurityService, window_manager::WindowManager,
};

fn now_ts() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs() as i64)
        .unwrap_or(0)
}

fn sample_image_ref(id: &str) -> ImageRef {
    ImageRef {
        id: id.to_string(),
        path: "/tmp/contextual-capture.png".to_string(),
        width: 640,
        height: 360,
    }
}

#[tauri::command]
pub fn start_text_capture(app: AppHandle) -> Result<String, String> {
    let _ = HotkeyService::primary_hotkey();
    let _ = WindowManager::show_overlay();

    let context = if let Some(text) = ClipboardService::read_text() {
        Context {
            id: "ctx-text-1".into(),
            r#type: "text".into(),
            content: Some(text),
            image: None,
            created_at: now_ts(),
        }
    } else {
        Context {
            id: "ctx-image-fallback-1".into(),
            r#type: "image".into(),
            content: None,
            image: Some(sample_image_ref("img-fallback-1")),
            created_at: now_ts(),
        }
    };

    let event_name = if context.r#type == "text" {
        "text_captured"
    } else {
        "image_captured"
    };

    app.emit(event_name, CapturePayload { context })
        .map_err(|e| e.to_string())?;

    Ok("preview_ready".into())
}

#[tauri::command]
pub fn start_selection_mode(app: AppHandle) -> Result<String, String> {
    let _ = HotkeyService::pen_hotkey();
    let _ = WindowManager::show_overlay();

    let context = Context {
        id: "ctx-image-pen-1".into(),
        r#type: "image".into(),
        content: None,
        image: Some(sample_image_ref("img-pen-1")),
        created_at: now_ts(),
    };

    app.emit("image_captured", CapturePayload { context })
        .map_err(|e| e.to_string())?;

    Ok("preview_ready".into())
}

#[tauri::command]
pub fn cancel_selection_mode(app: AppHandle) -> Result<String, String> {
    app.emit("capture_cancelled", "cancelled")
        .map_err(|e| e.to_string())?;
    Ok("idle".into())
}

#[tauri::command]
pub fn set_interaction_mode(app: AppHandle, interactive: bool) -> Result<bool, String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;

    window
        .set_ignore_cursor_events(!interactive)
        .map_err(|e| e.to_string())?;
    window
        .set_focusable(interactive)
        .map_err(|e| e.to_string())?;

    Ok(interactive)
}

#[tauri::command]
pub fn send_to_ai(request: AIRequest) -> Result<AIResponse, String> {
    if !SecurityService::has_valid_api_key() {
        return Err("missing_api_key".into());
    }

    let last_user_message = request
        .messages
        .iter()
        .rev()
        .find(|m| m.role == "user")
        .and_then(|m| m.text.clone())
        .unwrap_or_else(|| "Sem mensagem".into());

    Ok(AIResponse {
        message: ChatMessage {
            role: "assistant".into(),
            text: Some(format!("Resposta simulada (v1): {}", last_user_message)),
            image: None,
            timestamp: now_ts(),
        },
        error: None,
    })
}

#[tauri::command]
pub fn save_api_key(key: String) -> Result<bool, String> {
    Ok(SecurityService::save_api_key(&key))
}

#[tauri::command]
pub fn validate_api_key() -> Result<bool, String> {
    Ok(SecurityService::has_valid_api_key())
}
