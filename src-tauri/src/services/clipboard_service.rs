pub struct ClipboardService;

impl ClipboardService {
    pub fn read_text() -> Option<String> {
        let sample = "Texto capturado (simulado)".trim().to_string();
        if sample.is_empty() {
            None
        } else {
            Some(sample)
        }
    }
}
