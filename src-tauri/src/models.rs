use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    pub context: Context,
    pub messages: Vec<ChatMessage>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Context {
    pub id: String,
    pub r#type: String,
    pub content: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub text: Option<String>,
    pub timestamp: i64,
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
