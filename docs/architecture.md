# Arima Architecture

Phase 1 establishes the secure application skeleton. It does not implement media analysis,
downloads, persistence, playback, packaged binaries, or updates.

## Component Boundaries

```mermaid
flowchart TD
    Renderer["React renderer"]
    Preload["Sandboxed preload API"]
    Ipc["Main IPC handlers"]
    Services["Application services"]
    Repositories["SQLite repositories"]
    Storage["File storage"]
    Engine["Media engine adapter"]
    Tools["Bundled tools"]

    Renderer --> Preload --> Ipc --> Services
    Services --> Repositories
    Services --> Storage
    Services --> Engine --> Tools
```

- Renderer code owns presentation only and cannot access Node, Electron, files, processes, or SQLite.
- Preload exposes named validated methods under `window.arima`.
- Main process owns privileged capabilities, validates senders, and composes services.
- Repositories, storage, media-engine, and tool adapters are introduced in later phases.

## Analysis Flow

```mermaid
sequenceDiagram
    participant UI as Renderer
    participant Bridge as Preload
    participant Main as Main IPC
    participant Analyzer as MediaAnalyzer
    participant Engine as MediaEngine

    UI->>Bridge: analysis.start(url)
    Bridge->>Main: validated IPC request
    Main->>Analyzer: create analysis session
    Analyzer->>Engine: request metadata only
    Engine-->>Analyzer: normalized result
    Analyzer-->>Main: persisted analysis result
    Main-->>Bridge: Result<Analysis>
    Bridge-->>UI: typed response
```

Phase 1 implements only the IPC pattern with `app.getInfo`; analysis is documented here so later
phases keep provider behavior behind service and adapter boundaries.

## Lifecycle

```mermaid
sequenceDiagram
    participant App as Electron app
    participant Main as Main bootstrap
    participant Window as BrowserWindow
    participant Preload as Preload
    participant UI as Renderer

    App->>Main: ready
    Main->>Main: register protocols and IPC
    Main->>Window: create secure BrowserWindow
    Window->>Preload: load sandboxed preload
    Window->>UI: load local renderer
    UI->>Preload: app.getInfo()
    Preload->>Main: app:get-info
    Main-->>Preload: Result<AppInfo>
    Preload-->>UI: validated result
```

## Entity Direction

```mermaid
erDiagram
    SETTINGS ||--o{ DOWNLOADS : configures
    COLLECTIONS ||--o{ COLLECTION_ITEMS : contains
    MEDIA_ITEMS ||--o{ COLLECTION_ITEMS : appears_in
    MEDIA_ITEMS ||--o| PLAYBACK_PROGRESS : tracks
    STORAGE_ROOTS ||--o{ MEDIA_ITEMS : stores
    DOWNLOADS ||--o| MEDIA_ITEMS : registers
```

The database is designed in Phase 1 and initialized in Phase 2. SQLite remains in Electron
`userData`; media files are stored under approved roots owned by the main process.
