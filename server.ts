import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Database
const db = new Database("gitnexus.db");

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS repositories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    owner TEXT NOT NULL,
    description TEXT,
    language TEXT,
    stars INTEGER DEFAULT 0,
    forks INTEGER DEFAULT 0,
    watchers INTEGER DEFAULT 0,
    visibility TEXT DEFAULT 'public',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS issues (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'todo',
    author TEXT,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS prs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    author TEXT,
    status TEXT DEFAULT 'open',
    sourceBranch TEXT,
    targetBranch TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT,
    repo TEXT,
    message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Seed Data if empty
const repoCount = db.prepare("SELECT COUNT(*) as count FROM repositories").get() as { count: number };
if (repoCount.count === 0) {
  db.prepare("INSERT INTO repositories (name, owner, description, language, stars, forks, watchers) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    'git-nexus-core', 'git-nexus', 'The engine behind GitNexus', 'TypeScript', 1240, 89, 45
  );
  db.prepare("INSERT INTO repositories (name, owner, description, language, stars, forks, watchers) VALUES (?, ?, ?, ?, ?, ?, ?)").run(
    'modern-ui-kit', 'git-nexus', '2026 Design System components', 'React', 850, 45, 12
  );

  db.prepare("INSERT INTO issues (title, description, status, author, priority) VALUES (?, ?, ?, ?, ?)").run(
    'Design new landing page', 'Create high-fidelity mockups for the marketing site.', 'todo', 'alex', 'high'
  );
  db.prepare("INSERT INTO issues (title, description, status, author, priority) VALUES (?, ?, ?, ?, ?)").run(
    'Implement dark mode toggle', 'Add context provider and local storage persistence.', 'inProgress', 'alex', 'high'
  );
  db.prepare("INSERT INTO issues (title, description, status, author, priority) VALUES (?, ?, ?, ?, ?)").run(
    'Initial project setup', 'Initialize repo, install deps, setup CI.', 'done', 'alex', 'medium'
  );

  db.prepare("INSERT INTO prs (title, description, author, status, sourceBranch, targetBranch) VALUES (?, ?, ?, ?, ?, ?)").run(
    'feat: Add glassmorphism layout', 'This PR introduces a new glassmorphism design system.', 'alex', 'open', 'feature/glass-ui', 'main'
  );

  db.prepare("INSERT INTO activity (type, repo, message) VALUES (?, ?, ?)").run(
    'commit', 'git-nexus/core', 'feat: add glassmorphism layout'
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "GitNexus API is running" });
  });

  // Dashboard API
  app.get("/api/dashboard", (req, res) => {
    const recentActivity = db.prepare("SELECT * FROM activity ORDER BY created_at DESC LIMIT 5").all();
    const pinnedRepos = db.prepare("SELECT * FROM repositories LIMIT 4").all();
    
    res.json({
      recentActivity: recentActivity.map((a: any) => ({
        ...a,
        time: 'just now' // Simplified for demo
      })),
      pinnedRepos
    });
  });

  // Repositories API
  app.get("/api/repos", (req, res) => {
    const repos = db.prepare("SELECT * FROM repositories ORDER BY created_at DESC").all();
    res.json(repos);
  });

  app.post("/api/repos", (req, res) => {
    const { name, description, visibility, language } = req.body;
    const result = db.prepare("INSERT INTO repositories (name, owner, description, visibility, language) VALUES (?, ?, ?, ?, ?)").run(
      name, 'alex', description || '', visibility || 'public', language || 'TypeScript'
    );
    
    db.prepare("INSERT INTO activity (type, repo, message) VALUES (?, ?, ?)").run(
      'repo', `alex/${name}`, `Created new repository ${name}`
    );

    res.json({ id: result.lastInsertRowid, name, owner: 'alex' });
  });

  // Repository details and file explorer API
  app.get("/api/repos/:owner/:repo/files/*", (req, res) => {
    const pathParam = req.params[0] || "";
    
    // Mock file system (could be expanded to read real files if needed)
    const fileSystem: Record<string, any> = {
      "": [
        { name: "src", type: "dir", lastCommit: "feat: add layout", time: "2 days ago" },
        { name: "public", type: "dir", lastCommit: "chore: update assets", time: "5 days ago" },
        { name: "package.json", type: "file", lastCommit: "build: update deps", time: "1 hour ago" },
        { name: "README.md", type: "file", lastCommit: "docs: initial readme", time: "10 days ago" },
      ],
      "src": [
        { name: "components", type: "dir", lastCommit: "feat: sidebar", time: "2 days ago" },
        { name: "App.tsx", type: "file", lastCommit: "feat: main layout", time: "2 days ago" },
      ]
    };

    const files = fileSystem[pathParam] || [];
    res.json({
      path: pathParam,
      files: files
    });
  });

  app.get("/api/repos/:owner/:repo", (req, res) => {
    const repo = db.prepare("SELECT * FROM repositories WHERE owner = ? AND name = ?").get(req.params.owner, req.params.repo) as any;
    if (repo) {
      res.json({
        ...repo,
        branches: ["main", "develop"],
        defaultBranch: "main"
      });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Issues API
  app.get("/api/issues", (req, res) => {
    const issues = db.prepare("SELECT * FROM issues").all();
    res.json({
      todo: issues.filter((i: any) => i.status === 'todo'),
      inProgress: issues.filter((i: any) => i.status === 'inProgress'),
      done: issues.filter((i: any) => i.status === 'done')
    });
  });

  app.post("/api/issues", (req, res) => {
    const { title, description, priority } = req.body;
    const result = db.prepare("INSERT INTO issues (title, description, author, priority) VALUES (?, ?, ?, ?)").run(
      title, description || '', 'alex', priority || 'medium'
    );
    res.json({ id: result.lastInsertRowid, title });
  });

  // PRs API
  app.get("/api/prs", (req, res) => {
    const prs = db.prepare("SELECT * FROM prs").all();
    res.json(prs.map((p: any) => ({
      ...p,
      time: 'just now',
      checks: 'passing'
    })));
  });

  app.post("/api/prs", (req, res) => {
    const { title, description, sourceBranch, targetBranch } = req.body;
    const result = db.prepare("INSERT INTO prs (title, description, author, sourceBranch, targetBranch) VALUES (?, ?, ?, ?, ?)").run(
      title, description || '', 'alex', sourceBranch || 'feature', targetBranch || 'main'
    );
    res.json({ id: result.lastInsertRowid, title });
  });

  app.get("/api/prs/:id", (req, res) => {
    const pr = db.prepare("SELECT * FROM prs WHERE id = ?").get(req.params.id) as any;
    if (pr) {
      res.json({
        ...pr,
        filesChanged: [
          { name: 'src/App.tsx', additions: 10, deletions: 2, diff: '@@ -1,1 +1,1 @@\n-old\n+new' }
        ],
        comments: []
      });
    } else {
      res.status(404).json({ error: "Not found" });
    }
  });

  // Project Source Viewer API
  app.get("/api/project-source", (req, res) => {
    const filesToInclude = [
      "server.ts",
      "src/App.tsx",
      "package.json",
      "vite.config.ts",
      "index.html",
      "metadata.json",
      ".env.example"
    ];

    let filesJson: Record<string, string> = {};
    filesToInclude.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(__dirname, file), "utf-8");
        filesJson[file] = content;
      } catch (e) {
        console.error(`Could not read ${file}`, e);
      }
    });

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GitNexus Project Source Code</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/typescript.min.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
        body { font-family: 'Inter', sans-serif; }
        pre code { font-family: 'JetBrains Mono', monospace !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
    </style>
</head>
<body class="bg-[#0d1117] text-[#c9d1d9] h-screen flex overflow-hidden">
    <aside class="w-80 border-r border-[#30363d] flex flex-col bg-[#010409]">
        <div class="p-6 border-b border-[#30363d]">
            <h1 class="text-xl font-bold text-white">Source Viewer</h1>
            <p class="text-xs text-zinc-500 mt-1">GitNexus Project Files</p>
        </div>
        <nav id="file-list" class="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar"></nav>
    </aside>
    <main class="flex-1 flex flex-col min-w-0">
        <header class="h-16 border-b border-[#30363d] flex items-center justify-between px-8 bg-[#0d1117]">
            <span id="current-filename" class="text-sm font-mono font-medium text-emerald-400">Select a file</span>
            <button id="copy-btn" class="px-4 py-1.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg text-xs font-bold text-white">Copy Code</button>
        </header>
        <div class="flex-1 overflow-hidden relative">
            <pre class="h-full overflow-auto custom-scrollbar m-0"><code id="code-block" class="hljs h-full p-8"></code></pre>
        </div>
    </main>
    <script>
        const files = ${JSON.stringify(filesJson)};
        const fileList = document.getElementById('file-list');
        const codeBlock = document.getElementById('code-block');
        const currentFilename = document.getElementById('current-filename');
        const copyBtn = document.getElementById('copy-btn');

        Object.keys(files).forEach(filename => {
            const btn = document.createElement('button');
            btn.className = 'w-full text-left px-3 py-2 rounded-md text-sm hover:bg-[#161b22] transition-colors truncate';
            btn.textContent = filename;
            btn.onclick = () => {
                document.querySelectorAll('#file-list button').forEach(b => b.classList.remove('bg-[#21262d]', 'text-white'));
                btn.classList.add('bg-[#21262d]', 'text-white');
                currentFilename.textContent = filename;
                codeBlock.textContent = files[filename];
                hljs.highlightElement(codeBlock);
            };
            fileList.appendChild(btn);
        });

        copyBtn.onclick = () => {
            navigator.clipboard.writeText(codeBlock.textContent);
            copyBtn.textContent = 'Copied!';
            setTimeout(() => copyBtn.textContent = 'Copy Code', 2000);
        };

        if (Object.keys(files).length > 0) fileList.firstChild.click();
    </script>
</body>
</html>`;
    res.send(html);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`GitNexus running at http://localhost:${PORT}`);
  });
}

startServer();

