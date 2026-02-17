## Demo video script – Issue #1301 (MCP Apps & MCP resource proxy)

### 0. Intro (10–15 seconds)

**On screen**
- Show Cursor/VS Code with the `archestra` repo open.
- Switch to the browser with the main Archestra UI loaded.

**Narration**
- “In this demo I’ll show the new MCP Apps support in Archestra: how MCP tool metadata is preserved, how MCP App UI resources are proxied and rendered safely, and how they appear directly in chat.”

---

### 1. MCP Apps in the catalog (20–30 seconds)

**On screen**
- Go to `http://localhost:3000/mcp-catalog`.
- Search for `excalidraw-mcp` and `n8n-mcp`.
- Click one of them to show the catalog entry details.

**Narration**
- “First, we seed recommended MCP Apps into the catalog, including `excalidraw-mcp` and `n8n-mcp`. This happens via a backend seeding function so these apps are available by default in dev and CI.”

---

### 2. MCP tool metadata with `_meta.ui.resourceUri` (30–45 seconds)

**On screen**
- Open browser devtools → Network tab.
- Navigate to an agent that has MCP tools enabled.
- Trigger the view that loads MCP tools (e.g. open the agent’s MCP tools panel).
- In Network, select `GET /api/chat/agents/:agentId/mcp-tools`.
- Expand one MCP App tool in the JSON to show `_meta.ui.resourceUri`.

**Narration**
- “When the frontend loads MCP tools for an agent, the backend now preserves the `_meta` field from the MCP server. Here you can see a tool with `_meta.ui.resourceUri`, which follows the MCP Apps spec and points to the UI resource we’ll render in chat.”

---

### 3. MCP App resource proxy endpoint (30–45 seconds)

**On screen**
- Keep devtools Network tab open.
- In chat, open a conversation that can use the MCP App (e.g. Excalidraw).
- Run the MCP App tool so the UI loads.
- In Network, highlight `GET /api/chat/agents/:agentId/mcp-app-resource?uri=ui://…`.
- Show the response body briefly (HTML).

**Narration**
- “To render that HTML safely, the frontend calls a new backend proxy endpoint: `/api/chat/agents/:agentId/mcp-app-resource`. The server validates that the `ui://` resource belongs to a tool assigned to this agent, resolves the MCP server and catalog entry, and then uses the MCP client’s `connectAndReadResource` helper to fetch the HTML. The browser never talks directly to the remote MCP App origin.”

---

### 4. MCP App frame embedded in chat (45–60 seconds)

**On screen**
- Focus the chat UI.
- Show the message containing the embedded MCP App iframe.
- Interact briefly with the app (e.g. draw a quick shape in Excalidraw).

**Narration**
- “In chat, MCP Apps now render inline in an `McpAppFrame` component. Once the HTML is loaded, the host sends the initial tool result into the iframe with `postMessage` using the MCP Apps protocol. This gives you a fully interactive app experience directly inside the conversation.”

---

### 5. Security: sandboxing and `postMessage` (30–45 seconds)

**On screen**
- Switch back to Cursor/VS Code.
- Open `frontend/src/components/chat/mcp-app-frame.tsx`.
- Highlight:
  - The iframe with `sandbox="allow-scripts"`.
  - The `postMessage` call using `targetOrigin: "*"` and the comment about opaque origin.

**Narration**
- “The iframe is explicitly sandboxed with `allow-scripts` only. We do **not** use `allow-same-origin`, so the MCP App HTML runs with an opaque origin and cannot read parent DOM, cookies, or storage. The only way it receives data is via our explicit `postMessage` call from the host. This keeps remote MCP Apps isolated while still allowing rich UI.”

---

### 6. MCP Gateway `resources/read` support (30–45 seconds)

**On screen**
- In Cursor/VS Code, open `backend/src/routes/mcp-gateway.utils.ts`.
- Scroll to the `ReadResourceRequestSchema` handler.
- Briefly show:
  - Lookup of the tool by `meta.ui.resourceUri`.
  - Call to `mcpClient.connectAndReadResource`.
  - Returning `contents` back to the caller.

**Narration**
- “For external MCP clients using the MCP Gateway, we also expose `resources/read`. The gateway finds the tool whose metadata matches the requested `ui://` URI, resolves the MCP server and secrets, and again calls `connectAndReadResource`. The gateway then returns the contents back to the MCP client. So both the chat UI and third‑party MCP clients use the same resource path.”

---

### 7. Wrap‑up (10–15 seconds)

**On screen**
- Return to chat with the MCP App iframe visible.
- Optionally zoom out to show both chat and Network devtools.

**Narration**
- “To summarize: this change adds first‑class MCP Apps support in Archestra. Tool metadata with `_meta.ui` is preserved, UI resources are fetched through a secure backend proxy, and apps render inline in chat inside a strict sandbox. The same resource path is also available through the MCP Gateway `resources/read` method. This is what you’re seeing working end‑to‑end in this demo.”

