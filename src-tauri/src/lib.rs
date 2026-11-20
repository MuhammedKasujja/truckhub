use std::{
  fs,
  net::{Ipv4Addr, SocketAddr, TcpListener, TcpStream},
  path::Path,
  sync::Mutex,
  thread,
  time::{Duration, Instant},
};

use tauri::{path::BaseDirectory, App, Manager, RunEvent, Url, WebviewUrl, WebviewWindowBuilder};
use tauri_plugin_shell::{process::CommandChild, process::CommandEvent, ShellExt};

/// The bundled Nitro server process, killed when the app exits.
#[derive(Default)]
struct ServerProcess(Mutex<Option<CommandChild>>);

const SERVER_START_TIMEOUT: Duration = Duration::from_secs(20);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    )
    .plugin(tauri_plugin_os::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .manage(ServerProcess::default())
    .setup(|app| {
      if cfg!(debug_assertions) {
        // `tauri dev` already runs the Vite dev server at `devUrl`.
        main_window(app, WebviewUrl::App("/".into()))?;
      } else {
        // Show the static splash page while the bundled server boots.
        main_window(app, WebviewUrl::App("index.html".into()))?;
        start_server(app)?;
      }
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application")
    .run(|app, event| {
      if let RunEvent::Exit = event {
        if let Some(child) = app.state::<ServerProcess>().0.lock().unwrap().take() {
          let _ = child.kill();
        }
      }
    });
}

fn main_window(app: &App, url: WebviewUrl) -> tauri::Result<()> {
  WebviewWindowBuilder::new(app, "main", url)
    .title("Truckhub")
    .inner_size(1280.0, 800.0)
    .min_inner_size(800.0, 600.0)
    .resizable(true)
    .build()?;
  Ok(())
}

/// Spawns the Nitro server (`.output/`, bundled as the `server-bundle/` resource) with the
/// Bun sidecar on a free localhost port, then points the main window at it. The entry
/// (`scripts/desktop-entry.mjs`) also opens a LAN gate on `CAPTURE_PORT` that lets a phone
/// on the same Wi-Fi reach only the phone-capture page.
fn start_server(app: &App) -> Result<(), Box<dyn std::error::Error>> {
  let entry = app.path().resolve("server-bundle/server/desktop-entry.mjs", BaseDirectory::Resource)?;
  let port = free_port(Ipv4Addr::LOCALHOST)?;
  let capture_port = free_port(Ipv4Addr::UNSPECIFIED)?;
  let session_secret = session_secret(&app.path().app_data_dir()?)?;

  let (mut events, child) = app
    .shell()
    .sidecar("bun")?
    .current_dir(entry.parent().unwrap_or(Path::new(".")))
    .arg(&entry)
    .envs([
      ("PORT", port.to_string()),
      ("CAPTURE_PORT", capture_port.to_string()),
      ("HOST", "127.0.0.1".into()),
      ("NODE_ENV", "production".into()),
      ("TRUCKHUB_DESKTOP", "1".into()),
      ("SESSION_SECRET", session_secret),
      ("BACKEND_URL", env!("TRUCKHUB_BACKEND_URL").into()),
      ("JWT_SECRET", env!("TRUCKHUB_JWT_SECRET").into()),
      ("GOOGLE_PLACES_API_KEY", env!("TRUCKHUB_GOOGLE_PLACES_API_KEY").into()),
    ])
    .spawn()?;
  *app.state::<ServerProcess>().0.lock().unwrap() = Some(child);

  tauri::async_runtime::spawn(async move {
    while let Some(event) = events.recv().await {
      match event {
        CommandEvent::Stdout(line) => log::info!("[server] {}", String::from_utf8_lossy(&line).trim_end()),
        CommandEvent::Stderr(line) => log::warn!("[server] {}", String::from_utf8_lossy(&line).trim_end()),
        CommandEvent::Error(err) => log::error!("[server] {err}"),
        CommandEvent::Terminated(status) => log::error!("[server] exited: {status:?}"),
        _ => {}
      }
    }
  });

  let handle = app.handle().clone();
  thread::spawn(move || {
    let Some(window) = handle.get_webview_window("main") else { return };
    if wait_for_port(port, SERVER_START_TIMEOUT) {
      let url = Url::parse(&format!("http://127.0.0.1:{port}/")).expect("valid url");
      if let Err(err) = window.navigate(url) {
        log::error!("failed to open app: {err}");
      }
    } else {
      log::error!("server did not start within {SERVER_START_TIMEOUT:?}");
      let _ = window.eval(
        "document.body.innerHTML = '<p>TruckHub could not start. Please restart the app.</p>'",
      );
    }
  });

  Ok(())
}

fn free_port(host: Ipv4Addr) -> std::io::Result<u16> {
  Ok(TcpListener::bind((host, 0))?.local_addr()?.port())
}

fn wait_for_port(port: u16, timeout: Duration) -> bool {
  let addr = SocketAddr::from((Ipv4Addr::LOCALHOST, port));
  let deadline = Instant::now() + timeout;
  while Instant::now() < deadline {
    if TcpStream::connect_timeout(&addr, Duration::from_millis(200)).is_ok() {
      return true;
    }
    thread::sleep(Duration::from_millis(100));
  }
  false
}

/// Per-install cookie encryption key, generated on first launch so it is never
/// shipped inside the binary. Kept across launches so sessions survive restarts.
fn session_secret(data_dir: &Path) -> Result<String, Box<dyn std::error::Error>> {
  let path = data_dir.join("session-secret");
  if let Ok(secret) = fs::read_to_string(&path) {
    let secret = secret.trim();
    if secret.len() >= 32 {
      return Ok(secret.to_string());
    }
  }

  let mut bytes = [0u8; 32];
  getrandom::fill(&mut bytes).map_err(|e| e.to_string())?;
  let secret: String = bytes.iter().map(|b| format!("{b:02x}")).collect();

  fs::create_dir_all(data_dir)?;
  fs::write(&path, &secret)?;
  Ok(secret)
}
