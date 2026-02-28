import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookText, 
  GitBranch, 
  CircleDot, 
  Users, 
  Settings, 
  Search, 
  Bell, 
  Plus,
  Github,
  Star,
  GitFork,
  History,
  ChevronRight,
  Folder,
  FileCode,
  Eye,
  Copy,
  Download,
  Terminal,
  ArrowLeft,
  Moon,
  Sun,
  Monitor,
  MoreHorizontal,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  GitPullRequest,
  Check,
  X,
  MessageCircle,
  FileDiff,
  ChevronDown,
  Globe
} from 'lucide-react';
import { cn } from './lib/utils';
import { translations, Language } from './lib/translations';
import { useTranslation } from './hooks/useTranslation';

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center w-full gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group",
      active 
        ? "bg-zinc-900/5 dark:bg-white/10 text-zinc-900 dark:text-white shadow-sm dark:shadow-[0_0_20px_rgba(255,255,255,0.05)]" 
        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-900/5 dark:hover:bg-white/5"
    )}
  >
    <Icon size={20} className={cn("transition-transform duration-200 group-hover:scale-110", active ? "text-emerald-500 dark:text-emerald-400" : "")} />
    <span className="text-sm font-medium">{label}</span>
  </button>
);

const GlassCard = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white/60 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm dark:shadow-2xl transition-colors duration-300",
      onClick ? "cursor-pointer" : "",
      className
    )}
  >
    {children}
  </div>
);

