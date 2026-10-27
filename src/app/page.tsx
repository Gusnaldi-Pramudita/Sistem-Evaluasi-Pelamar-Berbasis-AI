"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileText,
  Filter,
  FolderOpen,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UploadCloud,
  UsersRound,
  X,
} from "lucide-react";

type Evaluation = {
  score: number;
  recommendation: string;
  summary: string;
  strengths: string[];
  risks: string[];
  suitableJobs: string[];
  fitReason: string;
};
type CandidateStatus = "Direkomendasikan" | "Perlu ditinjau" | "Tidak sesuai" | "Memproses" | "Gagal";
type Candidate = Evaluation & {
  id: string;
  name: string;
  email: string;
  role: string;
  fileName: string;
  avatarColor: string;
  initials: string;
  addedAt: string;
  status: CandidateStatus;
  isDemo?: boolean;
};
type UploadMode = "files" | "folder";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const roles = ["Product Designer", "Software Engineer", "Data Analyst", "Product Manager", "UI/UX Designer", "Frontend Developer", "Digital Marketing"];
const demoCandidates: Candidate[] = [
  {
    id: "demo-1", name: "Nadia Putri", email: "nadia.putri@email.com", role: "Product Designer", fileName: "Nadia_Putri_CV.pdf",
    avatarColor: "lavender", initials: "NP", addedAt: "10 menit lalu", status: "Direkomendasikan", score: 94,
    recommendation: "Sangat direkomendasikan", summary: "Nadia memiliki pengalaman 5 tahun merancang produk digital end-to-end. Portofolionya menunjukkan pemahaman kuat pada riset pengguna, design system, dan kolaborasi lintas fungsi.",
    strengths: ["Riset dan validasi pengguna", "Figma & design system", "Kolaborasi product team"], risks: ["Pengalaman di B2B masih terbatas"],
    suitableJobs: ["Product Designer", "UX Researcher"], fitReason: "Portofolio dan pengalaman sangat relevan dengan kebutuhan tim.",
    isDemo: true,
  },
  {
    id: "demo-2", name: "Rizky Ramadhan", email: "rizky.r@email.com", role: "Software Engineer", fileName: "CV_Rizky_Ramadhan.pdf",
    avatarColor: "mint", initials: "RR", addedAt: "35 menit lalu", status: "Direkomendasikan", score: 89,
    recommendation: "Direkomendasikan", summary: "Rizky berpengalaman membangun layanan web yang skalabel dengan fokus pada backend. Ia menunjukkan kemampuan teknis solid dan kontribusi nyata di lingkungan kerja berbasis tim.",
    strengths: ["Node.js & TypeScript", "Desain REST API", "Pengalaman sistem skala besar"], risks: ["Pengalaman cloud native perlu dikonfirmasi"],
    suitableJobs: ["Backend Engineer", "Full-stack Engineer"], fitReason: "Keahlian inti dan pengalaman kerja cocok dengan posisi.",
    isDemo: true,
  },
  {
    id: "demo-3", name: "Siti Rahmawati", email: "siti.rahma@email.com", role: "Data Analyst", fileName: "Siti_Rahmawati_CV.pdf",
    avatarColor: "peach", initials: "SR", addedAt: "1 jam lalu", status: "Perlu ditinjau", score: 82,
    recommendation: "Potensial", summary: "Siti memiliki fondasi analitik yang baik dan pengalaman mengubah data operasional menjadi insight. Dampak proyek dan kedalaman kemampuan SQL sebaiknya digali saat wawancara.",
    strengths: ["SQL dan dashboarding", "Komunikasi insight", "Dasar statistik yang baik"], risks: ["Dampak bisnis proyek belum terukur"],
    suitableJobs: ["Data Analyst", "Business Intelligence Analyst"], fitReason: "Kompetensi utama sesuai, dengan beberapa hal yang perlu divalidasi.",
    isDemo: true,
  },
  {
    id: "demo-4", name: "Aditya Pratama", email: "aditya.p@email.com", role: "Product Manager", fileName: "Aditya_Pratama_CV.pdf",
    avatarColor: "blue", initials: "AP", addedAt: "Kemarin", status: "Direkomendasikan", score: 91,
    recommendation: "Direkomendasikan", summary: "Aditya menunjukkan pengalaman memimpin pengembangan produk dari discovery hingga peluncuran. Ia terbiasa menyelaraskan kebutuhan pengguna dengan target bisnis dan prioritas engineering.",
    strengths: ["Product discovery", "Roadmap & prioritas", "Koordinasi lintas fungsi"], risks: ["Pengalaman pada produk enterprise belum terlihat"],
    suitableJobs: ["Product Manager", "Growth Product Manager"], fitReason: "Pengalaman kepemimpinan produk sangat selaras dengan kebutuhan.",
    isDemo: true,
  },
  {
    id: "demo-5", name: "Dewi Anggraini", email: "dewi.a@email.com", role: "UI/UX Designer", fileName: "CV_Dewi_Anggraini.pdf",
    avatarColor: "rose", initials: "DA", addedAt: "Kemarin", status: "Tidak sesuai", score: 58,
    recommendation: "Belum sesuai", summary: "Dewi memiliki potensi visual yang baik, tetapi informasi dalam CV belum cukup menunjukkan pengalaman riset dan proses desain produk yang dibutuhkan untuk peran ini.",
    strengths: ["Visual design", "Adobe Creative Suite"], risks: ["Belum ada contoh proses UX", "Portofolio produk digital terbatas"],
    suitableJobs: ["Graphic Designer", "Visual Designer"], fitReason: "Kemampuan visual tampak kuat, namun kecocokan untuk posisi UX masih rendah.",
    isDemo: true,
  },
];
const scoreBars = [58, 66, 47, 78, 69, 88, 83];
const weekDays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

