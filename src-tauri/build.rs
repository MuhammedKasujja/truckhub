use std::{fs, path::Path};

/// Server env vars baked into the desktop binary at compile time and handed to
/// the bundled Nitro server at runtime. `SESSION_SECRET` is deliberately not
/// here: each install generates its own (see `lib.rs`).
const BAKED_ENV: &[&str] = &["BACKEND_URL", "JWT_SECRET", "GOOGLE_PLACES_API_KEY", "PUBLIC_APP_URL"];

fn main() {
  // `.env.production` wins over `.env`; a real environment variable wins over both.
  let mut values: Vec<(String, String)> = Vec::new();
  for file in ["../.env", "../.env.production"] {
    println!("cargo:rerun-if-changed={file}");
    let Ok(text) = fs::read_to_string(Path::new(file)) else { continue };
    for line in text.lines() {
      let line = line.trim();
      if line.is_empty() || line.starts_with('#') {
        continue;
      }
      let Some((key, value)) = line.split_once('=') else { continue };
      let key = key.trim().trim_start_matches("export ").trim();
      let value = value.trim().trim_matches('"').trim_matches('\'');
      values.retain(|(k, _)| k != key);
      values.push((key.to_string(), value.to_string()));
    }
  }

  for key in BAKED_ENV {
    println!("cargo:rerun-if-env-changed={key}");
    let value = std::env::var(key)
      .ok()
      .or_else(|| values.iter().find(|(k, _)| k == key).map(|(_, v)| v.clone()))
      .unwrap_or_default();
    println!("cargo:rustc-env=TRUCKHUB_{key}={value}");
  }

  tauri_build::build()
}
