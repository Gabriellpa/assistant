use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ImageRef {
    pub id: String,
    pub path: String,
    pub width: u32,
    pub height: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Context {
    pub id: String,
    pub r#type: String,
    pub content: Option<String>,
    pub image: Option<ImageRef>,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub text: Option<String>,
    pub image: Option<ImageRef>,
    pub timestamp: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub context: Option<Context>,
    pub messages: Vec<ChatMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    pub message: ChatMessage,
    pub error: Option<AIError>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIError {
    pub code: String,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CapturePayload {
    pub context: Context,
}