const asList = (value: unknown) => Array.isArray(value) ? value.map(String) : value ? [String(value)] : [];
function normalize(value: unknown): Evaluation {
  const first = Array.isArray(value) ? value[0] : value;
  const envelope = first as Record<string, unknown> | null;
  const nested = envelope?.data ?? envelope?.result ?? envelope?.output ?? envelope?.body;
  const data = (typeof nested === "object" && nested !== null ? nested : first) as Record<string, unknown> | null;
  const score = Math.max(0, Math.min(100, Number(data?.score ?? data?.overallScore ?? data?.matchScore ?? data?.skor) || 0));
  return {
    score,
    recommendation: String(data?.recommendation ?? data?.rekomendasi ?? data?.verdict ?? "Hasil analisis"),
    summary: String(data?.summary ?? data?.ringkasan ?? data?.analysis ?? "Analisis selesai."),
    strengths: asList(data?.strengths ?? data?.kelebihan ?? data?.highlights),
    risks: asList(data?.risks ?? data?.kekurangan ?? data?.weaknesses ?? data?.concerns),
    suitableJobs: asList(data?.suitableJobs ?? data?.recommendedJobs ?? data?.jobSuggestions ?? data?.pekerjaanCocok ?? data?.saranPekerjaan),
    fitReason: String(data?.fitReason ?? data?.alasanKecocokan ?? data?.alasan ?? ""),
  };
}

function isPdf(file: File) {
  return file.name.toLowerCase().endsWith(".pdf") && (!file.type || file.type === "application/pdf");
}

function nameFromFile(fileName: string) {
  const withoutExtension = fileName.replace(/\.pdf$/i, "");
  const cleaned = withoutExtension.replace(/[_-]+/g, " ").replace(/\b(cv|resume|curriculum vitae)\b/gi, "").replace(/\s+/g, " ").trim();
  return cleaned || "Kandidat baru";
}