const FileExplorer = ({ owner, repo, language }: { owner: string, repo: string, language: Language }) => {
  const { t } = useTranslation(language);
  const [currentPath, setCurrentPath] = useState("");
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/repos/${owner}/${repo}/files/${currentPath}`)
      .then(res => res.json())
      .then(data => {
        setFiles(data.files);
        setLoading(false);
      });
  }, [currentPath, owner, repo]);

  const navigateTo = (name: string, type: string) => {
    if (type === 'dir') {
      setCurrentPath(prev => prev ? `${prev}/${name}` : name);
    } else {
      const fullPath = currentPath ? `${currentPath}/${name}` : name;
      setSelectedFile(fullPath);
      fetch(`/api/repos/${owner}/${repo}/content/${fullPath}`)
        .then(res => res.json())
        .then(data => setFileContent(data.content));
    }
  };

  const goBack = () => {
    const parts = currentPath.split('/');
    parts.pop();
    setCurrentPath(parts.join('/'));
  };

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {selectedFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-5xl h-[80vh] bg-zinc-950 border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileCode size={18} className="text-emerald-400" />
                  <span className="text-sm font-medium">{selectedFile}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                    <Copy size={16} />
                  </button>
                  <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-400 transition-colors">
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => { setSelectedFile(null); setFileContent(null); }}
                    className="ml-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-all"
                  >
                    {t('close')}
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto p-6 font-mono text-sm leading-relaxed text-zinc-300 bg-[#080808]">
                {fileContent ? (
                  <pre className="whitespace-pre-wrap">
                    {fileContent.split('\n').map((line, i) => (
                      <div key={i} className="flex gap-6 group">
                        <span className="w-10 text-right text-zinc-700 select-none group-hover:text-zinc-500 transition-colors">{i + 1}</span>
                        <span>{line}</span>
                      </div>
                    ))}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-zinc-600">{t('loadingContent')}</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
        <button 
          onClick={() => setCurrentPath("")}
          className="hover:text-white transition-colors"
        >
          {repo}
        </button>
        {currentPath.split('/').filter(Boolean).map((part, i, arr) => (
          <React.Fragment key={i}>
            <ChevronRight size={14} />
            <button 
              onClick={() => setCurrentPath(arr.slice(0, i + 1).join('/'))}
              className={cn("hover:text-white transition-colors", i === arr.length - 1 ? "text-white font-medium" : "")}
            >
              {part}
            </button>
          </React.Fragment>
        ))}
      </div>

      <GlassCard className="border-white/10">
        <div className="bg-white/5 px-6 py-3 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center">
              <History size={12} className="text-indigo-400" />
            </div>
            <span className="text-sm font-medium">{t('latestCommit')}: <span className="text-zinc-400">feat: add repository view</span></span>
          </div>
          <span className="text-xs text-zinc-500 font-mono">3f2a1b9</span>
        </div>

        <div className="divide-y divide-white/5">
          {currentPath && (
            <button 
              onClick={goBack}
              className="w-full flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors text-zinc-500 text-sm"
            >
              <ArrowLeft size={18} />
              <span>..</span>
            </button>
          )}
          {loading ? (
            <div className="p-10 text-center text-zinc-500">{t('loadingFiles')}</div>
          ) : files.map((file) => (
            <div 
              key={file.name}
              onClick={() => navigateTo(file.name, file.type)}
              className={cn(
                "flex items-center gap-4 px-6 py-3 hover:bg-white/[0.02] transition-colors group cursor-pointer",
                file.type === 'dir' ? "text-indigo-400" : "text-zinc-300"
              )}
            >
              {file.type === 'dir' ? <Folder size={18} /> : <FileCode size={18} className="text-zinc-500" />}
              <span className="flex-1 text-sm font-medium group-hover:underline decoration-white/20">{file.name}</span>
              <span className="text-xs text-zinc-500 truncate max-w-[200px] hidden md:block">{file.lastCommit}</span>
              <span className="text-xs text-zinc-600 font-mono w-24 text-right">{file.time}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

const KanbanCard = ({ issue }: { issue: any }) => (
  <motion.div
    layoutId={issue.id}
    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-all cursor-grab active:cursor-grabbing group"
  >
    <div className="flex justify-between items-start mb-2">
      <span className={cn(
        "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
        issue.priority === 'high' ? "bg-red-500/10 text-red-500" :
        issue.priority === 'medium' ? "bg-amber-500/10 text-amber-500" :
        "bg-emerald-500/10 text-emerald-500"
      )}>
        {issue.priority}
      </span>
      <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
        <MoreHorizontal size={16} />
      </button>
    </div>
    <h4 className="font-semibold text-sm mb-1 text-zinc-900 dark:text-zinc-100 leading-tight">{issue.title}</h4>
    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">{issue.description}</p>
    <div className="flex items-center justify-between mt-auto">
      <div className="flex -space-x-2">
        <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-[10px] text-white font-bold uppercase">
          {issue.author[0]}
        </div>
      </div>
      <div className="flex items-center gap-3 text-zinc-400 text-xs">
        {issue.comments > 0 && (
          <div className="flex items-center gap-1 hover:text-zinc-600 dark:hover:text-zinc-300">
            <MessageSquare size={12} />
            <span>{issue.comments}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <span>#{issue.id}</span>
        </div>
      </div>
    </div>
  </motion.div>
);

const KanbanColumn = ({ title, count, icon: Icon, colorClass, issues, onAdd }: { title: string, count: number, icon: any, colorClass: string, issues: any[], onAdd: () => void }) => (
  <div className="flex-1 min-w-[300px] flex flex-col h-full">
    <div className="flex items-center justify-between mb-4 px-1">
      <div className="flex items-center gap-2">
        <div className={cn("p-1.5 rounded-lg", colorClass)}>
          <Icon size={16} />
        </div>
        <h3 className="font-bold text-sm text-zinc-700 dark:text-zinc-200">{title}</h3>
        <span className="bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 text-xs font-bold px-2 py-0.5 rounded-full">{count}</span>
      </div>
      <button 
        onClick={onAdd}
        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
      >
        <Plus size={16} />
      </button>
    </div>
    <div className="flex-1 bg-zinc-50/50 dark:bg-white/[0.02] rounded-2xl border border-zinc-200/50 dark:border-white/5 p-3 space-y-3 overflow-y-auto">
      {issues.map(issue => (
        <KanbanCard key={issue.id} issue={issue} />
      ))}
    </div>
  </div>
);

const KanbanBoard = ({ language, onAddIssue }: { language: Language, onAddIssue: () => void }) => {
  const { t } = useTranslation(language);
  const [issues, setIssues] = useState<any>(null);

  useEffect(() => {
    fetch('/api/issues')
      .then(res => res.json())
      .then(data => setIssues(data));
  }, []);

  if (!issues) return <div className="p-10 text-center text-zinc-500">{t('loadingBoard')}</div>;

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 overflow-x-auto pb-4">
      <KanbanColumn 
        title={t('todo')}
        count={issues.todo.length} 
        icon={CircleDot} 
        colorClass="bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" 
        issues={issues.todo} 
        onAdd={onAddIssue}
      />
      <KanbanColumn 
        title={t('inProgress')}
        count={issues.inProgress.length} 
        icon={Clock} 
        colorClass="bg-amber-500/10 text-amber-500" 
        issues={issues.inProgress} 
        onAdd={onAddIssue}
      />
      <KanbanColumn 
        title={t('done')}
        count={issues.done.length} 
        icon={CheckCircle2} 
        colorClass="bg-emerald-500/10 text-emerald-500" 
        issues={issues.done} 
        onAdd={onAddIssue}
      />
    </div>
  );
};

const PullRequestList = ({ onSelectPR, language }: { onSelectPR: (id: string) => void, language: Language }) => {
  const { t } = useTranslation(language);
  const [prs, setPrs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/prs')
      .then(res => res.json())
      .then(data => setPrs(data));
  }, []);

  return (
    <div className="space-y-4">
      {prs.map(pr => (
        <GlassCard key={pr.id} className="p-4 hover:border-emerald-500/30 transition-all cursor-pointer group" >
          <div onClick={() => onSelectPR(pr.id)}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-1.5 rounded-lg",
                  pr.status === 'open' ? "bg-emerald-500/10 text-emerald-500" :
                  pr.status === 'merged' ? "bg-indigo-500/10 text-indigo-500" :
                  "bg-red-500/10 text-red-500"
                )}>
                  <GitPullRequest size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-emerald-500 transition-colors">{pr.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <span className="font-mono">#{pr.id}</span>
                    <span>{t('openedBy', { time: pr.time })} <span className="text-zinc-900 dark:text-zinc-300 font-medium">{pr.author}</span></span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-zinc-500 text-xs">
                  <MessageSquare size={14} />
                  <span>{pr.comments}</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full border",
                  pr.checks === 'passing' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" :
                  "bg-amber-500/5 border-amber-500/20 text-amber-500"
                )}>
                  {pr.checks === 'passing' ? <Check size={12} /> : <Clock size={12} />}
                  <span>{pr.checks}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 ml-11 text-xs font-mono text-zinc-500">
              <span className="bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded border border-zinc-200 dark:border-white/10">{pr.targetBranch}</span>
              <ArrowLeft size={12} className="rotate-180" />
              <span className="bg-zinc-100 dark:bg-white/5 px-2 py-1 rounded border border-zinc-200 dark:border-white/10">{pr.sourceBranch}</span>
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

const PullRequestDetail = ({ id, onBack, language }: { id: string, onBack: () => void, language: Language }) => {
  const { t } = useTranslation(language);
  const [pr, setPr] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'conversation' | 'commits' | 'files'>('conversation');

  useEffect(() => {
    fetch(`/api/prs/${id}`)
      .then(res => res.json())
      .then(data => setPr(data));
  }, [id]);

  if (!pr) return <div className="p-10 text-center text-zinc-500">{t('loadingPr')}</div>;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
        <ArrowLeft size={16} />
        {t('backToList')}
      </button>

      <header className="border-b border-zinc-200 dark:border-white/10 pb-6">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white leading-tight">
            {pr.title} <span className="text-zinc-400 font-light">#{pr.id}</span>
          </h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-zinc-100 dark:bg-white/5 hover:bg-zinc-200 dark:hover:bg-white/10 text-zinc-900 dark:text-white text-sm font-medium rounded-xl transition-colors">
              {t('edit')}
            </button>
            <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black text-sm font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
              {t('mergePr')}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="px-3 py-1 rounded-full bg-emerald-500 text-white dark:text-black text-sm font-bold flex items-center gap-2">
            <GitPullRequest size={16} />
            {t('open')}
          </div>
          <p className="text-zinc-500 text-sm">
            <span className="font-bold text-zinc-900 dark:text-zinc-200">{pr.author}</span> {t('wantsToMerge')} 
            <span className="font-mono mx-1 bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs">{pr.sourceBranch}</span> 
            {t('into')} 
            <span className="font-mono mx-1 bg-zinc-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs">{pr.targetBranch}</span>
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={() => setActiveTab('conversation')}
            className={cn(
              "flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2",
              activeTab === 'conversation' ? "text-zinc-900 dark:text-white border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <MessageCircle size={16} />
            {t('conversation')} <span className="bg-zinc-100 dark:bg-white/10 px-1.5 rounded-full text-xs">{pr.comments.length}</span>
          </button>
          <button 
            onClick={() => setActiveTab('commits')}
            className={cn(
              "flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2",
              activeTab === 'commits' ? "text-zinc-900 dark:text-white border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <GitBranch size={16} />
            {t('commits')} <span className="bg-zinc-100 dark:bg-white/10 px-1.5 rounded-full text-xs">2</span>
          </button>
          <button 
            onClick={() => setActiveTab('files')}
            className={cn(
              "flex items-center gap-2 pb-2 text-sm font-medium transition-colors border-b-2",
              activeTab === 'files' ? "text-zinc-900 dark:text-white border-emerald-500" : "text-zinc-500 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300"
            )}
          >
            <FileDiff size={16} />
            {t('filesChanged')} <span className="bg-zinc-100 dark:bg-white/10 px-1.5 rounded-full text-xs">{pr.filesChanged.length}</span>
          </button>
        </div>
      </header>

      <div className="min-h-[400px]">
        {activeTab === 'conversation' && (
          <div className="space-y-6 max-w-4xl">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-indigo-500 border-2 border-white dark:border-zinc-900 flex-shrink-0 flex items-center justify-center text-white font-bold uppercase">
                {pr.author[0]}
              </div>
              <GlassCard className="flex-1 border-zinc-200 dark:border-white/10">
                <div className="bg-zinc-50 dark:bg-white/5 px-4 py-2 border-b border-zinc-200 dark:border-white/5 flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{pr.author} <span className="text-zinc-500 font-normal">commented now</span></span>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/10 text-[10px] text-zinc-500">Owner</span>
                  </div>
                </div>
                <div className="p-4 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
                  {pr.description}
                </div>
              </GlassCard>
            </div>

            <div className="relative pl-5 ml-5 border-l-2 border-zinc-200 dark:border-white/5 space-y-6">
              {pr.comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-4 relative">
                  <div className="absolute -left-[29px] top-0 w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 border-2 border-white dark:border-zinc-950" />
                  <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-white text-xs font-bold uppercase">
                    {comment.author[0]}
                  </div>
                  <GlassCard className="flex-1">
                    <div className="bg-zinc-50 dark:bg-white/5 px-4 py-2 border-b border-zinc-200 dark:border-white/5">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-200">{comment.author} <span className="text-zinc-500 font-normal">commented {comment.time}</span></span>
                    </div>
                    <div className="p-4 text-zinc-700 dark:text-zinc-300 text-sm">
                      {comment.content}
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>

            <div className="flex gap-4 pt-4 border-t border-zinc-200 dark:border-white/10">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex-shrink-0" />
              <div className="flex-1">
                <div className="border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                  <textarea 
                    className="w-full bg-transparent p-4 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 focus:outline-none min-h-[100px] resize-y"
                    placeholder="Leave a comment"
                  />
                  <div className="bg-zinc-50 dark:bg-white/5 px-4 py-2 flex justify-end border-t border-zinc-200 dark:border-white/10">
                    <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black text-sm font-bold rounded-lg transition-colors">
                      Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'files' && (
          <div className="space-y-6">
            {pr.filesChanged.map((file: any) => (
              <div key={file.name} className="border border-zinc-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                <div className="bg-zinc-50 dark:bg-white/5 px-4 py-2 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-sm text-zinc-700 dark:text-zinc-300">
                    <ChevronDown size={16} />
                    <span>{file.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-emerald-500">+{file.additions}</span>
                    <span className="text-red-500">-{file.deletions}</span>
                    <div className="flex gap-0.5">
                      <div className="w-1 h-3 bg-emerald-500 rounded-sm" />
                      <div className="w-1 h-3 bg-emerald-500 rounded-sm" />
                      <div className="w-1 h-3 bg-emerald-500 rounded-sm" />
                      <div className="w-1 h-3 bg-zinc-200 dark:bg-white/10 rounded-sm" />
                      <div className="w-1 h-3 bg-zinc-200 dark:bg-white/10 rounded-sm" />
                    </div>
                  </div>
                </div>
                <div className="p-0 overflow-x-auto">
                  <pre className="text-xs font-mono leading-relaxed">
                    {file.diff.split('\n').map((line: string, i: number) => (
                      <div key={i} className={cn(
                        "flex",
                        line.startsWith('+') ? "bg-emerald-500/10" :
                        line.startsWith('-') ? "bg-red-500/10" :
                        line.startsWith('@') ? "bg-indigo-500/10 text-indigo-400" : ""
                      )}>
                        <div className="w-12 flex-shrink-0 text-right pr-4 text-zinc-400 select-none border-r border-zinc-200 dark:border-white/5 bg-zinc-50 dark:bg-white/5 py-0.5">
                          {i + 1}
                        </div>
                        <div className={cn(
                          "flex-1 pl-4 py-0.5 whitespace-pre",
                          line.startsWith('+') ? "text-emerald-700 dark:text-emerald-400" :
                          line.startsWith('-') ? "text-red-700 dark:text-red-400" :
                          "text-zinc-600 dark:text-zinc-400"
                        )}>
                          {line}
                        </div>
                      </div>
                    ))}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'commits' && (
          <div className="text-center py-20 text-zinc-500">
            <GitBranch size={48} className="mx-auto mb-4 opacity-20" />
            <p>Commit history visualization coming soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const RepoList = ({ onSelect, language }: { onSelect: (owner: string, name: string) => void, language: Language }) => {
  const { t } = useTranslation(language);
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/repos')
      .then(res => res.json())
      .then(data => {
        setRepos(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-10 text-center text-zinc-500">{t('loadingFiles')}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {repos.map(repo => (
        <GlassCard key={repo.id} className="p-6 hover:border-emerald-500/30 transition-all cursor-pointer group" onClick={() => onSelect(repo.owner, repo.name)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookText size={20} className="text-emerald-500" />
              <h3 className="text-lg font-bold group-hover:text-emerald-500 transition-colors">{repo.name}</h3>
            </div>
            <span className="px-2 py-0.5 rounded-full border border-zinc-200 dark:border-white/10 text-[10px] text-zinc-500 uppercase tracking-wider">{repo.visibility}</span>
          </div>
          <p className="text-sm text-zinc-500 mb-6 line-clamp-2 h-10">{repo.description || "No description provided."}</p>
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              {repo.language}
            </div>
            <div className="flex items-center gap-1">
              <Star size={14} />
              {repo.stars}
            </div>
            <div className="flex items-center gap-1">
              <GitFork size={14} />
              {repo.forks}
            </div>
          </div>
        </GlassCard>
      ))}
    </div>
  );
};

const CreateModal = ({ isOpen, onClose, type, language, onSuccess }: { isOpen: boolean, onClose: () => void, type: 'repo' | 'issue' | 'pr', language: Language, onSuccess: () => void }) => {
  const { t } = useTranslation(language);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = type === 'repo' ? '/api/repos' : type === 'issue' ? '/api/issues' : '/api/prs';
      const body = type === 'repo' ? { name, description } : { title: name, description };
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setName("");
        setDescription("");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl"
      >
        <div className="px-8 py-6 border-b border-zinc-100 dark:border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
            {type === 'repo' ? t('createRepo') : type === 'issue' ? t('newIssue') : t('newPr')}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-zinc-100 dark:hover:bg-white/5 rounded-xl transition-colors text-zinc-500">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('repoName')}</label>
            <input 
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="my-awesome-project"
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-zinc-900 dark:text-white"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t('repoDescription')}</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all text-zinc-900 dark:text-white resize-none"
            />
          </div>
          
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-600 dark:text-emerald-400 leading-relaxed">
              {language === 'de' 
                ? "Dieses Repository wird lokal in der SQLite-Datenbank gespeichert."
                : "This repository will be stored locally in the SQLite database."}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-xl border border-zinc-200 dark:border-white/10 text-sm font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-white/5 transition-all"
            >
              {t('cancel')}
            </button>
            <button 
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white dark:text-black text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
            >
              {loading ? t('loadingFiles') : t('create')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Layout ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [selectedPR, setSelectedPR] = useState<string | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<{owner: string, name: string} | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createType, setCreateType] = useState<'repo' | 'issue' | 'pr'>('repo');
  const [isCodeDropdownOpen, setIsCodeDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { t } = useTranslation(language);

  const refreshData = () => {
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => setDashboardData(data));
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-zinc-900 dark:text-zinc-100 font-sans selection:bg-emerald-500/30 selection:text-emerald-800 dark:selection:text-emerald-200 transition-colors duration-300">
      {/* Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-2xl border-r border-zinc-200 dark:border-white/5 z-50 flex flex-col p-6 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(52,211,153,0.3)]">
            <Github className="text-white dark:text-black" size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-500 dark:from-white dark:to-zinc-500">
            GitNexus
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={LayoutDashboard} label={t('dashboard')} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={BookText} label={t('repositories')} active={activeTab === 'repos'} onClick={() => setActiveTab('repos')} />
          <SidebarItem icon={CircleDot} label={t('issues')} active={activeTab === 'issues'} onClick={() => setActiveTab('issues')} />
          <SidebarItem icon={GitPullRequest} label={t('pullRequests')} active={activeTab === 'prs'} onClick={() => setActiveTab('prs')} />
          <SidebarItem icon={Users} label={t('organizations')} active={activeTab === 'orgs'} onClick={() => setActiveTab('orgs')} />
          <SidebarItem icon={FileCode} label="Source Viewer" active={activeTab === 'source'} onClick={() => window.open('/api/project-source', '_blank')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-zinc-200 dark:border-white/5 space-y-2">
          <SidebarItem icon={Settings} label={t('settings')} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
          <div className="flex items-center gap-3 px-4 py-3 mt-4 rounded-2xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">Alex Rivera</p>
              <p className="text-[10px] text-zinc-500 truncate">Pro Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="pl-64 min-h-screen transition-colors duration-300">
        {/* Navbar */}
        <header className="sticky top-0 z-40 h-20 bg-white/50 dark:bg-zinc-950/30 backdrop-blur-md border-b border-zinc-200 dark:border-white/5 px-8 flex items-center justify-between transition-colors duration-300">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder={t('searchPlaceholder')}
              className="w-full bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 transition-all placeholder:text-zinc-500 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 rounded-xl bg-zinc-100 dark:bg-white/5 border border-zinc-200 dark:border-white/10 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-white/10 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-950" />
            </button>
            <button 
              onClick={() => { setCreateType('repo'); setIsCreateModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              <Plus size={18} />
              <span className="text-sm">{t('new')}</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-10 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {activeTab === 'repos' && (
                <div className="space-y-8">
                  {!selectedRepo ? (
                    <>
                      <header className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">{t('repositories')}</h1>
                          <p className="text-zinc-500">{t('managePreferences')}</p>
                        </div>
                        <button 
                          onClick={() => { setCreateType('repo'); setIsCreateModalOpen(true); }}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Plus size={18} />
                          <span className="text-sm">{t('createRepo')}</span>
                        </button>
                      </header>
                      <RepoList onSelect={(owner, name) => setSelectedRepo({owner, name})} language={language} />
                    </>
                  ) : (
                    <div className="space-y-8">
                      <header className="flex items-end justify-between">
                        <div>
                          <button 
                            onClick={() => setSelectedRepo(null)}
                            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors mb-4"
                          >
                            <ArrowLeft size={16} />
                            {t('backToList')}
                          </button>
                          <div className="flex items-center gap-3 text-zinc-500 text-sm mb-2">
                            <Users size={14} />
                            <span>{selectedRepo.owner}</span>
                            <ChevronRight size={14} />
                            <span className="text-white font-medium">{selectedRepo.name}</span>
                            <span className="px-2 py-0.5 rounded-full border border-white/10 text-[10px] uppercase tracking-wider">{t('public')}</span>
                          </div>
                          <h1 className="text-3xl font-bold tracking-tight">{selectedRepo.name}</h1>
                        </div>
                        <div className="flex items-center gap-3">
                          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                            <Star size={16} />
                            {t('star')}
                            <span className="pl-2 border-l border-white/10 ml-1 text-zinc-500">1.2k</span>
                          </button>
                          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-medium hover:bg-white/10 transition-all">
                            <GitFork size={16} />
                            {t('fork')}
                            <span className="pl-2 border-l border-white/10 ml-1 text-zinc-500">89</span>
                          </button>
                        </div>
                      </header>

                      <div className="flex items-center gap-6 border-b border-white/5 pb-4">
                        <button className="text-sm font-medium text-emerald-400 border-b-2 border-emerald-400 pb-4 -mb-4">{t('code')}</button>
                        <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors pb-4 -mb-4">{t('issues')}</button>
                        <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors pb-4 -mb-4">{t('pullRequests')}</button>
                        <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors pb-4 -mb-4">{t('actions')}</button>
                        <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors pb-4 -mb-4">{t('projects')}</button>
                        <button className="text-sm font-medium text-zinc-500 hover:text-white transition-colors pb-4 -mb-4">{t('wiki')}</button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                        <div className="lg:col-span-3 space-y-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium hover:bg-white/10 transition-all">
                                <GitBranch size={14} />
                                main
                              </button>
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <GitBranch size={14} />
                                <span className="font-medium text-zinc-300">3</span> branches
                                <span className="mx-1">•</span>
                                <History size={14} />
                                <span className="font-medium text-zinc-300">124</span> tags
                              </div>
                            </div>
                            <div className="flex items-center gap-2 relative">
                              <button 
                                onClick={() => setIsCodeDropdownOpen(!isCodeDropdownOpen)}
                                className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 text-white dark:text-black text-xs font-bold rounded-lg hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
                              >
                                <Terminal size={14} />
                                {t('code')}
                                <ChevronDown size={14} className={cn("transition-transform", isCodeDropdownOpen && "rotate-180")} />
                              </button>

                              <AnimatePresence>
                                {isCodeDropdownOpen && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={() => setIsCodeDropdownOpen(false)} 
                                    />
                                    <motion.div
                                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                      animate={{ opacity: 1, y: 0, scale: 1 }}
                                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                      className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
                                    >
                                      <div className="p-4 border-b border-zinc-100 dark:border-white/5">
                                        <div className="flex items-center gap-2 mb-3">
                                          <Terminal size={16} className="text-emerald-500" />
                                          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">{t('clone')}</span>
                                        </div>
                                        <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-lg mb-3">
                                          <button className="flex-1 py-1 text-[10px] font-bold bg-white dark:bg-white/10 rounded-md shadow-sm">{t('https')}</button>
                                          <button className="flex-1 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">{t('ssh')}</button>
                                          <button className="flex-1 py-1 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">{t('githubCli')}</button>
                                        </div>
                                        <div className="flex items-center gap-2 bg-zinc-50 dark:bg-black/20 border border-zinc-200 dark:border-white/5 rounded-lg p-2">
                                          <code className="text-[10px] text-zinc-600 dark:text-zinc-400 truncate flex-1">git clone {window.location.origin}/{selectedRepo.owner}/{selectedRepo.name}.git</code>
                                          <button 
                                            onClick={() => {
                                              navigator.clipboard.writeText(`git clone ${window.location.origin}/${selectedRepo.owner}/${selectedRepo.name}.git`);
                                              setCopied(true);
                                              setTimeout(() => setCopied(false), 2000);
                                            }}
                                            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-white/10 rounded-md transition-colors text-zinc-500"
                                          >
                                            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                          </button>
                                        </div>
                                      </div>
                                      <a 
                                        href="/api/project-source"
                                        download="GitNexus_Source.html"
                                        onClick={() => setIsCodeDropdownOpen(false)}
                                        className="w-full p-4 text-left hover:bg-zinc-50 dark:hover:bg-white/5 transition-colors flex items-center gap-3"
                                      >
                                        <Download size={16} className="text-zinc-400" />
                                        <div className="text-xs">
                                          <p className="font-bold text-zinc-900 dark:text-white">{t('downloadZip')}</p>
                                        </div>
                                      </a>
                                    </motion.div>
                                  </>
                                )}
                              </AnimatePresence>

                              <a 
                                href="/api/project-source"
                                download="GitNexus_Source.html"
                                className="flex items-center gap-2 px-4 py-1.5 bg-zinc-100 dark:bg-white/10 text-zinc-900 dark:text-white text-xs font-bold rounded-lg hover:bg-zinc-200 dark:hover:bg-white/20 transition-all border border-zinc-200 dark:border-white/10"
                              >
                                <Download size={14} />
                                {t('downloadZip')}
                              </a>
                            </div>
                          </div>

                          <FileExplorer owner={selectedRepo.owner} repo={selectedRepo.name} language={language} />

                          {/* README Preview */}
                          <GlassCard className="border-white/10">
                            <div className="bg-white/5 px-6 py-3 border-b border-white/5 flex items-center gap-2">
                              <BookText size={16} className="text-zinc-500" />
                              <span className="text-sm font-medium uppercase tracking-wider text-zinc-400">README.md</span>
                            </div>
                            <div className="p-10 prose prose-invert max-w-none">
                              <h1 className="text-3xl font-bold mb-6">{selectedRepo.name}</h1>
                              <p className="text-zinc-400 mb-4">The high-performance engine powering the next generation of Git repository management.</p>
                              <h2 className="text-xl font-bold mt-8 mb-4">Features</h2>
                              <ul className="list-disc list-inside space-y-2 text-zinc-400">
                                <li>Ultra-fast Git operations using native binaries</li>
                                <li>Real-time collaboration with WebSockets</li>
                                <li>Advanced code analysis and visualization</li>
                                <li>Seamless integration with modern CI/CD pipelines</li>
                              </ul>
                            </div>
                          </GlassCard>
                        </div>

                        <div className="space-y-8">
                          <div>
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">About</h3>
                            <p className="text-sm text-zinc-300 leading-relaxed">
                              A next-generation Git repository management platform with a stunning, ultra-modern UI.
                            </p>
                            <div className="mt-6 space-y-3">
                              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                                <BookText size={16} />
                                <span>Readme</span>
                              </div>
                              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                                <Star size={16} />
                                <span>1.2k stars</span>
                              </div>
                              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                                <Eye size={16} />
                                <span>45 watching</span>
                              </div>
                              <div className="flex items-center gap-3 text-zinc-500 text-sm">
                                <GitFork size={16} />
                                <span>89 forks</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Languages</h3>
                            <div className="space-y-3">
                              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden flex">
                                <div className="h-full bg-indigo-500" style={{ width: '85%' }} />
                                <div className="h-full bg-emerald-500" style={{ width: '10%' }} />
                                <div className="h-full bg-amber-500" style={{ width: '5%' }} />
                              </div>
                              <div className="flex flex-wrap gap-4">
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                  TypeScript <span className="text-zinc-600">85%</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                  React <span className="text-zinc-600">10%</span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                                  CSS <span className="text-zinc-600">5%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'dashboard' && (
                <div className="space-y-10">
                  <header>
                    <h1 className="text-4xl font-bold tracking-tight mb-2">{t('welcomeBack')}, Alex</h1>
                    <p className="text-zinc-500">{t('happeningToday')}</p>
                  </header>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <GlassCard className="p-6 group cursor-pointer hover:border-emerald-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                          <History size={20} />
                        </div>
                        <span className="text-xs font-mono text-zinc-500">+12%</span>
                      </div>
                      <p className="text-2xl font-bold">2,481</p>
                      <p className="text-sm text-zinc-500">{t('totalCommits')}</p>
                    </GlassCard>
                    <GlassCard className="p-6 group cursor-pointer hover:border-indigo-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                          <Star size={20} />
                        </div>
                        <span className="text-xs font-mono text-zinc-500">+5%</span>
                      </div>
                      <p className="text-2xl font-bold">842</p>
                      <p className="text-sm text-zinc-500">{t('starsEarned')}</p>
                    </GlassCard>
                    <GlassCard className="p-6 group cursor-pointer hover:border-purple-500/30 transition-colors">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                          <GitFork size={20} />
                        </div>
                        <span className="text-xs font-mono text-zinc-500">+2%</span>
                      </div>
                      <p className="text-2xl font-bold">156</p>
                      <p className="text-sm text-zinc-500">{t('forksCreated')}</p>
                    </GlassCard>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Recent Activity */}
                    <div className="lg:col-span-2 space-y-6">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {t('recentActivity')}
                        <span className="text-xs font-normal text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{t('live')}</span>
                      </h2>
                      <div className="space-y-4">
                        {dashboardData?.recentActivity.map((item: any) => (
                          <GlassCard key={item.id} className="p-5 flex items-start gap-4 hover:bg-white/[0.02] transition-colors group">
                            <div className={cn(
                              "mt-1 p-2 rounded-lg",
                              item.type === 'commit' ? "bg-emerald-500/10 text-emerald-400" :
                              item.type === 'issue' ? "bg-amber-500/10 text-amber-400" :
                              "bg-indigo-500/10 text-indigo-400"
                            )}>
                              {item.type === 'commit' ? <History size={16} /> : 
                               item.type === 'issue' ? <CircleDot size={16} /> : 
                               <Star size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium mb-1">
                                <span className="text-zinc-400 group-hover:text-zinc-200 transition-colors">{item.repo}</span>
                              </p>
                              <p className="text-sm text-zinc-300 truncate">{item.message}</p>
                            </div>
                            <span className="text-xs text-zinc-600 font-mono">{item.time}</span>
                          </GlassCard>
                        ))}
                      </div>
                    </div>

                    {/* Pinned Repos */}
                    <div className="space-y-6">
                      <h2 className="text-xl font-bold">{t('pinned')}</h2>
                      <div className="space-y-4">
                        {dashboardData?.pinnedRepos.map((repo: any) => (
                          <GlassCard key={repo.id} className="p-5 hover:border-white/10 transition-all cursor-pointer group">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="font-bold text-emerald-400 group-hover:text-emerald-300 transition-colors">{repo.name}</h3>
                              <Star size={14} className="text-zinc-600" />
                            </div>
                            <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{repo.description}</p>
                            <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                                {repo.language}
                              </div>
                              <div className="flex items-center gap-1">
                                <Star size={10} />
                                {repo.stars}
                              </div>
                              <div className="flex items-center gap-1">
                                <GitFork size={10} />
                                {repo.forks}
                              </div>
                            </div>
                          </GlassCard>
                        ))}
                        <button className="w-full py-3 rounded-xl border border-dashed border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20 transition-all text-sm flex items-center justify-center gap-2">
                          <Plus size={16} />
                          Customize Pins
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8 max-w-2xl mx-auto">
                  <header>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">{t('settings')}</h1>
                    <p className="text-zinc-500">{t('managePreferences')}</p>
                  </header>

                  <GlassCard className="p-8">
                    <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{t('appearance')}</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setTheme('light')}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                          theme === 'light' 
                            ? "border-emerald-500 bg-emerald-500/5" 
                            : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                        )}
                      >
                        <div className="w-full aspect-video bg-slate-50 rounded-lg border border-zinc-200 flex items-center justify-center overflow-hidden relative">
                          <div className="absolute top-2 left-2 w-16 h-2 bg-white rounded-md shadow-sm" />
                          <div className="absolute top-6 left-2 w-8 h-16 bg-white rounded-md shadow-sm" />
                          <div className="absolute top-6 left-12 w-24 h-16 bg-white rounded-md shadow-sm" />
                          <Sun className="text-amber-500 relative z-10" size={24} />
                        </div>
                        <span className={cn("font-medium", theme === 'light' ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400")}>{t('lightMode')}</span>
                        {theme === 'light' && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => setTheme('dark')}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                          theme === 'dark' 
                            ? "border-emerald-500 bg-emerald-500/5" 
                            : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                        )}
                      >
                        <div className="w-full aspect-video bg-[#050505] rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative">
                          <div className="absolute top-2 left-2 w-16 h-2 bg-white/10 rounded-md" />
                          <div className="absolute top-6 left-2 w-8 h-16 bg-white/10 rounded-md" />
                          <div className="absolute top-6 left-12 w-24 h-16 bg-white/10 rounded-md" />
                          <Moon className="text-indigo-400 relative z-10" size={24} />
                        </div>
                        <span className={cn("font-medium", theme === 'dark' ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400")}>{t('darkMode')}</span>
                        {theme === 'dark' && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-8">
                    <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{t('language')}</h2>
                    <p className="text-zinc-500 mb-4 text-sm">{t('selectLanguage')}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                          language === 'en' 
                            ? "border-emerald-500 bg-emerald-500/5" 
                            : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-2xl">
                          🇺🇸
                        </div>
                        <span className={cn("font-medium", language === 'en' ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400")}>{t('english')}</span>
                        {language === 'en' && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>

                      <button
                        onClick={() => setLanguage('de')}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3",
                          language === 'de' 
                            ? "border-emerald-500 bg-emerald-500/5" 
                            : "border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-white/10 flex items-center justify-center text-2xl">
                          🇩🇪
                        </div>
                        <span className={cn("font-medium", language === 'de' ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-600 dark:text-zinc-400")}>{t('german')}</span>
                        {language === 'de' && (
                          <div className="absolute top-3 right-3 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </button>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-8 opacity-50 pointer-events-none grayscale">
                    <h2 className="text-xl font-bold mb-6 text-zinc-900 dark:text-white">{t('account')}</h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500" />
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white">Alex Rivera</p>
                            <p className="text-sm text-zinc-500">alex.rivera@example.com</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-white/10 border border-zinc-200 dark:border-white/10 rounded-lg">{t('manage')}</button>
                      </div>
                    </div>
                  </GlassCard>
                </div>
              )}

              {activeTab === 'issues' && (
                <div className="h-full flex flex-col">
                  <header className="flex items-center justify-between mb-8">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">{t('issues')}</h1>
                      <p className="text-zinc-500">{t('trackTasks')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex bg-zinc-100 dark:bg-white/5 p-1 rounded-xl border border-zinc-200 dark:border-white/10">
                        <button className="px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 shadow-sm text-xs font-medium text-zinc-900 dark:text-white">{t('board')}</button>
                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">{t('list')}</button>
                      </div>
                      <button 
                        onClick={() => { setCreateType('issue'); setIsCreateModalOpen(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                      >
                        <Plus size={18} />
                        <span className="text-sm">{t('newIssue')}</span>
                      </button>
                    </div>
                  </header>
                  <KanbanBoard language={language} onAddIssue={() => { setCreateType('issue'); setIsCreateModalOpen(true); }} />
                </div>
              )}

              {activeTab === 'prs' && (
                <div className="space-y-8">
                  {!selectedPR ? (
                    <>
                      <header className="flex items-center justify-between">
                        <div>
                          <h1 className="text-3xl font-bold tracking-tight mb-2 text-zinc-900 dark:text-white">{t('pullRequests')}</h1>
                          <p className="text-zinc-500">{t('manageReviews')}</p>
                        </div>
                        <button 
                          onClick={() => { setCreateType('pr'); setIsCreateModalOpen(true); }}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white dark:text-black font-semibold rounded-xl transition-all shadow-lg shadow-emerald-500/20"
                        >
                          <Plus size={18} />
                          <span className="text-sm">{t('newPr')}</span>
                        </button>
                      </header>
                      <PullRequestList onSelectPR={setSelectedPR} language={language} />
                    </>
                  ) : (
                    <PullRequestDetail id={selectedPR} onBack={() => setSelectedPR(null)} language={language} />
                  )}
                </div>
              )}

              {activeTab !== 'dashboard' && activeTab !== 'repos' && activeTab !== 'settings' && activeTab !== 'issues' && activeTab !== 'prs' && (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-zinc-100 dark:bg-white/5 rounded-3xl flex items-center justify-center text-zinc-400 dark:text-zinc-600">
                    <LayoutDashboard size={40} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{t('comingSoon')}</h2>
                    <p className="text-zinc-500">{t('moduleDevelopment', { module: t(activeTab as any) })}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateModal 
            isOpen={isCreateModalOpen} 
            onClose={() => setIsCreateModalOpen(false)} 
            type={createType} 
            language={language} 
            onSuccess={refreshData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
