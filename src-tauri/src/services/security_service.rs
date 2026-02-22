use std::sync::{Mutex, OnceLock};

pub struct SecurityService;

static ENCRYPTED_KEY: OnceLock<Mutex<Option<String>>> = OnceLock::new();

impl SecurityService {
    pub fn save_api_key(raw_key: &str) -> bool {
        let encrypted = raw_key.chars().rev().collect::<String>();
        let store = ENCRYPTED_KEY.get_or_init(|| Mutex::new(None));
        if let Ok(mut guard) = store.lock() {
            *guard = Some(encrypted);
            return true;
        }
        false
    }

    pub fn has_valid_api_key() -> bool {
        let store = ENCRYPTED_KEY.get_or_init(|| Mutex::new(None));
        if let Ok(guard) = store.lock() {
            return guard.as_deref().is_some_and(|v| !v.trim().is_empty());
        }
        false
    }
}
