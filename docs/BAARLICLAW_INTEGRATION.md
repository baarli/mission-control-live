# BaarliClaw 2-Veis Kommunikasjon

Mission Control har nå full 2-veis kommunikasjon med BaarliClaw AI-agent.

## Arkitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Mission Control                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ AgentStatus  │  │   Command    │  │    Task      │     │
│  │    Card      │  │   Sender     │  │    List      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │   Approval   │  │  Activity    │                        │
│  │    Queue     │  │     Log      │                        │
│  └──────────────┘  └──────────────┘                        │
└──────────────────────────┬──────────────────────────────────┘
                           │ Realtime WebSocket
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Supabase                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │agent_commands│ │agent_response│ │approval_reque│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │ system_status│ │ activity_log │ │  agent_config│        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      BaarliClaw                             │
│                    (AI Agent)                               │
└─────────────────────────────────────────────────────────────┘
```

## Funksjoner

### 1. 🤖 Agent Kontroll Panel
- Sanntidsstatus for BaarliClaw
- Health score med progress bar
- Aktiv oppgave med fremdrift
- Siste sjekk-tidspunkt

### 2. 📤 Kommandosender
- Velg kommando-type (task/query/system/approval)
- Sett prioritet (low/medium/high/critical)
- JSON data input med validering
- Send-knapp med loading state

### 3. 📋 Oppgaveliste
- Viser alle kommandoer fra `agent_commands`
- Filtrer etter status (pending/processing/completed/failed)
- Viser prioritet med fargekoding
- Sortert etter tid (nyeste først)

### 4. ⏸️ Godkjenningskø
- Henter fra `approval_requests`
- Viser risiko-nivå (low/medium/high)
- [Godkjenn]/[Avslå] knapper
- Oppdaterer status i sanntid

### 5. 📜 Aktivitetslogg
- Henter fra `activity_log`
- Filtrer etter nivå (debug/info/success/warning/error)
- Viser tid, kategori, melding, detaljer
- Auto-scroll til nyeste

### 6. 🔄 Realtime Subscriptions
Alle tabeller har realtime subscriptions:
- `agent_commands` - Nye/endrede kommandoer
- `agent_responses` - Nye svar fra BaarliClaw
- `approval_requests` - Nye godkjenningsbehov
- `system_status` - Statusendringer
- `activity_log` - Nye loggoppføringer

## Database Tabeller

### agent_commands
```sql
create table agent_commands (
  id uuid default gen_random_uuid() primary key,
  command_type text not null, -- task, query, system, approval
  command_data jsonb not null,
  status text default 'pending', -- pending, processing, completed, failed
  priority text default 'medium', -- low, medium, high, critical
  created_at timestamp default now(),
  updated_at timestamp
);
```

### agent_responses
```sql
create table agent_responses (
  id uuid default gen_random_uuid() primary key,
  command_id uuid references agent_commands(id),
  response_type text not null, -- success, error, partial, progress
  response_data jsonb not null,
  created_at timestamp default now()
);
```

### approval_requests
```sql
create table approval_requests (
  id uuid default gen_random_uuid() primary key,
  request_type text not null,
  title text not null,
  description text not null,
  risk_level text default 'medium', -- low, medium, high
  status text default 'pending', -- pending, approved, rejected
  metadata jsonb,
  created_at timestamp default now(),
  resolved_at timestamp
);
```

### system_status
```sql
create table system_status (
  id uuid default gen_random_uuid() primary key,
  system_name text not null,
  status text not null, -- healthy, degraded, unhealthy, offline
  health_score integer default 100, -- 0-100
  last_check timestamp default now(),
  metrics jsonb,
  current_task text,
  progress_percent integer
);
```

### activity_log
```sql
create table activity_log (
  id uuid default gen_random_uuid() primary key,
  level text not null, -- debug, info, success, warning, error
  category text not null, -- system, agent, user, api, task
  message text not null,
  details jsonb,
  created_at timestamp default now()
);
```

## API Service

### agentService

```typescript
// Initialiser realtime subscriptions
await agentService.initRealtime();

// Send kommando
const commandId = await agentService.sendCommand(
  'task',           // type
  { action: '...' }, // data
  'high'            // priority
);

// Godkjenn/avslå
await agentService.respondToApproval(id, 'approved');
await agentService.respondToApproval(id, 'rejected');

// Rydd opp
agentService.cleanup();
```

## Keyboard Shortcuts

| Shortcut | Handling |
|----------|----------|
| `Ctrl+K` | Åpne søk |
| `Ctrl+D` | Gå til dashboard |
| `Ctrl+S` | Gå til saksliste |
| `Ctrl+Shift+A` | Gå til Agent Control |
| `Escape` | Tilbake til dashboard |

## State Management (Zustand)

```typescript
const {
  // Commands
  commands,
  addCommand,
  updateCommand,
  
  // Responses
  responses,
  addResponse,
  
  // Approvals
  approvalRequests,
  pendingApprovalsCount,
  updateApproval,
  
  // System Status
  systemStatus,
  getAgentStatus,
  
  // Activity Log
  activityLogs,
  addActivityLog,
  
  // Connection
  isConnected,
} = useAgentStore();
```

## Komponenter

| Komponent | Fil | Beskrivelse |
|-----------|-----|-------------|
| AgentStatusCard | `AgentStatusCard.tsx` | Status-kort med health score |
| CommandSender | `CommandSender.tsx` | Send kommandoer til agent |
| TaskList | `TaskList.tsx` | Liste over oppgaver |
| ApprovalQueue | `ApprovalQueue.tsx` | Godkjenningskø |
| ActivityLog | `ActivityLog.tsx` | Aktivitetslogg |
| ConnectionIndicator | `ConnectionIndicator.tsx` | Online/offline indikator |
| AgentSection | `Dashboard/AgentSection.tsx` | Hovedseksjon |

## Filstruktur

```
src/
├── components/
│   └── Agent/
│       ├── ActivityLog.tsx (82 lines)
│       ├── AgentStatusCard.tsx (63 lines)
│       ├── ApprovalQueue.tsx (104 lines)
│       ├── CommandSender.tsx (99 lines)
│       ├── ConnectionIndicator.tsx (31 lines)
│       ├── TaskList.tsx (68 lines)
│       ├── index.ts
│       ├── styles.css
│       └── styles.module.css
├── Dashboard/
│   └── AgentSection.tsx
├── services/
│   └── agentService.ts (248 lines)
├── stores/
│   └── agentStore.ts (96 lines)
├── types/
│   └── agent.ts (190 lines)
└── hooks/
    └── useKeyboardShortcuts.ts (87 lines)
```

## Installasjon

Ingen ekstra avhengigheter nødvendig - bruker eksisterende:
- `@supabase/supabase-js` - Realtime database
- `zustand` - State management
- React - Komponenter

## Sikkerhet

- Row Level Security (RLS) må aktiveres i Supabase
- API-nøkler skal ikke committes (bruk .env)
- Godkjenningskø for kritiske operasjoner

## Neste Steg

1. Aktiver RLS policies i Supabase
2. Konfigurer BaarliClaw til å lese fra `agent_commands`
3. Sett opp webhook for eksterne notifikasjoner
4. Legg til audit logging

---

Sist oppdatert: 4. mars 2026
