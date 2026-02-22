#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod models;
mod services;

use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

fn main() {
    tauri::Builder::default()
        .manage(commands::OverlayState {
            interactive: Mutex::new(false),
        })
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                // Enforce HUD style at runtime (avoids platform-specific config drift in dev/prod).
                let _ = commands::apply_interaction_mode(&window, false);
            }

            let toggle_item = MenuItem::with_id(
                app,
                "toggle_interaction",
                "Alternar interação",
                true,
                None::<&str>,
            )?;
            let show_item = MenuItem::with_id(
                app,
                "show_core",
                "Mostrar core (interativo)",
                true,
                None::<&str>,
            )?;
            let quit_item = MenuItem::with_id(app, "quit", "Sair", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&toggle_item, &show_item, &quit_item])?;

            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(|app, event| {
                    let Some(window) = app.get_webview_window("main") else {
                        return;
                    };

                    match event.id().as_ref() {
                        "toggle_interaction" => {
                            let mut interactive = false;
                            if let Some(state) = app.try_state::<commands::OverlayState>() {
                                if let Ok(guard) = state.interactive.lock() {
                                    interactive = !*guard;
                                }
                            }

                            let _ = commands::apply_interaction_mode(&window, interactive);
                            if let Some(state) = app.try_state::<commands::OverlayState>() {
                                if let Ok(mut guard) = state.interactive.lock() {
                                    *guard = interactive;
                                }
                            }
                        }
                        "show_core" => {
                            let _ = window.show();
                            let _ = commands::apply_interaction_mode(&window, true);
                            let _ = window.set_focus();
                            if let Some(state) = app.try_state::<commands::OverlayState>() {
                                if let Ok(mut guard) = state.interactive.lock() {
                                    *guard = true;
                                }
                            }
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

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