function candidateColors(index: number) {
  return ["lavender", "mint", "peach", "blue", "rose"][index % 5];
}

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>(demoCandidates);
  const [selectedId, setSelectedId] = useState(demoCandidates[0].id);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [candidateFiles, setCandidateFiles] = useState<File[]>([]);
  const [uploadMode, setUploadMode] = useState<UploadMode>("files");
  const [selectedRole, setSelectedRole] = useState(roles[0]);
  const [notes, setNotes] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const folderInput = useRef<HTMLInputElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (uploadMode === "folder") folderInput.current?.setAttribute("webkitdirectory", "");
    else folderInput.current?.removeAttribute("webkitdirectory");
  }, [uploadMode]);

  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);

  const selectedCandidate = candidates.find((candidate) => candidate.id === selectedId) ?? candidates[0];
  const filteredCandidates = useMemo(() => candidates.filter((candidate) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query || `${candidate.name} ${candidate.email} ${candidate.role} ${candidate.fileName}`.toLowerCase().includes(query);
    const matchesFilter = activeFilter === "Semua" ||
      (activeFilter === "Direkomendasikan" && candidate.status === "Direkomendasikan") ||
      (activeFilter === "Perlu ditinjau" && candidate.status === "Perlu ditinjau") ||
      (activeFilter === "Tidak sesuai" && candidate.status === "Tidak sesuai");
    return matchesSearch && matchesFilter;
  }), [activeFilter, candidates, searchTerm]);

  const metrics = useMemo(() => {
    const evaluated = candidates.filter((candidate) => candidate.status !== "Memproses" && candidate.status !== "Gagal");
    return {
      total: candidates.length,
      recommended: candidates.filter((candidate) => candidate.status === "Direkomendasikan").length,
      review: candidates.filter((candidate) => candidate.status === "Perlu ditinjau").length,
      average: evaluated.length ? Math.round(evaluated.reduce((total, candidate) => total + candidate.score, 0) / evaluated.length) : 0,
    };
  }, [candidates]);

  function selectFiles(selected: FileList | null, input: HTMLInputElement) {
    const picked = Array.from(selected ?? []).filter(isPdf);
    input.value = "";
    if (!picked.length) {
      setCandidateFiles([]);
      setStatusMessage("Tidak ada file PDF yang dipilih.");
      return;
    }
    const totalSize = picked.reduce((total, file) => total + file.size, 0);
    if (totalSize > MAX_UPLOAD_BYTES) {
      setCandidateFiles([]);
      setStatusMessage("Ukuran total PDF tidak boleh melebihi 4 MB.");
      return;
    }
    setCandidateFiles(picked);
    setStatusMessage(`${picked.length} CV siap diproses satu per satu.`);
  }

  async function analyzeCandidate(file: File, index: number) {
    const id = `candidate-${Date.now()}-${index}`;
    const candidateName = nameFromFile(file.name);
    const initials = candidateName.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "KB";
    const pending: Candidate = {
      id, name: candidateName, email: "Email belum tersedia", role: selectedRole, fileName: file.name,
      avatarColor: candidateColors(index), initials, addedAt: "Baru saja", status: "Memproses",
      score: 0, recommendation: "Sedang dianalisis", summary: "CV sedang dibaca oleh sistem AI.",
      strengths: [], risks: [], suitableJobs: [], fitReason: "",
    };
    setCandidates((current) => [pending, ...current]);
    setSelectedId(id);
    setProcessingLabel(`Memproses ${index + 1} dari ${candidateFiles.length}: ${candidateName}`);
    const body = new FormData();
    body.set("posisiDilamar", selectedRole);
    body.set("notes", notes);
    body.append("cvFiles", file, file.name);
    try {
      const response = await fetch("/api/evaluate", { method: "POST", body });
      const responseData: unknown = await response.json();
      if (!response.ok) {
        const error = responseData as { error?: unknown };
        throw new Error(typeof error?.error === "string" ? error.error : "Workflow evaluasi menolak CV.");
      }
      const evaluation = normalize(responseData);
      const recommendation: CandidateStatus = evaluation.score >= 85 ? "Direkomendasikan" : evaluation.score >= 70 ? "Perlu ditinjau" : "Tidak sesuai";
      setCandidates((current) => current.map((candidate) => candidate.id === id
        ? { ...candidate, ...evaluation, status: recommendation, recommendation: evaluation.recommendation, email: "Email belum tersedia" }
        : candidate));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan saat mengevaluasi CV.";
      setCandidates((current) => current.map((candidate) => candidate.id === id
        ? { ...candidate, status: "Gagal", recommendation: "Analisis gagal", summary: message }
        : candidate));
    }
  }

  async function submitEvaluations(event: FormEvent) {
    event.preventDefault();
    if (!candidateFiles.length) {
      setStatusMessage("Pilih setidaknya satu file PDF.");
      return;
    }
    setIsProcessing(true);
    setStatusMessage("");
    let completed = 0;
    const queuedFiles = [...candidateFiles];
    for (const [index, file] of queuedFiles.entries()) {
      await analyzeCandidate(file, index);
      completed += 1;
      setStatusMessage(`${completed} dari ${queuedFiles.length} CV selesai diproses.`);
    }
    setCandidateFiles([]);
    setNotes("");
    setIsProcessing(false);
    setProcessingLabel("");
  }

  if (!loggedIn) {
    return (
      <main className="login-screen">
        <section className="login-showcase">
          <div className="login-brand"><span className="brand-symbol">k</span><span>kanso<span className="brand-period">.</span></span></div>
          <div className="login-pitch">
            <span className="eyebrow"><Sparkles size={14} /> TALENT INTELLIGENCE, SIMPLIFIED</span>
            <h1>Rekrut dengan<br /><span>lebih yakin.</span></h1>
            <p>Satu ruang untuk memahami potensi, membandingkan kecocokan, dan mengambil keputusan yang lebih baik.</p>
          </div>
          <div className="login-showcase-bottom"><div className="login-avatars"><span>NP</span><span>RR</span><span>SR</span><span>+</span></div><span>Evaluasi kandidat, lebih terarah.</span></div>
          <div className="showcase-orb orb-one" /><div className="showcase-orb orb-two" />
        </section>
        <section className="login-side">
          <form className="login-card" onSubmit={(event) => {
            event.preventDefault();
            if (username === "admin" && password === "admin") {
              setLoggedIn(true);
              setLoginError("");
            } else setLoginError("Username atau password tidak sesuai.");
          }}>
            <div className="login-card-heading"><span className="login-kicker">SELAMAT DATANG</span><h2>Masuk ke workspace</h2><p>Kelola evaluasi kandidat dari satu tempat.</p></div>
            <label className="login-field">Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Masukkan username" /></label>
            <label className="login-field">Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Masukkan password" /></label>
            {loginError && <p className="login-error">{loginError}</p>}
            <button className="login-submit">Masuk ke dashboard <ArrowRight size={17} /></button>
            <div className="demo-login"><ShieldCheck size={15} /><span>Mode demo</span><code>admin / admin</code></div>
          </form>
          <p className="login-footer">© 2026 Kanso Talent Intelligence</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Tutup menu" onClick={() => setMobileNavOpen(false)} />}
      <aside className={`sidebar ${mobileNavOpen ? "sidebar-open" : ""}`}>
        <a className="sidebar-brand" href="#overview"><span className="brand-symbol">k</span><span>kanso<span className="brand-period">.</span></span></a>
        <div className="workspace-select"><span className="workspace-icon"><BriefcaseBusiness size={16} /></span><span><small>WORKSPACE</small><strong>People & Culture</strong></span><ChevronDown size={15} /></div>
        <nav className="sidebar-nav">
          <span className="nav-caption">WORKSPACE</span>
          <a className="side-link active" href="#overview" onClick={() => setMobileNavOpen(false)}><LayoutDashboard size={17} /> Ringkasan</a>
          <a className="side-link" href="#candidates" onClick={() => setMobileNavOpen(false)}><UsersRound size={17} /> Kandidat <span className="nav-count">{candidates.length}</span></a>
          <a className="side-link" href="#insights" onClick={() => setMobileNavOpen(false)}><BarChart3 size={17} /> Insight</a>
          <span className="nav-caption nav-caption-spaced">PREFERENSI</span>
          <a className="side-link" href="#settings"><Settings2 size={17} /> Pengaturan</a>
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card"><span className="help-icon"><CircleHelp size={17} /></span><strong>Butuh bantuan?</strong><p>Pelajari cara kerja evaluasi AI.</p><a href="#help">Lihat panduan <ArrowRight size={13} /></a></div>
          <button className="profile-menu" onClick={() => setLoggedIn(false)}><span className="profile-avatar">AD</span><span className="profile-copy"><strong>Admin Demo</strong><small>Talent administrator</small></span><LogOut size={16} /></button>
        </div>
      </aside>
      <section className="dashboard-main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Buka menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="topbar-context"><span>Workspace</span><ChevronRight size={14} /><strong>Ringkasan</strong></div>
          <div className="topbar-actions"><span className="today-label">Selasa, 20 Oktober 2026</span><button className="notification-button" aria-label="Notifikasi"><Bell size={18} /><i /></button><span className="topbar-divider" /><button className="topbar-profile"><span className="profile-avatar">AD</span><ChevronDown size={14} /></button></div>
        </header>
        <div className="dashboard-content" id="overview">
          <section className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> DASHBOARD REKRUTMEN</div><h1>Selamat pagi, Admin <span>👋</span></h1><p>Pantau pipeline kandidat dan temukan talenta terbaik untuk tim.</p></div>
            <button className="primary-action" onClick={() => setUploadOpen((open) => !open)}><Plus size={17} /> Evaluasi CV <ArrowUpRight size={15} /></button>
          </section>

          <section className="metrics-grid" aria-label="Ringkasan metrik kandidat">
            <MetricCard label="Total kandidat" value={metrics.total.toString()} change="+12,8%" detail="dibanding bulan lalu" icon={<UsersRound size={19} />} tone="violet" />
            <MetricCard label="Direkomendasikan" value={metrics.recommended.toString()} change="Pipeline sehat" detail={`${metrics.review} kandidat perlu ditinjau`} icon={<Target size={19} />} tone="green" />
            <MetricCard label="Rata-rata kecocokan" value={`${metrics.average}%`} change="+4,2%" detail="dibanding bulan lalu" icon={<BarChart3 size={19} />} tone="orange" />
            <MetricCard label="Posisi aktif" value="08" change="3 departemen" detail="sedang membuka lowongan" icon={<BriefcaseBusiness size={19} />} tone="blue" />
          </section>

          {uploadOpen && <section className="upload-panel" aria-label="Form evaluasi PDF">
            <div className="upload-panel-heading"><div><span className="section-kicker">EVALUASI KANDIDAT</span><h2>Tambahkan CV untuk dianalisis</h2><p>Setiap PDF dievaluasi terpisah dan muncul sebagai kandidat sendiri.</p></div><button className="icon-close" aria-label="Tutup formulir" onClick={() => setUploadOpen(false)}><X size={18} /></button></div>
            <form onSubmit={submitEvaluations}>
              <div className="upload-form-grid">
                <div className="upload-form-left">
                  <div className="upload-mode-switch"><button type="button" className={uploadMode === "files" ? "selected" : ""} onClick={() => setUploadMode("files")}><FileText size={15} /> Banyak file PDF</button><button type="button" className={uploadMode === "folder" ? "selected" : ""} onClick={() => setUploadMode("folder")}><FolderOpen size={15} /> Baca per folder</button></div>
                  <label className={`dropzone ${candidateFiles.length ? "dropzone-ready" : ""}`}>
                    <input ref={uploadMode === "files" ? fileInput : folderInput} type="file" accept="application/pdf,.pdf" multiple onChange={(event) => selectFiles(event.currentTarget.files, event.currentTarget)} />
                    <span className="dropzone-icon"><UploadCloud size={22} /></span><strong>{uploadMode === "folder" ? "Pilih folder berisi CV" : "Pilih atau tarik file PDF ke sini"}</strong><span>PDF saja · maksimal 4 MB total per antrean</span><span className="dropzone-browse">Jelajahi file</span>
                  </label>
                  {candidateFiles.length > 0 && <div className="upload-queue">
                    <div className="queue-header"><span>{candidateFiles.length} file dipilih</span><button type="button" onClick={() => setCandidateFiles([])}><Trash2 size={13} /> Hapus semua</button></div>
                    <div className="queue-files">{candidateFiles.map((file, index) => <div className="queue-file" key={`${file.name}-${file.lastModified}-${index}`}><span className="pdf-icon"><FileText size={14} /></span><span className="queue-file-name">{file.name}</span><small>{(file.size / 1024).toFixed(0)} KB</small><button type="button" aria-label={`Hapus ${file.name}`} onClick={() => setCandidateFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}><X size={14} /></button></div>)}</div>
                  </div>}
                </div>
                <div className="upload-form-right">
                  <label className="form-field">Posisi yang dilamar<select value={selectedRole} onChange={(event) => setSelectedRole(event.target.value)}>{roles.map((role) => <option value={role} key={role}>{role}</option>)}</select><ChevronDown size={15} /></label>
                  <label className="form-field">Catatan untuk AI <span>OPSIONAL</span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Contoh: prioritaskan pengalaman membangun produk B2B..." /></label>
                  <div className="upload-submit-row"><div className="privacy-note"><ShieldCheck size={15} /><span>File diproses secara aman</span></div><button className="primary-action" disabled={isProcessing || !candidateFiles.length}>{isProcessing ? <><LoaderCircle className="spin" size={16} /> Memproses...</> : <><Sparkles size={16} /> Mulai evaluasi <ArrowRight size={15} /></>}</button></div>
                </div>
              </div>
              {(statusMessage || processingLabel) && <div className="upload-status" role="status">{isProcessing && <LoaderCircle size={14} className="spin" />}{processingLabel || statusMessage}</div>}
            </form>
          </section>}

          <section className="insights-grid" id="insights">
            <div className="insight-card score-insight">
              <div className="card-heading"><div><span className="section-kicker">KUALITAS KANDIDAT</span><h2>Tren skor kecocokan</h2></div><button className="period-selector">7 hari terakhir <ChevronDown size={14} /></button></div>
              <div className="chart-legend"><span><i className="legend-dot legend-primary" /> Rata-rata skor</span><span className="chart-average"><span>{metrics.average}%</span> rata-rata</span></div>
              <div className="chart-area"><div className="chart-y-labels"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="bar-chart">{scoreBars.map((height, index) => <div className="bar-column" key={weekDays[index]}><div className={`chart-bar ${index === scoreBars.length - 1 ? "chart-bar-current" : ""}`} style={{ height: `${height}%` }} title={`Skor ${height}`} /><span>{weekDays[index]}</span></div>)}</div></div>
            </div>
            <div className="insight-card pipeline-insight">
              <div className="card-heading"><div><span className="section-kicker">PIPELINE</span><h2>Status evaluasi</h2></div><button className="more-button" aria-label="Opsi pipeline"><MoreHorizontal size={19} /></button></div>
              <div className="pipeline-total"><strong>{metrics.total}</strong><span>kandidat dalam pipeline</span></div>
              <div className="pipeline-bars">
                <PipelineRow label="Direkomendasikan" count={candidates.filter((candidate) => candidate.status === "Direkomendasikan").length} total={candidates.length} tone="green" />
                <PipelineRow label="Perlu ditinjau" count={candidates.filter((candidate) => candidate.status === "Perlu ditinjau").length} total={candidates.length} tone="yellow" />
                <PipelineRow label="Tidak sesuai" count={candidates.filter((candidate) => candidate.status === "Tidak sesuai").length} total={candidates.length} tone="red" />
              </div>
              <a className="insight-link" href="#candidates">Lihat semua kandidat <ArrowRight size={14} /></a>
            </div>
          </section>

          <section className="candidates-section" id="candidates">
            <div className="candidates-heading"><div><span className="section-kicker">TALENT PIPELINE</span><h2>Daftar kandidat <span className="result-count">{candidates.length}</span></h2><p>Kelola dan tinjau hasil evaluasi setiap kandidat.</p></div><div className="candidate-actions"><button className="secondary-action" onClick={() => setStatusMessage("Ekspor kandidat akan tersedia setelah backend penyimpanan diaktifkan.")}><ArrowDownToLine size={15} /> Ekspor</button><button className="secondary-action" onClick={() => setActiveFilter("Semua")}><Filter size={15} /> Filter</button></div></div>
            <div className="candidate-toolbar">
              <div className="search-box"><Search size={16} /><input ref={searchInput} value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Cari nama, posisi, atau file..." /><kbd>Ctrl K</kbd></div>
              <div className="filter-tabs">{["Semua", "Direkomendasikan", "Perlu ditinjau", "Tidak sesuai"].map((filter) => <button className={activeFilter === filter ? "filter-tab active" : "filter-tab"} onClick={() => setActiveFilter(filter)} key={filter}>{filter}<span>{filter === "Semua" ? candidates.length : candidates.filter((candidate) => filter === "Direkomendasikan" ? candidate.status === filter : candidate.status === filter).length}</span></button>)}</div>
              <button className="sort-button">Terbaru <ArrowDown size={14} /></button>
            </div>
            <div className="candidate-table-wrap">
              <table className="candidate-table">
                <thead><tr><th>KANDIDAT</th><th>POSISI</th><th>SKOR KECocokan</th><th>REKOMENDASI</th><th>DITAMBAHKAN</th><th aria-label="Aksi" /></tr></thead>
                <tbody>
                  {filteredCandidates.map((candidate) => <tr className={candidate.id === selectedId ? "selected-row" : ""} key={candidate.id} onClick={() => { setSelectedId(candidate.id); setDetailOpen(true); }}>
                    <td><div className="candidate-person"><span className={`candidate-avatar ${candidate.avatarColor}`}>{candidate.initials}</span><span><strong>{candidate.name}{candidate.isDemo && <em>DEMO</em>}</strong><small>{candidate.email}</small></span></div></td>
                    <td><span className="role-name">{candidate.role}</span><small className="file-name"><FileText size={12} />{candidate.fileName}</small></td>
                    <td><div className="score-cell"><span className={`score-number ${candidate.score >= 85 ? "score-high" : candidate.score < 70 && candidate.status !== "Memproses" ? "score-low" : ""}`}>{candidate.status === "Memproses" ? <LoaderCircle size={15} className="spin" /> : candidate.status === "Gagal" ? "—" : candidate.score}</span><span className="score-track"><i style={{ width: `${candidate.score}%` }} /></span></div></td>
                    <td><StatusBadge status={candidate.status} /></td>
                    <td><span className="added-date"><Clock3 size={13} />{candidate.addedAt}</span></td>
                    <td><button className="row-more" aria-label={`Aksi ${candidate.name}`} onClick={(event) => event.stopPropagation()}><MoreHorizontal size={18} /></button></td>
                  </tr>)}
                  {!filteredCandidates.length && <tr><td colSpan={6} className="table-empty"><Search size={21} /><strong>Kandidat tidak ditemukan</strong><span>Coba ubah kata pencarian atau filter.</span></td></tr>}
                </tbody>
              </table>
              <div className="table-footer"><span>Menampilkan <strong>{filteredCandidates.length}</strong> dari <strong>{candidates.length}</strong> kandidat <span className="demo-disclaimer">· Data contoh ditandai DEMO</span></span><div className="pagination"><button aria-label="Halaman sebelumnya" disabled><ChevronLeft size={16} /></button><button className="page-number">1</button><button aria-label="Halaman selanjutnya" disabled><ChevronRight size={16} /></button></div></div>
            </div>
          </section>
          <footer className="dashboard-footer"><span>© 2026 Kanso · Ruang kerja evaluasi talenta</span><span><span className="connection-dot" /> Sistem evaluasi aktif</span></footer>
        </div>
      </section>

      {selectedCandidate && <><button className={`detail-scrim ${detailOpen ? "detail-scrim-open" : ""}`} aria-label="Tutup detail kandidat" onClick={() => setDetailOpen(false)} /><aside className={`candidate-detail ${detailOpen ? "detail-open" : ""}`} aria-label={`Detail ${selectedCandidate.name}`}>
        <div className="detail-top"><span className="section-kicker">RINGKASAN PROFIL</span><button className="detail-close" aria-label="Tutup detail" onClick={() => setDetailOpen(false)}><X size={17} /></button></div>
        <div className="detail-person"><span className={`detail-avatar ${selectedCandidate.avatarColor}`}>{selectedCandidate.initials}</span><h2>{selectedCandidate.name}</h2><p>{selectedCandidate.role}</p><StatusBadge status={selectedCandidate.status} /></div>
        <div className="detail-score"><div><span>SKOR KECOCOKAN</span><strong>{selectedCandidate.status === "Memproses" ? "..." : selectedCandidate.score}<small>{selectedCandidate.status === "Memproses" ? "" : "/100"}</small></strong></div><div className="detail-score-ring" style={{ "--score": `${selectedCandidate.score * 3.6}deg` } as CSSProperties}><span>{selectedCandidate.score}</span></div></div>
        <div className="detail-summary"><span className="section-kicker">RINGKASAN AI</span><p>{selectedCandidate.summary}</p></div>
        <div className="detail-strengths"><span className="section-kicker">KEKUATAN UTAMA</span>{(selectedCandidate.strengths.length ? selectedCandidate.strengths : ["Belum ada hasil evaluasi"]).map((strength) => <div key={strength}><span><Check size={12} /></span>{strength}</div>)}</div>
        <div className="detail-file"><span className="pdf-icon"><FileText size={15} /></span><span><strong>Dokumen CV</strong><small>{selectedCandidate.fileName}</small></span><button aria-label="Unduh CV" onClick={() => setStatusMessage("File CV contoh tidak tersedia untuk diunduh.")}><ArrowDownToLine size={15} /></button></div>
        <button className="detail-action" onClick={() => setStatusMessage(`Detail evaluasi ${selectedCandidate.name} ditampilkan di panel ini.`)}>Lihat evaluasi lengkap <ArrowRight size={15} /></button>
      </aside></>}
    </main>
  );
}

function MetricCard({ label, value, change, detail, icon, tone }: { label: string; value: string; change: string; detail: string; icon: ReactNode; tone: string }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}>{icon}</span></div><div className="metric-value-row"><strong>{value}</strong><span className="metric-change">{tone === "green" ? <Check size={12} /> : <ArrowUpRight size={12} />}{change}</span></div><span className="metric-detail">{detail}</span></article>;
}

function PipelineRow({ label, count, total, tone }: { label: string; count: number; total: number; tone: string }) {
  const width = total ? Math.round(count / total * 100) : 0;
  return <div className="pipeline-row"><div><span className={`pipeline-dot ${tone}`} />{label}<strong>{count}</strong></div><span className="pipeline-track"><i className={tone} style={{ width: `${width}%` }} /></span></div>;
}

function StatusBadge({ status }: { status: CandidateStatus }) {
  const tone = status === "Direkomendasikan" ? "recommended" : status === "Perlu ditinjau" ? "review" : status === "Tidak sesuai" ? "rejected" : status === "Memproses" ? "processing" : "failed";
  return <span className={`status-badge ${tone}`}><i />{status}</span>;
}
