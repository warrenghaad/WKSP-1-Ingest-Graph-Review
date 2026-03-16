# STUDIO UI - DETAILED SPECIFICATIONS
## Research & Curation Interface for Unknown Civilizations

---

## OVERVIEW

The Studio is a web-based interface for:
1. Ingesting new content (URLs, files, notes)
2. Querying LLMs for research
3. Curating and tagging content
4. Building knowledge graph
5. Reviewing and approving

All panels communicate via REST API with the backend (server.js + dao.js).

---

## FILE 1: studio-dashboard.html

### Purpose
Main hub - navigation, status overview, quick actions

### Layout Structure

```
┌─────────────────────────────────────────────┐
│  HEADER: Logo, User, Settings              │
├──────────┬──────────────────────────────────┤
│          │                                  │
│  SIDEBAR │       MAIN CONTENT AREA          │
│          │                                  │
│  - Dash  │  Stats Cards                     │
│  - Ingest│  Recent Activity                 │
│  - Resrch│  Quick Actions                   │
│  - Curate│  System Status                   │
│  - Graph │                                  │
│  - Code  │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mesopotamia Studio - Dashboard</title>
  <style>
    /* Modern, clean design */
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, sans-serif; background: #f8f9fa; }

    /* Header */
    .header {
      background: white;
      border-bottom: 1px solid #e9ecef;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Sidebar */
    .sidebar {
      position: fixed;
      left: 0;
      top: 60px;
      bottom: 0;
      width: 250px;
      background: white;
      border-right: 1px solid #e9ecef;
      padding: 20px 0;
    }

    .nav-item {
      padding: 12px 24px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .nav-item:hover { background: #f8f9fa; }
    .nav-item.active { background: #e7f0ff; border-left: 3px solid #0066cc; }

    /* Main content */
    .main-content {
      margin-left: 250px;
      padding: 24px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }

    .stat-label { font-size: 14px; color: #6c757d; margin-bottom: 8px; }
    .stat-value { font-size: 32px; font-weight: 600; color: #212529; }

    /* Quick actions */
    .quick-actions {
      display: flex;
      gap: 12px;
      margin: 20px 0;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #0066cc;
      color: white;
    }

    .btn-primary:hover { background: #0052a3; }

    /* Activity feed */
    .activity-feed {
      background: white;
      border-radius: 8px;
      padding: 24px;
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      padding: 12px 0;
      border-bottom: 1px solid #e9ecef;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏛️ Mesopotamia Studio</h1>
    <div class="header-actions">
      <button class="btn btn-primary" onclick="loadPanel('ingestion')">
        + New Ingestion
      </button>
    </div>
  </div>

  <nav class="sidebar">
    <div class="nav-item active" onclick="loadPanel('dashboard')">
      📊 Dashboard
    </div>
    <div class="nav-item" onclick="loadPanel('ingestion')">
      📥 Ingestion Hub
    </div>
    <div class="nav-item" onclick="loadPanel('research')">
      🔬 Research Panel
    </div>
    <div class="nav-item" onclick="loadPanel('curation')">
      ✨ Curation Studio
    </div>
    <div class="nav-item" onclick="loadPanel('graph')">
      🕸️ Knowledge Graph
    </div>
    <div class="nav-item" onclick="loadPanel('code')">
      💻 Meta Layer
    </div>
  </nav>

  <main class="main-content" id="main-content">
    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-label">Content Items</div>
        <div class="stat-value" id="stat-content-items">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Graph Nodes</div>
        <div class="stat-value" id="stat-graph-nodes">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Sources</div>
        <div class="stat-value" id="stat-sources">-</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Media Assets</div>
        <div class="stat-value" id="stat-media">-</div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="quick-actions">
      <button class="btn btn-primary" onclick="quickAction('ingestURL')">
        Ingest URL
      </button>
      <button class="btn btn-primary" onclick="quickAction('queryLLM')">
        Query LLM
      </button>
      <button class="btn btn-primary" onclick="quickAction('createLesson')">
        Create Lesson
      </button>
    </div>

    <!-- Recent Activity -->
    <div class="activity-feed">
      <h3>Recent Activity</h3>
      <div id="activity-list">
        <!-- Populated by JavaScript -->
      </div>
    </div>
  </main>

  <script>
    // API base URL
    const API_BASE = 'http://localhost:3001/api';

    // Load stats on page load
    async function loadStats() {
      try {
        // Fetch stats from API
        const [contentItems, graphNodes, sources, media] = await Promise.all([
          fetch(`${API_BASE}/content-items/count`).then(r => r.json()),
          fetch(`${API_BASE}/graph-nodes/count`).then(r => r.json()),
          fetch(`${API_BASE}/sources/count`).then(r => r.json()),
          fetch(`${API_BASE}/media-assets/count`).then(r => r.json())
        ]);

        document.getElementById('stat-content-items').textContent = contentItems.count || 0;
        document.getElementById('stat-graph-nodes').textContent = graphNodes.count || 0;
        document.getElementById('stat-sources').textContent = sources.count || 0;
        document.getElementById('stat-media').textContent = media.count || 0;
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    }

    // Load panel
    function loadPanel(panelName) {
      // Update active nav
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
      });
      event.target.classList.add('active');

      // Load panel content
      const panels = {
        dashboard: 'studio-dashboard.html',
        ingestion: 'ingestion-review.html',
        research: 'research-assistant-panel.html',
        curation: 'curation-studio.html',
        graph: 'knowledge-graph-viewer.html',
        code: 'meta-code-editor.html'
      };

      const targetURL = panels[panelName];
      if (targetURL) {
        window.location.href = targetURL;
      }
    }

    // Quick actions
    function quickAction(action) {
      switch (action) {
        case 'ingestURL':
          loadPanel('ingestion');
          break;
        case 'queryLLM':
          loadPanel('research');
          break;
        case 'createLesson':
          // Open lesson editor
          window.open('lesson-editor.html', '_blank');
          break;
      }
    }

    // Initialize on page load
    loadStats();
    setInterval(loadStats, 30000); // Refresh every 30 seconds
  </script>
</body>
</html>
```

