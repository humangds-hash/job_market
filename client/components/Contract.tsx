"use client";

import { useState, useCallback } from "react";
import {
  postJob,
  closeJob,
  getJob,
  listJobs,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="6" rx="2" />
      <path d="M12 6V3" />
      <path d="M7 10h10" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#34d399]/30 focus-within:shadow-[0_0_20px_rgba(52,211,153,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────────

function TextArea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#34d399]/30 focus-within:shadow-[0_0_20px_rgba(52,211,153,0.08)]">
        <textarea
          {...props}
          rows={3}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ────────────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Status Config ────────────────────────────────────────────

const JOB_STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  Open: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  Closed: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", variant: "warning" },
};

// ── Main Component ───────────────────────────────────────────

type Tab = "browse" | "post" | "close";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  const [postId, setPostId] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const [closeId, setCloseId] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  const [browseId, setBrowseId] = useState("");
  const [isBrowsing, setIsBrowsing] = useState(false);
  const [jobData, setJobData] = useState<Record<string, unknown> | null>(null);

  const [jobList, setJobList] = useState<number[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handlePostJob = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!postId.trim() || !postTitle.trim() || !postDesc.trim()) return setError("Fill in all fields");
    setError(null);
    setIsPosting(true);
    setTxStatus("Awaiting signature...");
    try {
      await postJob(walletAddress, parseInt(postId.trim()), postTitle.trim(), postDesc.trim());
      setTxStatus("Job posted on-chain!");
      setPostId("");
      setPostTitle("");
      setPostDesc("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsPosting(false);
    }
  }, [walletAddress, postId, postTitle, postDesc]);

  const handleCloseJob = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!closeId.trim()) return setError("Enter a job ID");
    setError(null);
    setIsClosing(true);
    setTxStatus("Awaiting signature...");
    try {
      await closeJob(walletAddress, parseInt(closeId.trim()));
      setTxStatus("Job closed on-chain!");
      setCloseId("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsClosing(false);
    }
  }, [walletAddress, closeId]);

  const handleBrowseJob = useCallback(async () => {
    if (!browseId.trim()) return setError("Enter a job ID");
    setError(null);
    setIsBrowsing(true);
    setJobData(null);
    try {
      const result = await getJob(parseInt(browseId.trim()), walletAddress || undefined);
      if (result && typeof result === "object") {
        setJobData(result as Record<string, unknown>);
      } else {
        setError("Job not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsBrowsing(false);
    }
  }, [browseId, walletAddress]);

  const handleListJobs = useCallback(async () => {
    setError(null);
    setIsLoadingList(true);
    try {
      const result = await listJobs(walletAddress || undefined);
      if (Array.isArray(result)) {
        setJobList(result as number[]);
      } else {
        setJobList([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load jobs");
    } finally {
      setIsLoadingList(false);
    }
  }, [walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "browse", label: "Browse", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "post", label: "Post Job", icon: <PlusIcon />, color: "#34d399" },
    { key: "close", label: "Close", icon: <XIcon />, color: "#f87171" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("updated") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#34d399]/20 to-[#7c6cf0]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#34d399]">
                  <rect width="20" height="14" x="2" y="6" rx="2" />
                  <path d="M12 6V3" />
                  <path d="M7 10h10" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Job Marketplace</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setJobData(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Browse */}
            {activeTab === "browse" && (
              <div className="space-y-5">
                <MethodSignature name="get_job" params="(id: u64)" returns="-> Job" color="#4fc3f7" />
                <Input label="Job ID" value={browseId} onChange={(e) => setBrowseId(e.target.value)} placeholder="e.g. 1" />
                
                <ShimmerButton onClick={handleBrowseJob} disabled={isBrowsing} shimmerColor="#4fc3f7" className="w-full">
                  {isBrowsing ? <><SpinnerIcon /> Searching...</> : <><SearchIcon /> Find Job</>}
                </ShimmerButton>

                {/* List All Jobs Button */}
                <div className="pt-2">
                  <button
                    onClick={handleListJobs}
                    disabled={isLoadingList}
                    className="text-xs text-white/40 hover:text-white/70 transition-colors underline"
                  >
                    {isLoadingList ? "Loading..." : "List all job IDs"}
                  </button>
                  {jobList.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {jobList.map((id) => (
                        <button
                          key={id}
                          onClick={() => setBrowseId(String(id))}
                          className="rounded-lg bg-white/[0.04] px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/[0.08] transition-colors"
                        >
                          #{id}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {jobData && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Job Details</span>
                      {(() => {
                        const isOpen = jobData.is_open;
                        const status = isOpen ? "Open" : "Closed";
                        const cfg = JOB_STATUS_CONFIG[status];
                        return cfg ? (
                          <Badge variant={cfg.variant}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
                            {status}
                          </Badge>
                        ) : (
                          <Badge>Unknown</Badge>
                        );
                      })()}
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Job ID</span>
                        <span className="font-mono text-sm text-white/80">#{String(jobData.id)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Employer</span>
                        <span className="font-mono text-xs text-white/60 truncate max-w-[150px]">{String(jobData.employer)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Title</span>
                        <span className="font-mono text-sm text-white/80">{String(jobData.title)}</span>
                      </div>
                      <div className="border-t border-white/[0.04] pt-3">
                        <span className="text-xs text-white/35 block mb-1">Description</span>
                        <p className="text-sm text-white/70 leading-relaxed">{String(jobData.description)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Post Job */}
            {activeTab === "post" && (
              <div className="space-y-5">
                <MethodSignature name="post_job" params="(id: u64, title: String, description: String)" color="#34d399" />
                <Input label="Job ID" value={postId} onChange={(e) => setPostId(e.target.value)} placeholder="e.g. 1" />
                <Input label="Job Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} placeholder="e.g. Senior Rust Developer" />
                <TextArea label="Description" value={postDesc} onChange={(e) => setPostDesc(e.target.value)} placeholder="e.g. Looking for an experienced Rust developer..." />
                
                {walletAddress ? (
                  <ShimmerButton onClick={handlePostJob} disabled={isPosting} shimmerColor="#34d399" className="w-full">
                    {isPosting ? <><SpinnerIcon /> Posting...</> : <><PlusIcon /> Post Job</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to post jobs
                  </button>
                )}
              </div>
            )}

            {/* Close Job */}
            {activeTab === "close" && (
              <div className="space-y-5">
                <MethodSignature name="close_job" params="(employer: Address, id: u64)" color="#f87171" />
                <Input label="Job ID" value={closeId} onChange={(e) => setCloseId(e.target.value)} placeholder="e.g. 1" />
                <p className="text-xs text-white/30">Only the employer who posted the job can close it.</p>

                {walletAddress ? (
                  <ShimmerButton onClick={handleCloseJob} disabled={isClosing} shimmerColor="#f87171" className="w-full">
                    {isClosing ? <><SpinnerIcon /> Closing...</> : <><XIcon /> Close Job</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#f87171]/20 bg-[#f87171]/[0.03] py-4 text-sm text-[#f87171]/60 hover:border-[#f87171]/30 hover:text-[#f87171]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to close jobs
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Job Marketplace · Soroban</p>
            <div className="flex items-center gap-2">
              {["Open", "Closed"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn("h-1 w-1 rounded-full", JOB_STATUS_CONFIG[s]?.dot ?? "bg-white/20")} />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 1 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}