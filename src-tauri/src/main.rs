#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;

fn main() {
    tauri::Builder::default()
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
