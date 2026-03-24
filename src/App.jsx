import { useState, useCallback, useEffect } from "react";

// ─── Initial hub JSON config ────────────────────────────────────────────────
const INITIAL_CONFIG = {
  meta: {
    lastUpdatedBy: "system",
    lastUpdatedAt: "2026-03-20T09:00:00Z",
    version: "1.0.0"
  },
  hero: {
    headline: "B&H for Business",
    subheadline: "Exclusive pricing, cooperative contracts, and dedicated support for organizations of every size.",
    badge: "Trusted by 50,000+ organizations",
    ctaLabel: "Get Started — Tell Us About Your Organization",
    ctaSubtext: "No commitment required. Takes 2 minutes."
  },
  signupForm: {
    title: "Let's find the right solution for you.",
    subtitle: "Answer a few questions and we'll match you with the contracts, pricing, and portal that fit your organization.",
    orgTypes: [
      { id: "higher_ed",   label: "College / University",          segment: "higher_ed",  icon: "🎓" },
      { id: "k12",         label: "K-12 School / District",        segment: "k12",        icon: "🏫" },
      { id: "federal",     label: "Federal Agency",                segment: "federal",    icon: "🏛️" },
      { id: "state_local", label: "State / Local Government",      segment: "state_local",icon: "🗺️" },
      { id: "nonprofit",   label: "Nonprofit / Faith Organization", segment: "nonprofit",  icon: "🤝" },
      { id: "healthcare",  label: "Healthcare Organization",        segment: "healthcare", icon: "🏥" },
      { id: "corporate",   label: "Corporation / Enterprise",       segment: "corporate",  icon: "🏢" },
      { id: "smb",         label: "Small Business",                segment: "smb",        icon: "🛍️" },
      { id: "creative",    label: "Production / Creative Studio",  segment: "creative",   icon: "🎬" },
      { id: "si",          label: "Systems Integrator",            segment: "si",         icon: "🔧" },
      { id: "diversity",   label: "Diversity Supplier",            segment: "diversity",  icon: "⭐" },
      { id: "intl",        label: "International Organization",    segment: "intl",       icon: "🌐" }
    ]
  },
  segments: {
    higher_ed:   { name: "Higher Education",          color: "#007AB8", description: "Access E&I, MHEC, and other education cooperative contracts. Auto-verified via .edu domain." },
    k12:         { name: "K-12 / State & Local",      color: "#3F9A59", description: "TIPS, BuyBoard, PEPPM, Omnia, and Equalis contracts for public schools and districts." },
    federal:     { name: "Federal Marketplace",       color: "#990000", description: "GSA Schedule and federal procurement portals with dedicated government pricing." },
    state_local: { name: "State & Local Government",  color: "#E67300", description: "Cooperative purchasing through TIPS, Omnia, and Equalis with .gov auto-verification." },
    nonprofit:   { name: "Nonprofit / Faith",         color: "#8B4513", description: "Tax-exempt purchasing with net terms eligibility and simplified sign-up." },
    healthcare:  { name: "Healthcare",                color: "#2E86AB", description: "HIPAA-aware procurement with D&B verified organizational accounts." },
    corporate:   { name: "Corporate / Enterprise",    color: "#333333", description: "Custom portals, eProcurement integration, and dedicated account management." },
    smb:         { name: "Small Business",            color: "#6B21A8", description: "Straightforward B2B pricing with net terms and business verification." },
    creative:    { name: "Production & Post",         color: "#B45309", description: "Studio Hub — specialized gear sourcing for production houses and post facilities." },
    si:          { name: "Systems Integrator",        color: "#0F766E", description: "Volume pricing, project support, and integration partner benefits." },
    diversity:   { name: "Diversity Suppliers",       color: "#BE185D", description: "MBE, WBE, and SBE certified supplier accounts with tailored support." },
    intl:        { name: "International",             color: "#1D4ED8", description: "Export licensing, international shipping, and English-speaking rep access." }
  },
  contracts: [
    { id: "ei",      name: "E&I Cooperative",        logoLabel: "E&I",      contractNumber: "CNR01261", active: true,  segments: ["higher_ed"],               description: "The leading higher education cooperative, trusted by 1,900+ institutions." },
    { id: "omnia",   name: "Omnia Partners",         logoLabel: "OMNIA",    contractNumber: "R191902",  active: true,  segments: ["k12","state_local"],        description: "Cooperative purchasing for public sector — state, local, and education." },
    { id: "tips",    name: "TIPS-USA",               logoLabel: "TIPS",     contractNumber: "210102",   active: true,  segments: ["k12","state_local"],        description: "Interlocal purchasing cooperative for Texas and nationwide agencies." },
    { id: "buyboard",name: "BuyBoard",               logoLabel: "BUYBOARD", contractNumber: "589-19",   active: true,  segments: ["k12","state_local"],        description: "Texas-based purchasing cooperative with nationwide reach." },
    { id: "peppm",   name: "PEPPM",                  logoLabel: "PEPPM",    contractNumber: "PP-2021",  active: true,  segments: ["k12"],                      description: "Pennsylvania's statewide purchasing cooperative for K-12." },
    { id: "equalis", name: "Equalis Group",          logoLabel: "EQUALIS",  contractNumber: "EQ-0421",  active: true,  segments: ["k12","state_local"],        description: "National cooperative purchasing organization for government and education." },
    { id: "mhec",    name: "MHEC",                   logoLabel: "MHEC",     contractNumber: "2021-14",  active: true,  segments: ["higher_ed"],               description: "Maryland Higher Education Consortium — cooperative contract." }
  ],
  errorStates: {
    dnb_no_match:   { message: "We couldn't verify your business automatically.", cta: "Request Manual Review", ctaTarget: "manual_review" },
    dnb_timeout:    { message: "Our verification service is temporarily unavailable.", cta: "Try Again", ctaTarget: "retry" },
    domain_mismatch:{ message: "Your email domain doesn't match an approved institution list.", cta: "Request Manual Review", ctaTarget: "manual_review" }
  },
  footer: {
    contactEmail: "b2b@bhphotovideo.com",
    repPhone: "1-800-952-9005",
    tagline: "B&H Photo Video Pro Audio · Serving Business & Government Since 1973"
  }
};

