import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "GitNexus API is running" });
  });

  // Mock data for initial dashboard
  app.get("/api/dashboard", (req, res) => {
    res.json({
      recentActivity: [
        { id: 1, type: 'commit', repo: 'git-nexus/core', message: 'feat: add glassmorphism layout', time: '2h ago' },
        { id: 2, type: 'issue', repo: 'git-nexus/ui', message: 'Sidebar responsiveness on mobile', time: '4h ago' },
        { id: 3, type: 'star', repo: 'facebook/react', message: 'You starred this repository', time: '1d ago' },
      ],
      pinnedRepos: [
        { id: '1', name: 'git-nexus-core', description: 'The engine behind GitNexus', language: 'TypeScript', stars: 1240, forks: 89 },
        { id: '2', name: 'modern-ui-kit', description: '2026 Design System components', language: 'React', stars: 850, forks: 45 },
      ]
    });
  });

  // Repository details and file explorer API
  app.get("/api/repos/:owner/:repo/files/*", (req, res) => {
    const pathParam = req.params[0] || "";
    
    // Mock file system
    const fileSystem: Record<string, any> = {
      "": [
        { name: "src", type: "dir", lastCommit: "feat: add layout", time: "2 days ago" },
        { name: "public", type: "dir", lastCommit: "chore: update assets", time: "5 days ago" },
        { name: "package.json", type: "file", lastCommit: "build: update deps", time: "1 hour ago" },
        { name: "README.md", type: "file", lastCommit: "docs: initial readme", time: "10 days ago" },
        { name: "tsconfig.json", type: "file", lastCommit: "config: ts setup", time: "10 days ago" },
      ],
      "src": [
        { name: "components", type: "dir", lastCommit: "feat: sidebar", time: "2 days ago" },
        { name: "App.tsx", type: "file", lastCommit: "feat: main layout", time: "2 days ago" },
        { name: "main.tsx", type: "file", lastCommit: "init", time: "10 days ago" },
      ],
      "src/components": [
        { name: "Sidebar.tsx", type: "file", lastCommit: "feat: sidebar", time: "2 days ago" },
        { name: "Navbar.tsx", type: "file", lastCommit: "feat: navbar", time: "3 days ago" },
      ]
    };

    const files = fileSystem[pathParam] || [];
    res.json({
      path: pathParam,
      files: files
    });
  });

  app.get("/api/repos/:owner/:repo/content/*", (req, res) => {
    const path = req.params[0];
    res.json({
      path: path,
      content: `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export default function ${path.split('/').pop()?.split('.')[0] || 'Component'}() {
  console.log("Hello from ${path}!");
  return (
    <div className="p-4 bg-zinc-900 rounded-lg border border-white/5">
      <h1 className="text-xl font-bold text-emerald-400">GitNexus Code Viewer</h1>
      <p className="text-zinc-400 mt-2">Viewing file: ${path}</p>
    </div>
  );
}`
    });
  });

  app.get("/api/repos/:owner/:repo", (req, res) => {
    res.json({
      name: req.params.repo,
      owner: req.params.owner,
      description: "The next-gen Git repository management platform.",
      stars: 1240,
      forks: 89,
      watchers: 45,
      branches: ["main", "develop", "feature/ui-overhaul"],
      defaultBranch: "main"
    });
  });

  // Mock data for Kanban board
  app.get("/api/issues", (req, res) => {
    res.json({
      todo: [
        { id: '1', title: 'Design new landing page', description: 'Create high-fidelity mockups for the marketing site.', tags: ['design', 'marketing'], author: 'alex', comments: 3, priority: 'high' },
        { id: '2', title: 'Refactor authentication middleware', description: 'Simplify the JWT verification logic.', tags: ['backend', 'refactor'], author: 'sarah', comments: 1, priority: 'medium' },
        { id: '3', title: 'Update dependency versions', description: 'Bump React to v19 and testing library.', tags: ['chore'], author: 'bot', comments: 0, priority: 'low' },
      ],
      inProgress: [
        { id: '4', title: 'Implement dark mode toggle', description: 'Add context provider and local storage persistence.', tags: ['frontend', 'ui'], author: 'alex', comments: 5, priority: 'high' },
        { id: '5', title: 'Fix mobile sidebar navigation', description: 'Sidebar does not close on outside click on iOS.', tags: ['bug', 'mobile'], author: 'mike', comments: 2, priority: 'high' },
      ],
      done: [
        { id: '6', title: 'Initial project setup', description: 'Initialize repo, install deps, setup CI.', tags: ['chore'], author: 'alex', comments: 0, priority: 'medium' },
        { id: '7', title: 'Configure database schema', description: 'Define Prisma models for User and Repo.', tags: ['backend', 'db'], author: 'sarah', comments: 4, priority: 'high' },
      ]
    });
  });

  // Mock data for Pull Requests
  app.get("/api/prs", (req, res) => {
    res.json([
      { id: '101', title: 'feat: Add glassmorphism layout', author: 'alex', status: 'open', comments: 4, checks: 'passing', time: '2h ago', sourceBranch: 'feature/glass-ui', targetBranch: 'main' },
      { id: '102', title: 'fix: Mobile sidebar responsiveness', author: 'mike', status: 'open', comments: 2, checks: 'pending', time: '5h ago', sourceBranch: 'fix/sidebar-mobile', targetBranch: 'main' },
      { id: '99', title: 'chore: Update dependencies', author: 'bot', status: 'merged', comments: 0, checks: 'passing', time: '1d ago', sourceBranch: 'chore/deps', targetBranch: 'main' },
    ]);
  });

  app.get("/api/prs/:id", (req, res) => {
    const id = req.params.id;
    res.json({
      id,
      title: id === '101' ? 'feat: Add glassmorphism layout' : 'fix: Mobile sidebar responsiveness',
      description: 'This PR introduces a new glassmorphism design system using Tailwind CSS and backdrop-filter utilities. It also updates the sidebar and navbar components to use the new design.',
      author: id === '101' ? 'alex' : 'mike',
      status: 'open',
      createdAt: '2026-02-27T10:00:00Z',
      sourceBranch: id === '101' ? 'feature/glass-ui' : 'fix/sidebar-mobile',
      targetBranch: 'main',
      filesChanged: [
        {
          name: 'src/App.tsx',
          additions: 45,
          deletions: 12,
          diff: `@@ -24,7 +24,12 @@
-  ArrowLeft,
-  Moon,
-  Sun,
-  Monitor
+  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  MoreHorizontal`
        },
        {
          name: 'src/index.css',
          additions: 15,
          deletions: 0,
          diff: `@@ -1,3 +1,18 @@
 @import "tailwindcss";

@layer utilities {
  .glass {
    @apply bg-white/10 backdrop-blur-lg border border-white/20;
  }
}`
        }
      ],
      comments: [
        { id: 1, author: 'sarah', content: 'Looks great! Maybe we should increase the blur amount slightly?', time: '1h ago' },
        { id: 2, author: 'alex', content: 'Good point, I bumped it to backdrop-blur-xl.', time: '30m ago' }
      ]
    });
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
