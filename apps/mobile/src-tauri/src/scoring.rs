use serde_json::Value;

// Tauri-side bridge for the LUMIRIS 50/30/20 scoring algorithm.
//
// The canonical implementation lives in `@lumiris/core` (TypeScript). To respect
// the single-source-of-truth rule, this command does NOT re-implement the
// algorithm in Rust. It validates the DPP payload and hands it back to the JS
// layer, which then calls `computeScore` from `@lumiris/core`. Keeping the
// command on the Rust side gives us a stable native entry point that can later
// gain telemetry, caching, or offline persistence without touching the algo.
#[tauri::command]
pub fn compute_score(dpp_json: String) -> Result<Value, String> {
    serde_json::from_str::<Value>(&dpp_json).map_err(|e| format!("invalid DPP JSON: {e}"))
}