### API Endpoints Needed

```javascript
// Add to server.js

// Get counts for dashboard
app.get('/api/content-items/count', async (req, res) => {
  const { data } = await supabase.from('content_items').select('id', { count: 'exact' });
  res.json({ count: data?.length || 0 });
});

app.get('/api/graph-nodes/count', async (req, res) => {
  const { data } = await supabase.from('graph_nodes').select('id', { count: 'exact' });
  res.json({ count: data?.length || 0 });
});

// Similar for sources, media-assets
```

---

## FILE 2: research-assistant-panel.html

### Purpose
Query LLMs (Claude, Perplexity) with source-cited note saving

### Features
1. Text input for questions
2. LLM provider selection (Claude/Perplexity)
3. Source-cited response display
4. Save as Source to database
5. Tag extraction
6. Link to graph nodes

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Research Assistant</title>
  <style>
    /* Include similar base styles from dashboard */
    .research-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .query-box {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    textarea {
      width: 100%;
      min-height: 120px;
      padding: 12px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-family: inherit;
      font-size: 14px;
      resize: vertical;
    }

    .provider-select {
      display: flex;
      gap: 12px;
      margin: 20px 0;
    }

    .provider-btn {
      flex: 1;
      padding: 12px;
      border: 2px solid #dee2e6;
      background: white;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .provider-btn.active {
      border-color: #0066cc;
      background: #e7f0ff;
    }

    .response-box {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-top: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .citation {
      background: #f8f9fa;
      padding: 12px;
      border-left: 4px solid #0066cc;
      margin: 16px 0;
      font-size: 13px;
    }

    .save-actions {
      display: flex;
      gap: 12px;
      margin-top: 20px;
    }

    .tag-input {
      margin-top: 20px;
    }

    .tag {
      display: inline-block;
      background: #e7f0ff;
      padding: 4px 12px;
      border-radius: 16px;
      margin: 4px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="research-container">
    <h1>🔬 Research Assistant</h1>
    <p>Query LLMs to research new civilizations, gather sources, and build knowledge.</p>

    <div class="query-box">
      <label for="research-query"><strong>Your Question:</strong></label>
      <textarea id="research-query" placeholder="Example: What geometric patterns appear in Polynesian art?"></textarea>

      <div class="provider-select">
        <button class="provider-btn active" data-provider="claude" onclick="selectProvider('claude')">
          🤖 Claude (Deep Analysis)
        </button>
        <button class="provider-btn" data-provider="perplexity" onclick="selectProvider('perplexity')">
          🔍 Perplexity (Web Research)
        </button>
      </div>

      <button class="btn btn-primary" onclick="executeQuery()">
        🔬 Research
      </button>
    </div>

    <div id="response-container" style="display: none;">
      <div class="response-box">
        <h3>Response:</h3>
        <div id="response-text"></div>

        <div id="citations-list"></div>

        <div class="tag-input">
          <label><strong>Extract Tags:</strong></label>
          <div id="suggested-tags"></div>
          <input type="text" id="manual-tag" placeholder="Add custom tag...">
          <button onclick="addTag()">+ Add</button>
        </div>

        <div class="save-actions">
          <button class="btn btn-primary" onclick="saveAsSource()">
            💾 Save as Source
          </button>
          <button class="btn" onclick="createGraphNodes()">
            🕸️ Create Graph Nodes
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const API_BASE = 'http://localhost:3001/api';
    let currentProvider = 'claude';
    let currentResponse = null;

    function selectProvider(provider) {
      currentProvider = provider;
      document.querySelectorAll('.provider-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.provider === provider);
      });
    }

    async function executeQuery() {
      const query = document.getElementById('research-query').value;
      if (!query.trim()) {
        alert('Please enter a question');
        return;
      }

      // Show loading
      const container = document.getElementById('response-container');
      container.style.display = 'block';
      document.getElementById('response-text').innerHTML = '<p>🔄 Researching...</p>';

      try {
        // Call API
        const response = await fetch(`${API_BASE}/research/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            provider: currentProvider
          })
        });

        const result = await response.json();
        currentResponse = result;

        // Display response
        document.getElementById('response-text').innerHTML = result.answer;

        // Display citations
        if (result.citations && result.citations.length > 0) {
          const citationsHTML = result.citations.map(cite => `
            <div class="citation">
              <strong>${cite.title}</strong><br>
              <a href="${cite.url}" target="_blank">${cite.url}</a>
            </div>
          `).join('');
          document.getElementById('citations-list').innerHTML = citationsHTML;
        }

        // Extract and suggest tags
        const suggestedTags = extractTags(result.answer);
        displaySuggestedTags(suggestedTags);

      } catch (error) {
        console.error('Query failed:', error);
        document.getElementById('response-text').innerHTML =
          `<p style="color: red;">Error: ${error.message}</p>`;
      }
    }

    function extractTags(text) {
      // Simple keyword extraction
      const keywords = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
      return [...new Set(keywords)].slice(0, 10);
    }

    function displaySuggestedTags(tags) {
      const container = document.getElementById('suggested-tags');
      container.innerHTML = tags.map(tag => `
        <span class="tag">${tag}</span>
      `).join('');
    }

    async function saveAsSource() {
      if (!currentResponse) return;

      const query = document.getElementById('research-query').value;

      try {
        const response = await fetch(`${API_BASE}/sources/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: currentProvider === 'perplexity' ? 'web' : 'academic',
            title: query,
            extracted_text: currentResponse.answer,
            citation: JSON.stringify(currentResponse.citations),
            tags: {
              source: currentProvider,
              query_date: new Date().toISOString().split('T')[0]
            }
          })
        });

        const result = await response.json();
        alert(`✅ Saved as Source (ID: ${result.id})`);

      } catch (error) {
        alert(`❌ Failed to save: ${error.message}`);
      }
    }

    async function createGraphNodes() {
      // Extract entities and create graph nodes
      // For Friday: Simplified version
      const entities = extractTags(currentResponse.answer);

      for (const entity of entities) {
        try {
          await fetch(`${API_BASE}/graph-nodes/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              entity_type: 'concept',
              name: entity,
              description: `Extracted from research query`,
              confidence: 70
            })
          });
        } catch (error) {
          console.error(`Failed to create node for ${entity}:`, error);
        }
      }

      alert(`✅ Created ${entities.length} graph nodes`);
    }
  </script>
</body>
</html>
```

### API Endpoints Needed

```javascript
// Add to server.js

app.post('/api/research/query', async (req, res) => {
  const { query, provider } = req.body;

  try {
    let result;

    if (provider === 'perplexity') {
      // Call Perplexity API
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.1-sonar-large-128k-online',
          messages: [{ role: 'user', content: query }]
        })
      });
      const data = await response.json();

      result = {
        answer: data.choices[0].message.content,
        citations: data.citations || []
      };
    } else {
      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [{ role: 'user', content: query }]
      });

      result = {
        answer: response.content[0].text,
        citations: [] // Claude doesn't provide citations directly
      };
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## FILE 3: ingestion-review.html

### Purpose
Upload files/URLs → Preview → Edit → Approve → Save to database

### Features
1. File upload (drag-drop)
2. URL input
3. Text paste area
4. Preview parsed content
5. Edit fields (title, tags, etc.)
6. Approve and save

### HTML Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Ingestion Hub</title>
  <style>
    .ingestion-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 40px 20px;
    }

    .upload-area {
      border: 3px dashed #dee2e6;
      border-radius: 8px;
      padding: 60px 20px;
      text-align: center;
      background: white;
      cursor: pointer;
      transition: all 0.2s;
    }

    .upload-area:hover {
      border-color: #0066cc;
      background: #f8f9fa;
    }

    .upload-area.dragover {
      border-color: #0066cc;
      background: #e7f0ff;
    }

    .input-tabs {
      display: flex;
      gap: 12px;
      margin: 30px 0;
    }

    .tab {
      flex: 1;
      padding: 12px;
      border: none;
      background: #e9ecef;
      cursor: pointer;
      border-radius: 6px;
    }

    .tab.active {
      background: #0066cc;
      color: white;
    }

    .input-area {
      display: none;
    }

    .input-area.active {
      display: block;
    }

    .preview-box {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-top: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .field-group {
      margin: 20px 0;
    }

    .field-group label {
      display: block;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .field-group input,
    .field-group textarea,
    .field-group select {
      width: 100%;
      padding: 10px;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      font-family: inherit;
    }

    .approve-actions {
      display: flex;
      gap: 12px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="ingestion-container">
    <h1>📥 Ingestion Hub</h1>
    <p>Upload files, paste URLs, or enter text to ingest into the system</p>

    <!-- Input method tabs -->
    <div class="input-tabs">
      <button class="tab active" onclick="switchTab('file')">
        📁 Upload File
      </button>
      <button class="tab" onclick="switchTab('url')">
        🔗 URL
      </button>
      <button class="tab" onclick="switchTab('text')">
        📝 Paste Text
      </button>
    </div>

    <!-- File upload -->
    <div class="input-area active" id="input-file">
      <div class="upload-area" id="dropzone">
        <p>📤 Drag & drop file here or click to browse</p>
        <p style="font-size: 12px; color: #6c757d; margin-top: 12px;">
          Supported: .md, .pdf, .docx, .json, .txt
        </p>
        <input type="file" id="file-input" style="display: none;"
               accept=".md,.pdf,.docx,.json,.txt">
      </div>
    </div>

    <!-- URL input -->
    <div class="input-area" id="input-url">
      <input type="url" id="url-input" placeholder="https://en.wikipedia.org/wiki/..." style="width: 100%; padding: 16px;">
      <button class="btn btn-primary" style="margin-top: 12px;" onclick="fetchURL()">
        🔍 Fetch & Parse
      </button>
    </div>

    <!-- Text input -->
    <div class="input-area" id="input-text">
      <textarea id="text-input" placeholder="Paste or type content here..." style="width: 100%; min-height: 200px; padding: 16px;"></textarea>
      <button class="btn btn-primary" style="margin-top: 12px;" onclick="parseText()">
        📝 Parse Text
      </button>
    </div>

    <!-- Preview and edit -->
    <div id="preview-section" style="display: none;">
      <div class="preview-box">
        <h2>Preview & Edit</h2>

        <div class="field-group">
          <label>Type:</label>
          <select id="content-type">
            <option value="lesson">Lesson</option>
            <option value="section">Section</option>
            <option value="note">Research Note</option>
            <option value="source">Source Material</option>
          </select>
        </div>

        <div class="field-group">
          <label>Title:</label>
          <input type="text" id="content-title" placeholder="Enter title...">
        </div>

        <div class="field-group">
          <label>Summary:</label>
          <textarea id="content-summary" rows="3" placeholder="Brief summary..."></textarea>
        </div>

        <div class="field-group">
          <label>Tags (comma-separated):</label>
          <input type="text" id="content-tags" placeholder="polynesian, geometry, radial-symmetry">
        </div>

        <div class="field-group">
          <label>Content:</label>
          <textarea id="content-body" rows="12" placeholder="Full content..."></textarea>
        </div>

        <div class="approve-actions">
          <button class="btn btn-primary" onclick="approveAndSave()">
            ✅ Approve & Save
          </button>
          <button class="btn" onclick="cancel()">
            ❌ Cancel
          </button>
        </div>
      </div>
    </div>
  </div>

  <script>
    const API_BASE = 'http://localhost:3001/api';
    let currentContent = null;

    // Tab switching
    function switchTab(tab) {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.input-area').forEach(a => a.classList.remove('active'));

      event.target.classList.add('active');
      document.getElementById(`input-${tab}`).classList.add('active');
    }

    // Drag & drop
    const dropzone = document.getElementById('dropzone');
    const fileInput = document.getElementById('file-input');

    dropzone.addEventListener('click', () => fileInput.click());

    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    });

    fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });

    // Handle file upload
    async function handleFile(file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${API_BASE}/parse/file`, {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        showPreview(result);
      } catch (error) {
        alert(`Error parsing file: ${error.message}`);
      }
    }

    // Fetch URL
    async function fetchURL() {
      const url = document.getElementById('url-input').value;
      if (!url) {
        alert('Please enter a URL');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/parse/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });

        const result = await response.json();
        showPreview(result);
      } catch (error) {
        alert(`Error fetching URL: ${error.message}`);
      }
    }

    // Parse text
    async function parseText() {
      const text = document.getElementById('text-input').value;
      if (!text.trim()) {
        alert('Please enter some text');
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/parse/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });

        const result = await response.json();
        showPreview(result);
      } catch (error) {
        alert(`Error parsing text: ${error.message}`);
      }
    }

    // Show preview
    function showPreview(content) {
      currentContent = content;

      document.getElementById('content-type').value = content.type || 'note';
      document.getElementById('content-title').value = content.title || '';
      document.getElementById('content-summary').value = content.summary || '';
      document.getElementById('content-tags').value =
        (content.tags ? Object.values(content.tags).flat().join(', ') : '');
      document.getElementById('content-body').value =
        (typeof content.body === 'string' ? content.body : JSON.stringify(content.body, null, 2));

      document.getElementById('preview-section').style.display = 'block';
    }

    // Approve and save
    async function approveAndSave() {
      const contentItem = {
        type: document.getElementById('content-type').value,
        title: document.getElementById('content-title').value,
        summary: document.getElementById('content-summary').value,
        body: { text: document.getElementById('content-body').value },
        tags: parseTags(document.getElementById('content-tags').value),
        status: 'approved'
      };

      try {
        const response = await fetch(`${API_BASE}/content-items/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contentItem)
        });

        const result = await response.json();
        alert(`✅ Saved! ID: ${result.id}`);

        // Clear form
        cancel();
      } catch (error) {
        alert(`❌ Failed to save: ${error.message}`);
      }
    }

    function parseTags(tagString) {
      const tags = tagString.split(',').map(t => t.trim()).filter(Boolean);
      return { custom: tags };
    }

    function cancel() {
      document.getElementById('preview-section').style.display = 'none';
      document.getElementById('text-input').value = '';
      document.getElementById('url-input').value = '';
      fileInput.value = '';
    }
  </script>
</body>
</html>
```

---

## FILE 4: knowledge-graph-viewer.html

### Purpose
Visual network viewer for graph nodes and edges

### Features
1. Force-directed graph visualization
2. Node filtering (by type)
3. Click node → show details
4. Add/edit nodes and relationships
5. Export graph data

### Technology
Use **D3.js** or **Cytoscape.js** for visualization

### HTML Structure (Using D3.js)

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Knowledge Graph</title>
  <script src="https://d3js.org/d3.v7.min.js"></script>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
    }

    .graph-container {
      width: 100vw;
      height: 100vh;
      position: relative;
    }

    #graph-svg {
      width: 100%;
      height: 100%;
      background: #f8f9fa;
    }

    .node {
      cursor: pointer;
      stroke: #fff;
      stroke-width: 2px;
    }

    .node-label {
      font-size: 12px;
      pointer-events: none;
    }

    .link {
      stroke: #999;
      stroke-opacity: 0.6;
      stroke-width: 2px;
    }

    .controls {
      position: absolute;
      top: 20px;
      left: 20px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .node-details {
      position: absolute;
      top: 20px;
      right: 20px;
      width: 300px;
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      display: none;
    }
  </style>
</head>
<body>
  <div class="graph-container">
    <svg id="graph-svg"></svg>

    <div class="controls">
      <h3>Filters</h3>
      <label><input type="checkbox" checked onchange="filterGraph()"> Deities</label><br>
      <label><input type="checkbox" checked onchange="filterGraph()"> Geometry</label><br>
      <label><input type="checkbox" checked onchange="filterGraph()"> Concepts</label><br>
      <label><input type="checkbox" checked onchange="filterGraph()"> Civilizations</label><br>
      <button onclick="resetZoom()">Reset View</button>
    </div>

    <div class="node-details" id="node-details">
      <h3 id="detail-name"></h3>
      <p id="detail-type"></p>
      <p id="detail-description"></p>
      <button onclick="editNode()">Edit</button>
      <button onclick="closeDetails()">Close</button>
    </div>
  </div>

  <script>
    const API_BASE = 'http://localhost:3001/api';

    const width = window.innerWidth;
    const height = window.innerHeight;

    const svg = d3.select('#graph-svg');
    let graphData = { nodes: [], links: [] };

    // Fetch graph data
    async function loadGraph() {
      try {
        const [nodesRes, edgesRes] = await Promise.all([
          fetch(`${API_BASE}/graph-nodes`),
          fetch(`${API_BASE}/graph-edges`)
        ]);

        const nodes = await nodesRes.json();
        const edges = await edgesRes.json();

        // Transform for D3
        graphData = {
          nodes: nodes.data.map(n => ({
            id: n.id,
            name: n.name,
            type: n.entity_type,
            description: n.description
          })),
          links: edges.data.map(e => ({
            source: e.source_node_id,
            target: e.target_node_id,
            relation: e.relation
          }))
        };

        renderGraph();
      } catch (error) {
        console.error('Failed to load graph:', error);
      }
    }

    // Render graph
    function renderGraph() {
      svg.selectAll('*').remove();

      const simulation = d3.forceSimulation(graphData.nodes)
        .force('link', d3.forceLink(graphData.links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2));

      // Links
      const link = svg.append('g')
        .selectAll('line')
        .data(graphData.links)
        .enter().append('line')
        .attr('class', 'link');

      // Nodes
      const node = svg.append('g')
        .selectAll('circle')
        .data(graphData.nodes)
        .enter().append('circle')
        .attr('class', 'node')
        .attr('r', 10)
        .attr('fill', d => getNodeColor(d.type))
        .on('click', showNodeDetails)
        .call(d3.drag()
          .on('start', dragStarted)
          .on('drag', dragged)
          .on('end', dragEnded));

      // Labels
      const label = svg.append('g')
        .selectAll('text')
        .data(graphData.nodes)
        .enter().append('text')
        .attr('class', 'node-label')
        .text(d => d.name);

      // Update positions
      simulation.on('tick', () => {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        node
          .attr('cx', d => d.x)
          .attr('cy', d => d.y);

        label
          .attr('x', d => d.x + 15)
          .attr('y', d => d.y + 5);
      });
    }

    function getNodeColor(type) {
      const colors = {
        deity: '#ff6b6b',
        geometry: '#4dabf7',
        concept: '#51cf66',
        civilization: '#ffd43b',
        artifact: '#845ef7'
      };
      return colors[type] || '#adb5bd';
    }

    function showNodeDetails(event, d) {
      document.getElementById('detail-name').textContent = d.name;
      document.getElementById('detail-type').textContent = `Type: ${d.type}`;
      document.getElementById('detail-description').textContent = d.description || 'No description';
      document.getElementById('node-details').style.display = 'block';
    }

    function closeDetails() {
      document.getElementById('node-details').style.display = 'none';
    }

    function dragStarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragEnded(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Initialize
    loadGraph();
  </script>
</body>
</html>
```

---

## INTEGRATION WITH SERVER

Add these API endpoints to `server.js`:

```javascript
// Graph nodes
app.get('/api/graph-nodes', async (req, res) => {
  const nodes = await listGraphNodes();
  res.json({ data: nodes });
});

app.post('/api/graph-nodes/create', async (req, res) => {
  const node = await createGraphNode(req.body);
  res.json(node);
});

// Graph edges
app.get('/api/graph-edges', async (req, res) => {
  const edges = await listGraphEdges();
  res.json({ data: edges });
});

// Parse endpoints
app.post('/api/parse/file', upload.single('file'), async (req, res) => {
  // Use universal-parser.js
  const result = await parseFile(req.file.path);
  res.json(result);
});

app.post('/api/parse/url', async (req, res) => {
  const { url } = req.body;
  const result = await parseFile(url, { type: 'url' });
  res.json(result);
});

// Content items CRUD
app.post('/api/content-items/create', async (req, res) => {
  const item = await createContentItem(req.body);
  res.json(item);
});
```

---

## TESTING CHECKLIST

### Studio Dashboard
- [ ] Loads without errors
- [ ] Stats display correctly
- [ ] Navigation works
- [ ] Quick actions functional

### Research Panel
- [ ] Claude queries work
- [ ] Perplexity queries work
- [ ] Citations display
- [ ] Save as Source works
- [ ] Graph nodes created

### Ingestion Hub
- [ ] File upload works
- [ ] URL fetching works
- [ ] Text parsing works
- [ ] Preview displays correctly
- [ ] Approve & Save works

### Knowledge Graph
- [ ] Graph renders
- [ ] Nodes clickable
- [ ] Details panel works
- [ ] Filtering works
- [ ] Drag/zoom works

---

## FRIDAY DEMO FLOW

1. Open `studio-dashboard.html`
2. Click "Ingestion Hub"
3. Paste Polynesian Wikipedia URL
4. Review parsed content
5. Approve & Save
6. Open "Research Panel"
7. Query: "What geometric patterns appear in Polynesian art?"
8. Review response
9. Create graph nodes
10. Open "Knowledge Graph"
11. Show new Polynesian nodes connected to geometry nodes
12. **Success**: Research → Curation → Knowledge Graph working end-to-end

---

## NEXT FILES TO BUILD (Post-Friday)

- grade-level-adapter.js (K-8 curriculum adaptation)
- meta-code-editor.html (in-app coding)
- curation-studio.html (batch editing/tagging)
- lesson-editor.html (WYSIWYG lesson builder)
