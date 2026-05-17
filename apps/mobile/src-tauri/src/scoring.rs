use serde_json::Value;

// Tauri-side bridge for the LUMIRIS Iris V2 scoring algorithm (40/25/25/10 :
// Transparence · Savoir-faire · Impact · Réparabilité — cf. cahier §8).
//
// L'implémentation canonique vit dans @lumiris/core (TypeScript). Pour respecter
// la SSOT, cette commande NE réimplémente PAS l'algo en Rust : elle valide le
// JSON DPP entrant et le repasse au front, qui appelle `computeScore`. Garder la
// command côté Rust offre un point d'entrée natif stable pour de la télémétrie,
// du cache ou de la persistance offline futurs sans toucher à l'algo.
#[tauri::command]
pub fn compute_score(dpp_json: String) -> Result<Value, String> {
    serde_json::from_str::<Value>(&dpp_json).map_err(|e| format!("invalid DPP JSON: {e}"))
}
