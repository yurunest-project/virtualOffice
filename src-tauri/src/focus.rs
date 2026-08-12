use std::process::Command;

#[tauri::command]
pub fn run_shortcut(name: String) -> Result<(), String> {
    let output = Command::new("shortcuts")
        .arg("run")
        .arg(&name)
        .output()
        .map_err(|e| format!("Failed to run shortcut '{name}': {e}"))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!(
            "Shortcut '{name}' failed: {}",
            stderr.trim()
        ))
    }
}

#[tauri::command]
pub fn check_shortcuts_available() -> bool {
    Command::new("which")
        .arg("shortcuts")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}