// ─── Users ──────────────────────────────────────────────────────────────────
const USERS = [
  { id: "ariel",  name: "Ariel Goldman",  role: "B2B Manager",        avatar: "AG", canDirectPublish: true  },
  { id: "jerel",  name: "Jerel Smith",    role: "Senior PM",           avatar: "JS", canDirectPublish: false },
  { id: "josh",   name: "Josh Bernstein", role: "Project Management",  avatar: "JB", canDirectPublish: false },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const ts = () => new Date().toISOString();
const fmtTs = (s) => new Date(s).toLocaleString("en-US", { month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
const deepClone = (o) => JSON.parse(JSON.stringify(o));

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [liveConfig, setLiveConfig]       = useState(deepClone(INITIAL_CONFIG));
  const [draftConfig, setDraftConfig]     = useState(deepClone(INITIAL_CONFIG));
  const [pendingChanges, setPendingChanges] = useState([]);
  const [currentUser, setCurrentUser]     = useState(USERS[0]);
  const [activeView, setActiveView]       = useState("hub");       // hub | admin | approvals
  const [adminTab, setAdminTab]           = useState("form");      // form | json
  const [jsonText, setJsonText]           = useState(JSON.stringify(INITIAL_CONFIG, null, 2));
  const [jsonError, setJsonError]         = useState(null);
  const [toast, setToast]                 = useState(null);
  const [activeSection, setActiveSection] = useState("hero");      // which admin section is open
  const [hubStep, setHubStep]             = useState("entry");     // entry | step1 | step2 | step3 | result
  const [signupData, setSignupData]       = useState({ orgType: null, state: "", firstName: "", lastName: "", email: "", orgName: "", phone: "", purchaseVolume: "", primaryNeed: "" });
  const [deducedSegment, setDeducedSegment] = useState(null);
  const [hasUnsaved, setHasUnsaved]       = useState(false);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  // sync draft → jsonText when switching to json tab
  useEffect(() => {
    if (adminTab === "json") setJsonText(JSON.stringify(draftConfig, null, 2));
  }, [adminTab]);

  const handleJsonChange = (val) => {
    setJsonText(val);
    try { const p = JSON.parse(val); setDraftConfig(p); setJsonError(null); setHasUnsaved(true); }
    catch(e) { setJsonError(e.message); }
  };

  const markDraftChanged = (updater) => {
    setDraftConfig(prev => { const n = deepClone(prev); updater(n); return n; });
    setHasUnsaved(true);
  };

  const handlePublishOrSubmit = () => {
    if (currentUser.canDirectPublish) {
      const next = deepClone(draftConfig);
      next.meta.lastUpdatedBy = currentUser.name;
      next.meta.lastUpdatedAt = ts();
      next.meta.version = bumpVersion(liveConfig.meta.version);
      setLiveConfig(next);
      setDraftConfig(next);
      setHasUnsaved(false);
      showToast("Changes published live. Hub updated immediately.", "success");
    } else {
      const change = {
        id: Math.random().toString(36).slice(2),
        submittedBy: currentUser.name,
        submittedById: currentUser.id,
        submittedAt: ts(),
        draft: deepClone(draftConfig),
        diff: computeDiff(liveConfig, draftConfig),
        status: "pending"
      };
      setPendingChanges(prev => [...prev, change]);
      setHasUnsaved(false);
      showToast(`Submitted for Ariel Goldman's approval.`, "info");
    }
  };

  const handleApprove = (changeId) => {
    const change = pendingChanges.find(c => c.id === changeId);
    if (!change) return;
    const next = deepClone(change.draft);
    next.meta.lastUpdatedBy = change.submittedBy + " (approved by Ariel Goldman)";
    next.meta.lastUpdatedAt = ts();
    next.meta.version = bumpVersion(liveConfig.meta.version);
    setLiveConfig(next);
    setDraftConfig(next);
    setPendingChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: "approved" } : c));
    showToast("Change approved and published live.", "success");
  };

  const handleReject = (changeId) => {
    setPendingChanges(prev => prev.map(c => c.id === changeId ? { ...c, status: "rejected" } : c));
    showToast("Change rejected. Submitter has been notified.", "error");
  };

  const deduceSegment = () => {
    const { orgType } = signupData;
    if (!orgType) return;
    setDeducedSegment(orgType.segment);
    setHubStep("result");
  };

  const pendingCount = pendingChanges.filter(c => c.status === "pending").length;

  return (
    <div style={{ fontFamily: "'Open Sans', sans-serif", background: "#f5f5f5", minHeight: "100vh", color: "#333" }}>
      {/* ── Global Toast ── */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: toast.type === "success" ? "#3F9A59" : toast.type === "error" ? "#990000" : "#007AB8",
          color: "#fff", padding: "12px 20px", borderRadius: 6,
          boxShadow: "0 4px 20px rgba(0,0,0,.25)", fontWeight: 600, fontSize: 14,
          animation: "slideIn .2s ease"
        }}>
          {toast.type === "success" ? "✓ " : toast.type === "error" ? "✗ " : "ℹ "}{toast.msg}
        </div>
      )}

      {/* ── Top Nav ── */}
      <nav style={{ background: "#1a1a1a", borderBottom: "3px solid #990000", padding: "0 24px", display: "flex", alignItems: "center", gap: 0, height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginRight: 32 }}>
          <div style={{ width: 28, height: 28, background: "#990000", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#fff", letterSpacing: 1, fontFamily: "Montserrat, sans-serif" }}>B&H</div>
          <span style={{ color: "#fff", fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 15, letterSpacing: .5 }}>B2B Hub</span>
          <span style={{ background: "#990000", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: 1 }}>JSON MVP</span>
        </div>

        {/* Nav tabs */}
        {[
          { id: "hub",       label: "Hub Preview",   icon: "👁" },
          { id: "admin",     label: "JSON Editor",   icon: "✏️" },
          { id: "approvals", label: `Approvals${pendingCount > 0 ? ` (${pendingCount})` : ""}`, icon: "✅" }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id)} style={{
            background: activeView === tab.id ? "#990000" : "transparent",
            color: activeView === tab.id ? "#fff" : "#aaa",
            border: "none", padding: "0 20px", height: 56, cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "Open Sans, sans-serif",
            borderBottom: activeView === tab.id ? "3px solid #ff4444" : "3px solid transparent",
            transition: "all .15s", display: "flex", alignItems: "center", gap: 6
          }}>
            <span>{tab.icon}</span>{tab.label}
          </button>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {/* User switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#2a2a2a", borderRadius: 6, padding: "4px 8px" }}>
            <span style={{ color: "#666", fontSize: 11 }}>Logged in as:</span>
            <select value={currentUser.id} onChange={e => setCurrentUser(USERS.find(u => u.id === e.target.value))} style={{
              background: "transparent", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none"
            }}>
              {USERS.map(u => <option key={u.id} value={u.id} style={{ background: "#222", color: "#fff" }}>{u.name} ({u.role})</option>)}
            </select>
            <div style={{ width: 26, height: 26, background: "#990000", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>
              {currentUser.avatar}
            </div>
          </div>
          {/* Version badge */}
          <span style={{ color: "#555", fontSize: 11 }}>live v{liveConfig.meta.version}</span>
        </div>
      </nav>

      {/* ── Views ── */}
      {activeView === "hub"       && <HubView       config={liveConfig} hubStep={hubStep} setHubStep={setHubStep} signupData={signupData} setSignupData={setSignupData} deducedSegment={deducedSegment} deduceSegment={deduceSegment} setDeducedSegment={setDeducedSegment} />}
      {activeView === "admin"     && <AdminView      config={draftConfig} liveConfig={liveConfig} onChange={markDraftChanged} adminTab={adminTab} setAdminTab={setAdminTab} jsonText={jsonText} jsonError={jsonError} onJsonChange={handleJsonChange} currentUser={currentUser} onPublishOrSubmit={handlePublishOrSubmit} hasUnsaved={hasUnsaved} activeSection={activeSection} setActiveSection={setActiveSection} />}
      {activeView === "approvals" && <ApprovalsView  pendingChanges={pendingChanges} liveConfig={liveConfig} currentUser={currentUser} onApprove={handleApprove} onReject={handleReject} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Open+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes slideIn { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeUp  { from { transform: translateY(12px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        select option { background: #1a1a1a; }
      `}</style>
    </div>
  );
}

// ─── Hub View ─────────────────────────────────────────────────────────────────
function HubView({ config, hubStep, setHubStep, signupData, setSignupData, deducedSegment, deduceSegment, setDeducedSegment }) {
  const c = config;
  const seg = deducedSegment ? c.segments[deducedSegment] : null;
  const relevantContracts = deducedSegment ? c.contracts.filter(ct => ct.active && ct.segments.includes(deducedSegment)) : [];
  const orgType = signupData.orgType;

  const resetHub = () => { setHubStep("entry"); setSignupData({ orgType: null, state: "", firstName: "", lastName: "", email: "", orgName: "", phone: "", purchaseVolume: "", primaryNeed: "" }); setDeducedSegment(null); };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
      {/* Live config bar */}
      <div style={{ background: "#fff3cd", border: "1px solid #ffc107", borderRadius: 6, padding: "8px 14px", marginBottom: 20, fontSize: 12, color: "#856404", display: "flex", justifyContent: "space-between" }}>
        <span>📡 Hub rendering live config <strong>v{c.meta.version}</strong> — last updated by <strong>{c.meta.lastUpdatedBy}</strong> at {fmtTs(c.meta.lastUpdatedAt)}</span>
        <span style={{ color: "#999" }}>Switch to JSON Editor tab to make changes</span>
      </div>

      {/* ── Entry State ── */}
      {hubStep === "entry" && (
        <div style={{ animation: "fadeUp .3s ease" }}>
          {/* Hero */}
          <div style={{ background: "#0a0a0a", borderRadius: 12, overflow: "hidden", marginBottom: 24, position: "relative" }}>
            <div style={{ background: "linear-gradient(135deg, #990000 0%, #660000 50%, #1a1a1a 100%)", padding: "52px 48px", position: "relative" }}>
              <div style={{ background: "#990000", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, display: "inline-block", marginBottom: 16, letterSpacing: 1 }}>
                {c.hero.badge}
              </div>
              <h1 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 42, fontWeight: 800, color: "#fff", marginBottom: 16, lineHeight: 1.15, letterSpacing: -0.5 }}>
                {c.hero.headline}
              </h1>
              <p style={{ color: "#EFD8D5", fontSize: 17, marginBottom: 32, maxWidth: 560, lineHeight: 1.6 }}>{c.hero.subheadline}</p>
              <button onClick={() => setHubStep("step1")} style={{
                background: "#fff", color: "#990000", border: "none", padding: "16px 28px",
                borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: "pointer",
                fontFamily: "Montserrat, sans-serif", letterSpacing: .3,
                boxShadow: "0 4px 20px rgba(0,0,0,.3)", transition: "transform .15s"
              }}>
                {c.hero.ctaLabel} →
              </button>
              <div style={{ color: "#EFD8D5", fontSize: 12, marginTop: 10 }}>{c.hero.ctaSubtext}</div>
            </div>
          </div>

          {/* Segment preview grid */}
          <div style={{ marginBottom: 12 }}>
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, fontWeight: 700, color: "#666", marginBottom: 14, letterSpacing: .5, textTransform: "uppercase" }}>
              We serve 12 organization types
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {c.signupForm.orgTypes.map(ot => (
                <button key={ot.id} onClick={() => { setSignupData(p => ({ ...p, orgType: ot })); setHubStep("step2"); }} style={{
                  background: "#fff", border: "1.5px solid #e5e5e5", borderRadius: 8, padding: "14px 10px",
                  cursor: "pointer", textAlign: "center", transition: "all .15s",
                  fontSize: 12, color: "#333", fontWeight: 600, fontFamily: "Open Sans, sans-serif"
                }}>
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{ot.icon}</div>
                  {ot.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contract strip */}
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5", padding: "20px 24px", marginTop: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Active cooperative contracts</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {c.contracts.filter(ct => ct.active).map(ct => (
                <div key={ct.id} style={{ background: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 700, color: "#333" }}>
                  {ct.logoLabel} <span style={{ color: "#999", fontWeight: 400 }}>#{ct.contractNumber}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Org Type ── */}
      {hubStep === "step1" && (
        <div style={{ animation: "fadeUp .3s ease", maxWidth: 720, margin: "0 auto" }}>
          <StepHeader step={1} total={3} title={c.signupForm.title} subtitle={c.signupForm.subtitle} onBack={resetHub} />
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 32 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .5, display: "block", marginBottom: 16 }}>What type of organization are you with?</label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {c.signupForm.orgTypes.map(ot => (
                <button key={ot.id} onClick={() => setSignupData(p => ({ ...p, orgType: ot }))} style={{
                  background: signupData.orgType?.id === ot.id ? "#EFD8D5" : "#fafafa",
                  border: `2px solid ${signupData.orgType?.id === ot.id ? "#990000" : "#e5e5e5"}`,
                  borderRadius: 8, padding: "14px 10px", cursor: "pointer", textAlign: "center",
                  fontSize: 12, color: "#333", fontWeight: 600, fontFamily: "Open Sans, sans-serif", transition: "all .15s"
                }}>
                  <div style={{ fontSize: 24, marginBottom: 6 }}>{ot.icon}</div>
                  {ot.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => signupData.orgType && setHubStep("step2")} style={{
                background: signupData.orgType ? "#990000" : "#ccc", color: "#fff", border: "none",
                padding: "14px 32px", borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: signupData.orgType ? "pointer" : "not-allowed",
                fontFamily: "Montserrat, sans-serif", transition: "background .15s"
              }}>
                Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Contact Info ── */}
      {hubStep === "step2" && (
        <div style={{ animation: "fadeUp .3s ease", maxWidth: 720, margin: "0 auto" }}>
          <StepHeader step={2} total={3} title="Tell us about yourself" subtitle={`Getting set up for ${signupData.orgType?.label || "your organization"}`} onBack={() => setHubStep("step1")} />
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 32 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <FormField label="First Name" value={signupData.firstName} onChange={v => setSignupData(p => ({ ...p, firstName: v }))} placeholder="Jane" />
              <FormField label="Last Name"  value={signupData.lastName}  onChange={v => setSignupData(p => ({ ...p, lastName: v }))}  placeholder="Smith" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <FormField label="Business Email" value={signupData.email} onChange={v => setSignupData(p => ({ ...p, email: v }))} placeholder="jane@university.edu" type="email" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
              <FormField label="Organization Name" value={signupData.orgName} onChange={v => setSignupData(p => ({ ...p, orgName: v }))} placeholder="State University" />
              <FormField label="Business Phone" value={signupData.phone} onChange={v => setSignupData(p => ({ ...p, phone: v }))} placeholder="(212) 555-0100" type="tel" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 6 }}>State</label>
                <select value={signupData.state} onChange={e => setSignupData(p => ({ ...p, state: e.target.value }))} style={{ width: "100%", padding: "11px 12px", border: "1.5px solid #ddd", borderRadius: 7, fontSize: 14, outline: "none", background: "#fff" }}>
                  <option value="">Select state…</option>
                  {["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 6 }}>Annual Purchase Volume</label>
                <select value={signupData.purchaseVolume} onChange={e => setSignupData(p => ({ ...p, purchaseVolume: e.target.value }))} style={{ width: "100%", padding: "11px 12px", border: "1.5px solid #ddd", borderRadius: 7, fontSize: 14, outline: "none", background: "#fff" }}>
                  <option value="">Estimate…</option>
                  <option>Under $10,000</option>
                  <option>$10,000 – $50,000</option>
                  <option>$50,000 – $250,000</option>
                  <option>$250,000 – $1M</option>
                  <option>Over $1M</option>
                </select>
              </div>
            </div>
            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setHubStep("step1")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14 }}>← Back</button>
              <button onClick={() => setHubStep("step3")} style={{
                background: "#990000", color: "#fff", border: "none", padding: "14px 32px",
                borderRadius: 8, fontWeight: 700, fontSize: 15, cursor: "pointer", fontFamily: "Montserrat, sans-serif"
              }}>Continue →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Confirm & Deduce ── */}
      {hubStep === "step3" && (
        <div style={{ animation: "fadeUp .3s ease", maxWidth: 720, margin: "0 auto" }}>
          <StepHeader step={3} total={3} title="One last thing" subtitle="This helps us find the right contracts and portal for you." onBack={() => setHubStep("step2")} />
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 32 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .5, display: "block", marginBottom: 16 }}>What's your primary purchasing need?</label>
            {["Equipment for a specific project","Ongoing / recurring hardware purchases","Cooperative contract compliance","Setting up an eProcurement integration","Net terms / credit account","Just exploring options"].map(opt => (
              <button key={opt} onClick={() => setSignupData(p => ({ ...p, primaryNeed: opt }))} style={{
                display: "block", width: "100%", marginBottom: 10, background: signupData.primaryNeed === opt ? "#EFD8D5" : "#fafafa",
                border: `2px solid ${signupData.primaryNeed === opt ? "#990000" : "#e5e5e5"}`, borderRadius: 8,
                padding: "14px 20px", cursor: "pointer", textAlign: "left", fontSize: 14, fontWeight: signupData.primaryNeed === opt ? 700 : 500, transition: "all .15s"
              }}>{opt}</button>
            ))}

            {/* Summary card */}
            <div style={{ background: "#f5f5f5", borderRadius: 8, padding: 16, marginTop: 20, fontSize: 13, color: "#555" }}>
              <strong style={{ color: "#333" }}>Your profile:</strong> {orgType?.label}{signupData.state ? ` · ${signupData.state}` : ""}{signupData.orgName ? ` · ${signupData.orgName}` : ""}
            </div>

            <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={() => setHubStep("step2")} style={{ background: "none", border: "none", color: "#666", cursor: "pointer", fontSize: 14 }}>← Back</button>
              <button onClick={deduceSegment} style={{
                background: "#990000", color: "#fff", border: "none", padding: "16px 36px",
                borderRadius: 8, fontWeight: 800, fontSize: 16, cursor: "pointer", fontFamily: "Montserrat, sans-serif",
                boxShadow: "0 4px 16px rgba(153,0,0,.3)"
              }}>Find My Portal →</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Result ── */}
      {hubStep === "result" && seg && (
        <div style={{ animation: "fadeUp .3s ease", maxWidth: 780, margin: "0 auto" }}>
          <div style={{ background: seg.color, borderRadius: 12, padding: "32px 36px", marginBottom: 24, position: "relative" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,.7)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Your matched segment</div>
            <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 30, fontWeight: 800, color: "#fff", marginBottom: 10 }}>{seg.name}</h2>
            <p style={{ color: "rgba(255,255,255,.85)", fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>{seg.description}</p>
            <div style={{ background: "rgba(0,0,0,.15)", borderRadius: 6, padding: "10px 14px", fontSize: 12, color: "rgba(255,255,255,.7)" }}>
              ✓ Segment deduced from: <strong style={{ color: "#fff" }}>{orgType?.label}{signupData.state ? `, ${signupData.state}` : ""}</strong>
            </div>
          </div>

          {relevantContracts.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 28, marginBottom: 20 }}>
              <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 16, fontWeight: 700, marginBottom: 18, color: "#333" }}>Available contracts for your organization</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {relevantContracts.map(ct => (
                  <div key={ct.id} style={{ border: "1.5px solid #e0e0e0", borderRadius: 8, padding: "16px 18px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <span style={{ background: "#f0f0f0", fontWeight: 800, fontSize: 12, padding: "4px 10px", borderRadius: 4, letterSpacing: .5 }}>{ct.logoLabel}</span>
                      <span style={{ fontSize: 11, color: "#999" }}>#{ct.contractNumber}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{ct.name}</div>
                    <div style={{ fontSize: 12, color: "#666" }}>{ct.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {relevantContracts.length === 0 && (
            <div style={{ background: "#fff3cd", borderRadius: 10, border: "1px solid #ffc107", padding: 20, marginBottom: 20, fontSize: 14, color: "#856404" }}>
              No cooperative contracts are directly listed for this segment — your account will be managed directly. A B2B representative will reach out within 1 business day.
            </div>
          )}

          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e5e5", padding: 24 }}>
            <h3 style={{ fontFamily: "Montserrat, sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Ready to create your account?</h3>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{ flex: 1, background: "#990000", color: "#fff", border: "none", padding: "14px", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "Montserrat, sans-serif" }}>Create My Account →</button>
              <button onClick={resetHub} style={{ background: "#f0f0f0", color: "#666", border: "none", padding: "14px 20px", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Start Over</button>
            </div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 10 }}>📧 Questions? {c.footer.contactEmail} · 📞 {c.footer.repPhone}</div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: 40, padding: "20px 0", borderTop: "1px solid #e5e5e5", fontSize: 12, color: "#999" }}>
        {c.footer.tagline}
      </div>
    </div>
  );
}

function StepHeader({ step, total, title, subtitle, onBack }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#999", cursor: "pointer", fontSize: 13 }}>← Back</button>
        <div style={{ flex: 1, height: 4, background: "#e5e5e5", borderRadius: 2, overflow: "hidden" }}>
          <div style={{ width: `${(step / total) * 100}%`, height: "100%", background: "#990000", borderRadius: 2, transition: "width .3s" }} />
        </div>
        <span style={{ fontSize: 12, color: "#999", fontWeight: 600 }}>Step {step} of {total}</span>
      </div>
      <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 24, fontWeight: 800, marginBottom: 6 }}>{title}</h2>
      <p style={{ color: "#666", fontSize: 14 }}>{subtitle}</p>
    </div>
  );
}

function FormField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={{
        width: "100%", padding: "11px 12px", border: "1.5px solid #ddd", borderRadius: 7,
        fontSize: 14, outline: "none", fontFamily: "Open Sans, sans-serif",
        transition: "border-color .15s"
      }} onFocus={e => e.target.style.borderColor="#990000"} onBlur={e => e.target.style.borderColor="#ddd"} />
    </div>
  );
}

// ─── Admin View ───────────────────────────────────────────────────────────────
function AdminView({ config, liveConfig, onChange, adminTab, setAdminTab, jsonText, jsonError, onJsonChange, currentUser, onPublishOrSubmit, hasUnsaved, activeSection, setActiveSection }) {
  const sections = [
    { id: "hero",      label: "Hero",         icon: "🎯" },
    { id: "signup",    label: "Sign-Up Form",  icon: "📝" },
    { id: "segments",  label: "Segments",      icon: "🏷" },
    { id: "contracts", label: "Contracts",     icon: "📋" },
    { id: "errors",    label: "Error States",  icon: "⚠️" },
    { id: "footer",    label: "Footer",        icon: "📌" },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px", display: "flex", gap: 24 }}>
      {/* Sidebar */}
      <div style={{ width: 210, flexShrink: 0 }}>
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden", marginBottom: 16 }}>
          <div style={{ background: "#f5f5f5", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textTransform: "uppercase" }}>Sections</div>
          {sections.map(s => (
            <button key={s.id} onClick={() => { setActiveSection(s.id); setAdminTab("form"); }} style={{
              display: "block", width: "100%", padding: "11px 14px", background: activeSection === s.id && adminTab === "form" ? "#EFD8D5" : "transparent",
              border: "none", borderBottom: "1px solid #f0f0f0", cursor: "pointer",
              textAlign: "left", fontSize: 13, fontWeight: activeSection === s.id ? 700 : 500,
              color: activeSection === s.id ? "#990000" : "#444", display: "flex", alignItems: "center", gap: 8
            }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
        </div>

        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5", overflow: "hidden" }}>
          <div style={{ background: "#f5f5f5", padding: "10px 14px", fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textTransform: "uppercase" }}>Raw JSON</div>
          <button onClick={() => setAdminTab("json")} style={{
            display: "block", width: "100%", padding: "11px 14px",
            background: adminTab === "json" ? "#EFD8D5" : "transparent",
            border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, fontWeight: adminTab === "json" ? 700 : 500,
            color: adminTab === "json" ? "#990000" : "#444", display: "flex", alignItems: "center", gap: 8
          }}>
            <span>{ "{}" }</span> Full JSON Editor
          </button>
        </div>

        <div style={{ marginTop: 16, background: "#fff", borderRadius: 10, border: "1px solid #e5e5e5", padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Live Config</div>
          <div style={{ fontSize: 11, color: "#555" }}><strong>Version:</strong> {liveConfig.meta.version}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}><strong>By:</strong> {liveConfig.meta.lastUpdatedBy}</div>
          <div style={{ fontSize: 11, color: "#555", marginTop: 4 }}><strong>At:</strong> {fmtTs(liveConfig.meta.lastUpdatedAt)}</div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1 }}>
        {/* Mode tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 0, background: "#fff", border: "1px solid #e5e5e5", borderBottom: "none", borderRadius: "10px 10px 0 0", overflow: "hidden" }}>
          <div style={{ padding: "12px 18px", fontSize: 13, fontWeight: 700, color: adminTab === "json" ? "#990000" : "#999", borderBottom: `2px solid ${adminTab !== "json" ? "#990000" : "transparent"}` }}>
            {adminTab !== "json" ? `✏️ Editing: ${sections.find(s => s.id === activeSection)?.label}` : "{ } Raw JSON"}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", padding: "0 14px", gap: 10 }}>
            {hasUnsaved && <span style={{ fontSize: 12, background: "#fff3cd", color: "#856404", padding: "3px 8px", borderRadius: 4, fontWeight: 600 }}>● Unsaved changes</span>}
            <div style={{ fontSize: 12, color: "#999" }}>
              {currentUser.canDirectPublish ? "🟢 Direct publish" : "📋 Submit for approval"}
            </div>
            <button onClick={onPublishOrSubmit} disabled={!hasUnsaved} style={{
              background: hasUnsaved ? (currentUser.canDirectPublish ? "#3F9A59" : "#007AB8") : "#ccc",
              color: "#fff", border: "none", padding: "8px 18px", borderRadius: 6,
              fontWeight: 700, fontSize: 13, cursor: hasUnsaved ? "pointer" : "not-allowed",
              fontFamily: "Open Sans, sans-serif", transition: "background .15s"
            }}>
              {currentUser.canDirectPublish ? "⬆ Publish Live" : "⬆ Submit for Approval"}
            </button>
          </div>
        </div>

        <div style={{ background: "#fff", border: "1px solid #e5e5e5", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 28, minHeight: 500 }}>
          {adminTab === "json" ? (
            <div>
              <div style={{ marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 13, color: "#666" }}>Edit the JSON directly. Changes sync to the form editor in real-time.</div>
                {jsonError && <span style={{ fontSize: 12, color: "#990000", background: "#EFD8D5", padding: "4px 10px", borderRadius: 4, fontWeight: 600 }}>JSON Error: {jsonError}</span>}
              </div>
              <textarea value={jsonText} onChange={e => onJsonChange(e.target.value)} style={{
                width: "100%", height: 560, fontFamily: "'Courier New', monospace", fontSize: 12,
                border: `1.5px solid ${jsonError ? "#990000" : "#ddd"}`, borderRadius: 8, padding: 16,
                resize: "vertical", outline: "none", lineHeight: 1.5, color: "#333", background: "#fafafa"
              }} />
            </div>
          ) : (
            <SectionEditor section={activeSection} config={config} onChange={onChange} />
          )}
        </div>
      </div>
    </div>
  );
}

function SectionEditor({ section, config, onChange }) {
  if (section === "hero") return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#333" }}>Hero Section</h3>
      <EditField label="Headline" value={config.hero.headline} onChange={v => onChange(d => { d.hero.headline = v; })} hint="Main banner headline — displayed in large type" />
      <EditField label="Subheadline" value={config.hero.subheadline} onChange={v => onChange(d => { d.hero.subheadline = v; })} multiline hint="Supporting text below the headline" />
      <EditField label="Badge Text" value={config.hero.badge} onChange={v => onChange(d => { d.hero.badge = v; })} hint="Small badge above the headline" />
      <EditField label="CTA Button Label" value={config.hero.ctaLabel} onChange={v => onChange(d => { d.hero.ctaLabel = v; })} hint="Text on the primary call-to-action button" />
      <EditField label="CTA Sub-text" value={config.hero.ctaSubtext} onChange={v => onChange(d => { d.hero.ctaSubtext = v; })} hint="Small text below the CTA button" />
    </div>
  );

  if (section === "signup") return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#333" }}>Sign-Up Form</h3>
      <EditField label="Form Title" value={config.signupForm.title} onChange={v => onChange(d => { d.signupForm.title = v; })} />
      <EditField label="Form Subtitle" value={config.signupForm.subtitle} onChange={v => onChange(d => { d.signupForm.subtitle = v; })} multiline />
      <div style={{ marginTop: 20 }}>
        <label style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 12 }}>Organization Types ({config.signupForm.orgTypes.length} active)</label>
        {config.signupForm.orgTypes.map((ot, i) => (
          <div key={ot.id} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, padding: "10px 12px", background: "#fafafa", borderRadius: 7, border: "1px solid #eee" }}>
            <span style={{ fontSize: 18 }}>{ot.icon}</span>
            <input value={ot.label} onChange={e => onChange(d => { d.signupForm.orgTypes[i].label = e.target.value; })} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "7px 10px", fontSize: 13 }} />
            <span style={{ fontSize: 11, color: "#999", background: "#e8f4fd", padding: "3px 8px", borderRadius: 4 }}>→ {ot.segment}</span>
          </div>
        ))}
      </div>
    </div>
  );

  if (section === "segments") return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#333" }}>Segments</h3>
      {Object.entries(config.segments).map(([key, seg]) => (
        <div key={key} style={{ marginBottom: 16, padding: 16, border: "1.5px solid #e5e5e5", borderRadius: 10, borderLeft: `4px solid ${seg.color}` }}>
          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: seg.color, padding: "4px 10px", borderRadius: 4 }}>{key}</div>
            <input value={seg.name} onChange={e => onChange(d => { d.segments[key].name = e.target.value; })} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "6px 10px", fontSize: 13, fontWeight: 600 }} placeholder="Segment name" />
            <input value={seg.color} onChange={e => onChange(d => { d.segments[key].color = e.target.value; })} style={{ width: 90, border: "1px solid #ddd", borderRadius: 5, padding: "6px 10px", fontSize: 12 }} placeholder="#000000" />
          </div>
          <textarea value={seg.description} onChange={e => onChange(d => { d.segments[key].description = e.target.value; })} rows={2} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 5, padding: "7px 10px", fontSize: 13, resize: "vertical" }} placeholder="Description shown on result screen" />
        </div>
      ))}
    </div>
  );

  if (section === "contracts") return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#333" }}>Cooperative Contracts</h3>
      {config.contracts.map((ct, i) => (
        <div key={ct.id} style={{ marginBottom: 16, padding: 18, border: `1.5px solid ${ct.active ? "#3F9A59" : "#ddd"}`, borderRadius: 10, background: ct.active ? "#fff" : "#fafafa" }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "center" }}>
            <span style={{ background: ct.active ? "#3F9A59" : "#ccc", color: "#fff", fontSize: 10, padding: "3px 8px", borderRadius: 4, fontWeight: 700 }}>{ct.active ? "ACTIVE" : "INACTIVE"}</span>
            <input value={ct.name} onChange={e => onChange(d => { d.contracts[i].name = e.target.value; })} style={{ flex: 1, border: "1px solid #ddd", borderRadius: 5, padding: "7px 10px", fontSize: 13, fontWeight: 600 }} />
            <input value={ct.contractNumber} onChange={e => onChange(d => { d.contracts[i].contractNumber = e.target.value; })} style={{ width: 110, border: "1px solid #ddd", borderRadius: 5, padding: "7px 10px", fontSize: 12 }} placeholder="Contract #" />
            <input value={ct.logoLabel} onChange={e => onChange(d => { d.contracts[i].logoLabel = e.target.value; })} style={{ width: 90, border: "1px solid #ddd", borderRadius: 5, padding: "7px 10px", fontSize: 12 }} placeholder="Logo label" />
            <button onClick={() => onChange(d => { d.contracts[i].active = !d.contracts[i].active; })} style={{ background: ct.active ? "#EFD8D5" : "#F0F8EE", border: "none", padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600, color: ct.active ? "#990000" : "#3F9A59" }}>
              {ct.active ? "Deactivate" : "Activate"}
            </button>
          </div>
          <textarea value={ct.description} onChange={e => onChange(d => { d.contracts[i].description = e.target.value; })} rows={2} style={{ width: "100%", border: "1px solid #ddd", borderRadius: 5, padding: "7px 10px", fontSize: 13, marginBottom: 8, resize: "vertical" }} />
          <div style={{ fontSize: 11, color: "#888" }}>Shown for segments: {ct.segments.join(", ")}</div>
        </div>
      ))}
    </div>
  );

  if (section === "errors") return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 6, color: "#333" }}>Error States</h3>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>Messages shown to customers when verification fails. Each error code gets its own message and next-step CTA.</p>
      {Object.entries(config.errorStates).map(([key, err]) => (
        <div key={key} style={{ marginBottom: 18, padding: 18, border: "1.5px solid #ffc107", borderRadius: 10, background: "#fffdf0" }}>
          <div style={{ background: "#E67300", color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 4, display: "inline-block", marginBottom: 12, letterSpacing: .5 }}>{key.toUpperCase()}</div>
          <EditField label="Customer-facing message" value={err.message} onChange={v => onChange(d => { d.errorStates[key].message = v; })} />
          <EditField label="CTA Button Label" value={err.cta} onChange={v => onChange(d => { d.errorStates[key].cta = v; })} />
        </div>
      ))}
    </div>
  );

  if (section === "footer") return (
    <div>
      <h3 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 17, fontWeight: 700, marginBottom: 20, color: "#333" }}>Footer</h3>
      <EditField label="Contact Email" value={config.footer.contactEmail} onChange={v => onChange(d => { d.footer.contactEmail = v; })} />
      <EditField label="Representative Phone" value={config.footer.repPhone} onChange={v => onChange(d => { d.footer.repPhone = v; })} />
      <EditField label="Footer Tagline" value={config.footer.tagline} onChange={v => onChange(d => { d.footer.tagline = v; })} />
    </div>
  );

  return null;
}

function EditField({ label, value, onChange, multiline, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: "#666", textTransform: "uppercase", letterSpacing: .4, display: "block", marginBottom: 5 }}>{label}</label>
      {hint && <div style={{ fontSize: 11, color: "#aaa", marginBottom: 6 }}>{hint}</div>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} style={{ width: "100%", border: "1.5px solid #ddd", borderRadius: 7, padding: "10px 12px", fontSize: 14, resize: "vertical", fontFamily: "Open Sans, sans-serif", outline: "none" }} onFocus={e => e.target.style.borderColor="#990000"} onBlur={e => e.target.style.borderColor="#ddd"} />
        : <input  value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", border: "1.5px solid #ddd", borderRadius: 7, padding: "10px 12px", fontSize: 14, fontFamily: "Open Sans, sans-serif", outline: "none" }} onFocus={e => e.target.style.borderColor="#990000"} onBlur={e => e.target.style.borderColor="#ddd"} />
      }
    </div>
  );
}

// ─── Approvals View ───────────────────────────────────────────────────────────
function ApprovalsView({ pendingChanges, liveConfig, currentUser, onApprove, onReject }) {
  const pending  = pendingChanges.filter(c => c.status === "pending");
  const resolved = pendingChanges.filter(c => c.status !== "pending");
  const isAriel  = currentUser.canDirectPublish;

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "28px 24px" }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Montserrat, sans-serif", fontSize: 22, fontWeight: 800, marginBottom: 6 }}>
          {isAriel ? "Approval Queue" : "Pending Submissions"}
        </h2>
        {isAriel
          ? <p style={{ fontSize: 14, color: "#666" }}>As Ariel Goldman, you can approve or reject proposed changes. Approved changes go live immediately.</p>
          : <p style={{ fontSize: 14, color: "#666" }}>Changes you submit here go to Ariel Goldman for review before going live. Log in as Ariel Goldman to approve.</p>
        }
      </div>

      {/* Approval model explainer */}
      <div style={{ background: "#E6F2F8", border: "1px solid #007AB8", borderRadius: 10, padding: "14px 18px", marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start" }}>
        <span style={{ fontSize: 22 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#007AB8", marginBottom: 4 }}>One-Layer Approval Model</div>
          <div style={{ fontSize: 13, color: "#444", lineHeight: 1.6 }}>
            <strong>Ariel Goldman</strong> can publish changes directly — no approval required.<br />
            <strong>All other admins</strong> (Josh Bernstein, Jerel Smith, etc.) submit changes that Ariel must approve before going live.<br />
            In <strong>Phase 3 (Full CMS)</strong>, this model expands to role-based access with segment-scoped editing and a tiered approval workflow.
          </div>
        </div>
      </div>

      {/* Pending */}
      {pending.length > 0 ? (
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#E67300", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ background: "#E67300", color: "#fff", borderRadius: "50%", width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>{pending.length}</span>
            Awaiting Approval
          </div>
          {pending.map(c => <ChangeCard key={c.id} change={c} isAriel={isAriel} onApprove={onApprove} onReject={onReject} liveConfig={liveConfig} />)}
        </div>
      ) : (
        <div style={{ background: "#F0F8EE", border: "1px solid #3F9A59", borderRadius: 10, padding: "20px 24px", marginBottom: 24, textAlign: "center", color: "#3F9A59", fontWeight: 600 }}>
          ✓ No pending approvals — hub is fully up to date.
        </div>
      )}

      {/* Resolved */}
      {resolved.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 14 }}>Recently Resolved</div>
          {resolved.map(c => <ChangeCard key={c.id} change={c} isAriel={isAriel} onApprove={onApprove} onReject={onReject} liveConfig={liveConfig} resolved />)}
        </div>
      )}
    </div>
  );
}

function ChangeCard({ change, isAriel, onApprove, onReject, liveConfig, resolved }) {
  const [expanded, setExpanded] = useState(false);
  const statusColor = { pending: "#E67300", approved: "#3F9A59", rejected: "#990000" }[change.status];
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${resolved ? "#e5e5e5" : "#ffc107"}`, borderRadius: 10, marginBottom: 14, overflow: "hidden" }}>
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 36, height: 36, background: "#f0f0f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, color: "#666" }}>
          {change.submittedBy.split(" ").map(n => n[0]).join("")}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
            Submitted by <span style={{ color: "#007AB8" }}>{change.submittedBy}</span>
          </div>
          <div style={{ fontSize: 12, color: "#888" }}>{fmtTs(change.submittedAt)} · {change.diff.length} field{change.diff.length !== 1 ? "s" : ""} changed</div>
        </div>
        <span style={{ background: statusColor, color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 4, letterSpacing: .5, textTransform: "uppercase" }}>{change.status}</span>
        <button onClick={() => setExpanded(e => !e)} style={{ background: "#f5f5f5", border: "none", padding: "6px 12px", borderRadius: 5, cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#666" }}>
          {expanded ? "Hide diff ↑" : "Show diff ↓"}
        </button>
        {isAriel && change.status === "pending" && (
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => onApprove(change.id)} style={{ background: "#3F9A59", color: "#fff", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✓ Approve</button>
            <button onClick={() => onReject(change.id)}  style={{ background: "#EFD8D5", color: "#990000", border: "none", padding: "8px 16px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>✗ Reject</button>
          </div>
        )}
      </div>
      {expanded && (
        <div style={{ borderTop: "1px solid #f0f0f0", padding: "14px 20px", background: "#fafafa" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#999", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 }}>Changed Fields</div>
          {change.diff.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 10, marginBottom: 8, fontSize: 12 }}>
              <span style={{ color: "#666", fontWeight: 600 }}>{d.path}</span>
              <span style={{ background: "#fee", padding: "4px 8px", borderRadius: 4, color: "#c00" }}>− {truncate(d.before)}</span>
              <span style={{ background: "#efe", padding: "4px 8px", borderRadius: 4, color: "#060" }}>+ {truncate(d.after)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function computeDiff(a, b, path = "", diffs = []) {
  if (typeof a !== typeof b) { diffs.push({ path, before: String(a), after: String(b) }); return diffs; }
  if (typeof a !== "object" || a === null) { if (a !== b) diffs.push({ path, before: String(a), after: String(b) }); return diffs; }
  if (Array.isArray(a)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) computeDiff(a[i], b[i], `${path}[${i}]`, diffs);
    return diffs;
  }
  for (const k of new Set([...Object.keys(a || {}), ...Object.keys(b || {})])) {
    if (k === "meta") continue;
    computeDiff(a?.[k], b?.[k], path ? `${path}.${k}` : k, diffs);
  }
  return diffs;
}

function bumpVersion(v) {
  const parts = (v || "1.0.0").split(".").map(Number);
  parts[2]++;
  return parts.join(".");
}

function truncate(s, n = 60) { return s && s.length > n ? s.slice(0, n) + "…" : s; }
