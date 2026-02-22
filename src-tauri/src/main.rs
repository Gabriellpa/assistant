#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
                let _ = window.set_ignore_cursor_events(true);
                let _ = window.set_focusable(false);
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_text_capture,
            commands::start_selection_mode,
            commands::cancel_selection_mode,
            commands::set_interaction_mode,
            commands::send_to_ai,
            commands::save_api_key,
            commands::validate_api_key,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run app");
}
