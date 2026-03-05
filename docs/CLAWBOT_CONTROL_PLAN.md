# Clawbot Control Plan

> Mission Control ↔ BaarliClaw Robotic Arm Integration Roadmap

## Overview

This document describes the command contract, safety architecture, telemetry
roadmap, and Supabase integration plan for controlling the **BaarliClaw**
robotic arm from the **Mission Control** dashboard.

---

## 1. Command Contract (v1)

All clawbot commands are expressed as versioned envelopes defined in
`src/types/clawbot.ts`:

```typescript
interface ClawbotCommand {
  contract_version: 1;           // increment on breaking changes
  payload: ClawbotCommandPayload; // discriminated union (see below)
  risk: ClawbotRisk;             // 'safe' | 'elevated' | 'critical'
}
```

### Supported Actions

| Action       | Description                                         | Default Risk |
|--------------|-----------------------------------------------------|--------------|
| `stop`       | Halt all motion. `emergency: true` = E-STOP.        | elevated / **critical** |
| `home`       | Return to predefined home / safe position.          | safe         |
| `move`       | Move to an absolute or relative (x, y, z) position. | elevated     |
| `grip`       | Set gripper position (0–100) with optional force cap. | elevated   |
| `set_speed`  | Set movement speed as % of maximum (1–100).         | safe / elevated |
| `set_mode`   | Switch operational mode (manual, auto, safe, maintenance). | safe / elevated |

The contract is **extensible**: add new actions by extending the discriminated
union in `ClawbotCommandPayload` and handling them in `validateClawbotCommand`.

### Validation

Commands are validated client-side before dispatch using
`validateClawbotCommand(payload)` (no external dependencies). Validation errors
are displayed inline in the `CommandSender` UI.

---

## 2. Safety Features

### 2.1 E-STOP

The `CommandSender` component exposes a prominent **🛑 E-STOP** button that:

- Sends `{ action: 'stop', emergency: true }` with `priority: 'critical'` and
  `risk: 'critical'`.
- Is available in all UI modes (structured and advanced JSON).
- Is disabled only when the dashboard is not connected to Supabase.

### 2.2 Approval Workflow

High-risk or destructive operations may be gated by the existing
`approval_requests` table and `ApprovalQueue` UI. The agent Python side raises
an `ApprovalRequest` row; Mission Control shows the request and waits for
operator approval before proceeding.

**Recommended future work:** automatically route all `critical`-risk commands
through the approval workflow before the agent executes them.

### 2.3 Deadman / Heartbeat

The `agentService` includes a 30-second heartbeat that pings `system_status`
and updates `isConnected`. If the heartbeat detects a Supabase error, the
dashboard marks itself disconnected and disables all command controls.

**Recommended future work:** implement a physical deadman switch on the agent
side that halts the arm if no heartbeat is received within a configurable
timeout (e.g. 60 s).

### 2.4 Speed Limits

`set_speed` commands with `speed_percent > 80` are automatically classified as
`elevated` risk rather than `safe`. The UI can be extended to prompt for
operator confirmation before sending.

---

## 3. How Mission Control Talks to the Agent

```
┌───────────────────┐          Supabase Realtime         ┌────────────────────┐
│  Mission Control  │ ─── INSERT into agent_commands ──► │  BaarliClaw Agent  │
│  (React + Vite)   │                                     │  (Python)          │
│                   │ ◄── INSERT into agent_responses ─── │                    │
│                   │ ◄── INSERT into activity_log ─────  │                    │
│                   │ ◄── UPDATE system_status ─────────  │                    │
└───────────────────┘                                     └────────────────────┘
```

1. **Dashboard sends a command** – `agentService.sendCommand()` inserts a row
   into `agent_commands` with the `ClawbotCommand` envelope serialised into
   `command_data`.

2. **Agent processes the command** – the Python agent subscribes to
   `agent_commands` via Supabase Realtime, picks up the new row, validates the
   `contract_version`, deserialises the payload, and executes it.

3. **Agent reports status** – the agent inserts into `agent_responses` and/or
   `activity_log`, and updates the relevant `system_status` row. Mission
   Control reflects this in real time.

4. **Approval gate** – if the agent determines that a command needs human
   approval it inserts into `approval_requests`. The `ApprovalQueue` component
   shows this and the operator can approve or reject.

---

## 4. Realtime Connection Robustness

`agentService.initRealtime()` was updated (see `src/services/agentService.ts`)
to:

- **Not** set `isConnected = true` eagerly at the start of `initRealtime()`.
- Set `isConnected = true` only after the **first** Supabase channel callback
  fires with `status === 'SUBSCRIBED'`.
- Call `store.setError()` and `store.setIsConnected(false)` when a channel
  fires `CHANNEL_ERROR`.
- `cleanup()` now explicitly calls `setIsConnected(false)` and clears the
  heartbeat interval.

---

## 5. Telemetry Roadmap

| Phase | Feature                                            | Priority |
|-------|----------------------------------------------------|----------|
| 1     | Position telemetry (x, y, z) via `system_status`  | High     |
| 1     | Gripper state (position, force) via `system_status` | High    |
| 2     | Joint angle readings                               | Medium   |
| 2     | Temperature / torque alerts                        | Medium   |
| 3     | Video feed embedded in Mission Control             | Low      |
| 3     | Motion history / audit trail                       | Low      |

Phase 1 can reuse the existing `system_status` table by adding metric keys
(`arm_x`, `arm_y`, `arm_z`, `gripper_position`, `gripper_force`) to the
`metrics` JSON column.

---

## 6. UI Command Modes

The `CommandSender` component (see `src/components/Agent/CommandSender.tsx`)
provides:

- **Structured mode** (default) – dropdown of supported actions with validated
  form inputs (no free-text JSON required).
- **Advanced JSON mode** – raw JSON textarea for power users and debugging.
- **E-STOP button** – always visible at the top of the panel.

---

## 7. Future Enhancements

- **Sequence / macro commands** – define named sequences (e.g. "pick and place
  cycle") stored in a `clawbot_macros` table and executed with a single click.
- **Soft limits** – configurable workspace bounds; commands outside the bounds
  are rejected client-side before they reach the agent.
- **Rate limiting** – prevent accidental command floods by throttling sends in
  `CommandSender`.
- **Role-based access** – separate "operator" (can send all commands) from
  "observer" (read-only) roles using Supabase Row Level Security.

---

*Last updated: 2026-03-05*
