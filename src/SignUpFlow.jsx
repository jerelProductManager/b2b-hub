// SignUpFlow.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Drop-in sign-up modal for the B&H B2B Hub (App.jsx).
//
// USAGE IN App.jsx:
//   1. Import at the top:
//        import SignUpFlow from "./SignUpFlow";
//
//   2. Add state near the other useState hooks:
//        const [showSignUp, setShowSignUp] = useState(false);
//
//   3. Replace every onSignUp / handleSignUp call with:
//        () => setShowSignUp(true)
//
//   4. Render at the bottom of the App return, after all other modals:
//        {showSignUp && <SignUpFlow onClose={() => setShowSignUp(false)} />}
//
// The modal renders on top of everything (z-index 2000) and closes itself
// when the user hits ✕ or "Got It" on the confirmation screen.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useRef, useEffect } from "react";

// ─── Design Tokens (matches App.jsx T object) ─────────────────────────────────
const T = {
  green:      "#3F9A59",
  greenLight: "#F0F8EE",
  scarlet:    "#990000",
  bond:       "#007AB8",
  gray1:      "#F2F2F2",
  gray2:      "#E5E5E5",
  gray3:      "#CCCCCC",
  gray4:      "#999999",
  gray5:      "#666666",
  gray6:      "#333333",
  white:      "#FFFFFF",
  black:      "#000000",
};

// ─── Contract Logo SVGs ───────────────────────────────────────────────────────
const LOGOS = {
  equalis: (
    <svg width="48" height="22" viewBox="0 0 120 44" fill="none">
      <circle cx="10" cy="22" r="10" fill="#0066CC"/>
      <circle cx="10" cy="22" r="6"  fill="white"/>
      <circle cx="10" cy="22" r="3"  fill="#0066CC"/>
      <text x="26" y="27" fontFamily="Arial" fontWeight="800" fontSize="16" fill="#0066CC">equalis</text>
      <text x="26" y="38" fontFamily="Arial" fontWeight="400" fontSize="8"  fill="#0066CC">GROUP</text>
    </svg>
  ),
  ei: (
    <svg width="48" height="22" viewBox="0 0 80 36" fill="none">
      <rect width="80" height="36" rx="4" fill="#003087"/>
      <text x="6"  y="26" fontFamily="Arial" fontWeight="900" fontSize="20" fill="white">E&amp;I</text>
      <text x="48" y="18" fontFamily="Arial" fontWeight="700" fontSize="6"  fill="#FFD700">COOPERATIVE</text>
      <text x="48" y="26" fontFamily="Arial" fontWeight="700" fontSize="6"  fill="#FFD700">SERVICES</text>
    </svg>
  ),
  omnia: (
    <svg width="56" height="22" viewBox="0 0 100 36" fill="none">
      <text x="0" y="26" fontFamily="Arial" fontWeight="900" fontSize="22" fill="#1a1a1a" letterSpacing="-1">OMNIA</text>
      <text x="2" y="35" fontFamily="Arial" fontWeight="400" fontSize="7"  fill="#666">PARTNERS</text>
    </svg>
  ),
  tips: (
    <svg width="40" height="22" viewBox="0 0 70 40" fill="none">
      <rect width="70" height="28" rx="4" fill="#CC0000"/>
      <text x="8" y="20" fontFamily="Arial" fontWeight="900" fontSize="16" fill="white">TIPS</text>
      <ellipse cx="35" cy="36" rx="28" ry="6" fill="#0066CC" opacity="0.7"/>
    </svg>
  ),
  buyboard: (
    <svg width="56" height="22" viewBox="0 0 110 36" fill="none">
      <rect width="110" height="36" rx="4" fill="#003087"/>
      <text x="6"  y="24" fontFamily="Arial" fontWeight="900" fontSize="14" fill="#FFD700">Buy</text>
      <text x="38" y="24" fontFamily="Arial" fontWeight="900" fontSize="14" fill="white">Board</text>
    </svg>
  ),
  peppm: (
    <svg width="52" height="22" viewBox="0 0 90 36" fill="none">
      <text x="0" y="24" fontFamily="Arial" fontWeight="900" fontSize="20" fill="#CC0000">PEPPM</text>
      <text x="0" y="34" fontFamily="Arial" fontWeight="400" fontSize="6"  fill="#666">COOPERATIVE PURCHASING</text>
    </svg>
  ),
};

// ─── Static Data ──────────────────────────────────────────────────────────────
const ALL_CONTRACTS = [
  { id: "equalis",  name: "Equalis Group", number: "EQ-0421"  },
  { id: "ei",       name: "E&I",           number: "CNR01261" },
  { id: "omnia",    name: "OMNIA",         number: "R191902"  },
  { id: "tips",     name: "TIPS",          number: "210102"   },
  { id: "buyboard", name: "Buy Board",     number: "589-19"   },
  { id: "peppm",    name: "PEPPM",         number: "PP-2021"  },
];

const STATES_ABBR = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const STATES_FULL = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"];

const ORG_TYPES = [
  { value: "Higher Education",         label: "Higher Education" },
  { value: "K-12",                     label: "K-12" },
  { value: "State & Local Government", label: "State & Local Government" },
  { value: "Small Business",           label: "Small Business" },
  { value: "Corporate",                label: "Corporate" },
  { value: "Non-Profit",               label: "Non-Profit" },
  { value: "DS, FT, CPP, SI or HC",    label: "DS, FT, CPP, SI or HC" },
];

const ORG_RULES = {
  "Higher Education":         { needsState: true,  needsContracts: true,  needsEmployees: false, needsTaxId: false },
  "K-12":                     { needsState: true,  needsContracts: true,  needsEmployees: false, needsTaxId: false },
  "State & Local Government": { needsState: true,  needsContracts: true,  needsEmployees: false, needsTaxId: false },
  "Small Business":           { needsState: false, needsContracts: false, needsEmployees: true,  needsTaxId: false },
  "Corporate":                { needsState: false, needsContracts: false, needsEmployees: true,  needsTaxId: false },
  "Non-Profit":               { needsState: false, needsContracts: false, needsEmployees: false, needsTaxId: true  },
  "DS, FT, CPP, SI or HC":    { needsState: false, needsContracts: false, needsEmployees: false, needsTaxId: false },
};

const ROLES            = ["IT / Technology","Procurement / Purchasing","Administration","Finance","Operations","Faculty / Academic","Production / Creative","Executive / Leadership","Other"];
const EMPLOYEE_RANGES  = ["1–10","11–50","51–200","201–500","501–1,000","1,001–5,000","5,000+"];
const PURCHASE_VOLUMES = ["Under $10,000","$10,000 – $50,000","$50,000 – $250,000","$250,000 – $1M","Over $1M"];
const PURCHASING_NEEDS = [
  "Equipment for a specific project",
  "Ongoing/recurring hardware purchases",
  "Cooperative contract compliance",
  "Setting up an eProcurement integration",
  "Net terms/Credit account",
  "Just exploring options",
];

// ─── Shared Primitives ────────────────────────────────────────────────────────
function FloatInput({ label, value, onChange, type = "text", error, rightEl, hint }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || Boolean(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ position: "relative", border: `1px solid ${error ? T.scarlet : focused ? T.green : T.gray3}`, borderRadius: 4, background: T.white, transition: "border-color .15s" }}>
        <label style={{ position: "absolute", left: 12, top: lifted ? 6 : "50%", transform: lifted ? "none" : "translateY(-50%)", fontSize: lifted ? 10 : 14, color: error ? T.scarlet : focused ? T.green : T.gray4, transition: "all .15s", pointerEvents: "none", lineHeight: 1, zIndex: 1 }}>{label}</label>
        <input
          type={type} value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: lifted ? "20px 12px 6px" : "14px 12px", paddingRight: rightEl ? 56 : 12, fontSize: 14, color: T.gray6, fontFamily: "'Open Sans', sans-serif", boxSizing: "border-box" }}
        />
        {rightEl && <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }}>{rightEl}</div>}
      </div>
      {error && <div style={{ fontSize: 11, color: T.scarlet, marginTop: 3, paddingLeft: 2 }}>{error}</div>}
      {hint && !error && <div style={{ fontSize: 11, color: T.gray4, marginTop: 3, paddingLeft: 2 }}>{hint}</div>}
    </div>
  );
}

function FloatSelect({ label, value, onChange, options, error }) {
  const [focused, setFocused] = useState(false);
  const lifted = Boolean(value);
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ position: "relative", border: `1px solid ${error ? T.scarlet : focused ? T.green : T.gray3}`, borderRadius: 4, background: T.white, transition: "border-color .15s" }}>
        <label style={{ position: "absolute", left: 12, top: lifted ? 6 : "50%", transform: lifted ? "none" : "translateY(-50%)", fontSize: lifted ? 10 : 14, color: error ? T.scarlet : lifted ? T.green : T.gray4, transition: "all .15s", pointerEvents: "none", lineHeight: 1, zIndex: 1 }}>{label}</label>
        <select value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: lifted ? "20px 36px 6px 12px" : "14px 36px 14px 12px", fontSize: 14, color: lifted ? T.gray6 : "transparent", fontFamily: "'Open Sans', sans-serif", appearance: "none", WebkitAppearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
          <option value=""></option>
          {options.map(o => { const v = typeof o === "string" ? o : o.value; const l = typeof o === "string" ? o : o.label; return <option key={v} value={v} style={{ color: T.gray6 }}>{l}</option>; })}
        </select>
        <div style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: T.gray4, fontSize: 14 }}>▾</div>
      </div>
      {error && <div style={{ fontSize: 11, color: T.scarlet, marginTop: 3, paddingLeft: 2 }}>{error}</div>}
    </div>
  );
}

function PlainInput({ placeholder, value, onChange, type = "text", error }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ border: `1px solid ${error ? T.scarlet : focused ? T.green : T.gray3}`, borderRadius: 4, background: T.white }}>
        <input value={value} onChange={e => onChange(e.target.value)} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} placeholder={placeholder} type={type}
          style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: "13px 12px", fontSize: 14, color: T.gray6, fontFamily: "'Open Sans', sans-serif", boxSizing: "border-box" }} />
      </div>
      {error && <div style={{ fontSize: 11, color: T.scarlet, marginTop: 3, paddingLeft: 2 }}>{error}</div>}
    </div>
  );
}

function PlainSelect({ placeholder, value, onChange, options }) {
  return (
    <div style={{ position: "relative" }}>
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ width: "100%", border: `1px solid ${T.gray3}`, borderRadius: 4, background: T.white, padding: "13px 32px 13px 12px", fontSize: 14, color: value ? T.gray6 : T.gray4, fontFamily: "'Open Sans', sans-serif", appearance: "none", WebkitAppearance: "none", cursor: "pointer", boxSizing: "border-box" }}>
        <option value="" style={{ color: T.gray4 }}>{placeholder}</option>
        {options.map(o => <option key={o} value={o} style={{ color: T.gray6 }}>{o}</option>)}
      </select>
      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: T.gray4, fontSize: 13 }}>▾</div>
    </div>
  );
}

function GreenCheck({ checked, onChange, label }) {
  return (
    <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", fontSize: 13, color: T.gray6, lineHeight: 1.5 }}>
      <div onClick={() => onChange(!checked)} style={{ width: 20, height: 20, borderRadius: 3, flexShrink: 0, marginTop: 1, background: checked ? T.green : T.white, border: `2px solid ${checked ? T.green : T.gray3}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .15s" }}>
        {checked && <span style={{ color: T.white, fontSize: 12, fontWeight: 700 }}>✓</span>}
      </div>
      <span>{label}</span>
    </label>
  );
}

function GreenBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ width: "100%", background: T.green, color: T.white, border: "none", borderRadius: 4, padding: "15px", fontSize: 15, fontWeight: 700, fontFamily: "'Open Sans', sans-serif", cursor: "pointer", marginTop: 8, transition: "background .15s" }}>
      {label}
    </button>
  );
}

// ─── Contract Picker ──────────────────────────────────────────────────────────
function ContractPicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = ALL_CONTRACTS.find(c => c.id === value);

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ marginBottom: 10, position: "relative" }}>
      <div onClick={() => setOpen(v => !v)} style={{ border: `1px solid ${error ? T.scarlet : open ? T.green : T.gray3}`, borderRadius: open ? "4px 4px 0 0" : 4, background: T.white, cursor: "pointer", position: "relative" }}>
        <label style={{ position: "absolute", left: 12, top: selected ? 6 : "50%", transform: selected ? "none" : "translateY(-50%)", fontSize: selected ? 10 : 14, color: error ? T.scarlet : selected ? T.green : T.gray4, transition: "all .15s", pointerEvents: "none", lineHeight: 1 }}>Available Contracts</label>
        <div style={{ padding: selected ? "20px 36px 6px 12px" : "14px 36px 14px 12px", minHeight: 52, display: "flex", alignItems: "center", gap: 10 }}>
          {selected && <><div style={{ flexShrink: 0 }}>{LOGOS[selected.id]}</div><span style={{ fontSize: 14, fontWeight: 600, color: T.gray6 }}>{selected.name}</span></>}
        </div>
        <div style={{ position: "absolute", right: 12, top: "50%", transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`, color: T.gray4, fontSize: 14, transition: "transform .2s", pointerEvents: "none" }}>▾</div>
      </div>
      {open && (
        <div style={{ position: "absolute", left: 0, right: 0, zIndex: 300, background: T.white, border: `1px solid ${T.green}`, borderTop: "none", borderRadius: "0 0 4px 4px", boxShadow: "0 4px 16px rgba(0,0,0,.12)", maxHeight: 320, overflowY: "auto", animation: "su-fadeIn .15s ease" }}>
          {ALL_CONTRACTS.map((ct, i) => (
            <div key={ct.id} onClick={() => { onChange(ct.id); setOpen(false); }}
              style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", background: value === ct.id ? T.greenLight : i === 0 ? T.gray1 : T.white, borderBottom: i < ALL_CONTRACTS.length - 1 ? `1px solid ${T.gray2}` : "none", cursor: "pointer" }}
              onMouseEnter={e => { if (value !== ct.id) e.currentTarget.style.background = T.gray1; }}
              onMouseLeave={e => { if (value !== ct.id) e.currentTarget.style.background = i === 0 ? T.gray1 : T.white; }}>
              <div style={{ width: 64, flexShrink: 0, display: "flex", alignItems: "center" }}>{LOGOS[ct.id]}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.gray6 }}>{ct.name}</div>
                <div style={{ fontSize: 11, color: T.gray4 }}>#{ct.number}</div>
              </div>
              {value === ct.id && <div style={{ marginLeft: "auto", color: T.green, fontWeight: 700 }}>✓</div>}
            </div>
          ))}
        </div>
      )}
      {error && <div style={{ fontSize: 11, color: T.scarlet, marginTop: 3, paddingLeft: 2 }}>{error}</div>}
    </div>
  );
}

// ─── Step Nav ─────────────────────────────────────────────────────────────────
function StepNav({ step }) {
  return (
    <div style={{ display: "flex", borderBottom: `1px solid ${T.gray2}`, marginBottom: 22 }}>
      {[{ n: 1, label: "Create Account" }, { n: 2, label: "Org Info" }, { n: 3, label: "Billing" }].map(s => {
        const done = step > s.n, active = step === s.n;
        return (
          <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6, paddingBottom: 12, marginRight: 20, borderBottom: active ? `2px solid ${T.green}` : "2px solid transparent" }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${done || active ? T.green : T.gray3}`, background: done ? T.green : T.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {done ? <span style={{ color: T.white, fontSize: 11, fontWeight: 700 }}>✓</span> : <span style={{ fontSize: 11, fontWeight: 700, color: active ? T.green : T.gray4 }}>{s.n}</span>}
            </div>
            <span style={{ fontSize: 13, fontWeight: active ? 700 : 500, color: active ? T.green : done ? T.gray5 : T.gray4 }}>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Bottom-Sheet Modal ───────────────────────────────────────────────────────
function Sheet({ title, onBack, onClose, step, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 2000 }}>
      <div style={{ background: T.white, borderRadius: "12px 12px 0 0", width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", animation: "su-slideUp .25s ease", boxShadow: "0 -4px 40px rgba(0,0,0,.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 0" }}>
          {onBack && <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.gray6, padding: 0 }}>←</button>}
          <h2 style={{ flex: 1, margin: 0, fontSize: 18, fontWeight: 700, color: T.gray6, fontFamily: "'Open Sans', sans-serif" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.gray6, padding: 0 }}>✕</button>
        </div>
        <div style={{ padding: "14px 20px 0" }}><StepNav step={step} /></div>
        <div style={{ padding: "0 20px 36px" }}>{children}</div>
      </div>
    </div>
  );
}

// ─── Screen: Entry ────────────────────────────────────────────────────────────
function EntryScreen({ onClose, onNew, onConvert }) {
  return (
    <Sheet title="Sign Up for a Free B&H B2B Account" onClose={onClose} step={1}>
      <div style={{ border: `1.5px dashed ${T.gray3}`, borderRadius: 6, padding: "20px 16px" }}>
        <GreenBtn label="Create a New B&H B2B Account" onClick={onNew} />
        <p style={{ textAlign: "center", fontSize: 13, color: T.gray5, lineHeight: 1.55, margin: "10px 0 18px" }}>
          Use an email address issued by private email client—webmail addresses (gmail, yahoo, etc.) do not qualify.
        </p>
        <div style={{ height: 1, background: T.gray2, margin: "4px 0 18px" }} />
        <GreenBtn label="Convert an Existing B&H Account" onClick={onConvert} />
        <p style={{ textAlign: "center", fontSize: 13, color: T.gray5, lineHeight: 1.55, margin: "10px 0 0" }}>
          Your consumer account and accompanying details (shipping/billing address, etc.) will be converted to a new B&H B2B for Non-Profit Account.
        </p>
      </div>
    </Sheet>
  );
}

// ─── Screen: Create New ───────────────────────────────────────────────────────
function CreateNewScreen({ onBack, onClose, onNext }) {
  const [email, setEmail]               = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [firstName, setFirstName]       = useState("");
  const [lastName, setLastName]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPw, setShowPw]             = useState(false);
  const [newsletter, setNewsletter]     = useState(true);
  const [errors, setErrors]             = useState({});

  const go = () => {
    const e = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email address";
    if (confirmEmail !== email) e.confirmEmail = "Emails do not match";
    if (!firstName) e.firstName = "Required";
    if (!lastName)  e.lastName  = "Required";
    if (!password || password.length < 8) e.password = "Minimum 8 characters";
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ email, firstName, lastName, newsletter });
  };

  return (
    <Sheet title="Create a New B&H B2B Account" onBack={onBack} onClose={onClose} step={1}>
      <FloatInput label="Email"         value={email}        onChange={setEmail}        type="email" error={errors.email} />
      <FloatInput label="Confirm Email" value={confirmEmail} onChange={setConfirmEmail} type="email" error={errors.confirmEmail} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <FloatInput label="First Name" value={firstName} onChange={setFirstName} error={errors.firstName} />
        <FloatInput label="Last Name"  value={lastName}  onChange={setLastName}  error={errors.lastName} />
      </div>
      <FloatInput label="Password" value={password} onChange={setPassword} type={showPw ? "text" : "password"} error={errors.password}
        rightEl={<button onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.gray5, fontFamily: "'Open Sans', sans-serif", padding: 0 }}>{showPw ? "Hide" : "Show"}</button>} />
      <div style={{ margin: "14px 0 4px" }}>
        <GreenCheck checked={newsletter} onChange={setNewsletter} label="Please sign me up for B&H B2B newsletters and send occasional updates to my inbox." />
      </div>
      <GreenBtn label="Proceed to Next Step" onClick={go} />
    </Sheet>
  );
}

// ─── Screen: Convert ─────────────────────────────────────────────────────────
function ConvertScreen({ onBack, onClose, onNext }) {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [errors, setErrors]         = useState({});

  const go = () => {
    const e = {};
    if (!email)    e.email    = "Email is required";
    if (!password) e.password = "Password is required";
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ email, newsletter });
  };

  return (
    <Sheet title="Convert an Existing B&H Account" onBack={onBack} onClose={onClose} step={1}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: T.gray6, fontFamily: "'Open Sans', sans-serif", margin: "0 0 8px" }}>Log In to an Existing B&H Consumer Account</h3>
      <p style={{ fontSize: 13, color: T.gray5, lineHeight: 1.6, margin: "0 0 20px" }}>Your consumer account and accompanying details (shipping/billing address, etc.) will be converted to a new B&H B2B for Non-Profit Account.</p>
      <FloatInput label="Email"    value={email}    onChange={setEmail}    type="email" error={errors.email} />
      <FloatInput label="Password" value={password} onChange={setPassword} type={showPw ? "text" : "password"} error={errors.password}
        rightEl={<button onClick={() => setShowPw(v => !v)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: T.gray5, fontFamily: "'Open Sans', sans-serif", padding: 0 }}>{showPw ? "Hide" : "Show"}</button>} />
      <div style={{ margin: "14px 0 4px" }}>
        <GreenCheck checked={newsletter} onChange={setNewsletter} label="Please sign me up for B&H B2B newsletters and send occasional updates to my inbox." />
      </div>
      <GreenBtn label="Log In & Proceed to Next Step" onClick={go} />
      <div style={{ textAlign: "center", marginTop: 16 }}>
        <button style={{ background: "none", border: "none", cursor: "pointer", color: T.bond, fontSize: 14, fontWeight: 600, fontFamily: "'Open Sans', sans-serif" }}>Forgot Password</button>
      </div>
    </Sheet>
  );
}

// ─── Screen: Org Info ─────────────────────────────────────────────────────────
function OrgInfoScreen({ onBack, onClose, onNext }) {
  const [orgType,   setOrgType]   = useState("");
  const [state,     setState]     = useState("");
  const [contract,  setContract]  = useState("");
  const [orgName,   setOrgName]   = useState("");
  const [employees, setEmployees] = useState("");
  const [taxId,     setTaxId]     = useState("");
  const [dept,      setDept]      = useState("");
  const [role,      setRole]      = useState("");
  const [roleDesc,  setRoleDesc]  = useState("");
  const [volume,    setVolume]    = useState("");
  const [needs,     setNeeds]     = useState([]);
  const [errors,    setErrors]    = useState({});

  const rules = ORG_RULES[orgType] || {};

  const changeOrgType = v => { setOrgType(v); setState(""); setContract(""); setEmployees(""); setTaxId(""); setErrors({}); };
  const changeState   = v => { setState(v); setContract(""); };
  const toggleNeed    = n => setNeeds(prev => prev.includes(n) ? prev.filter(x => x !== n) : [...prev, n]);

  const go = () => {
    const e = {};
    if (!orgType) e.orgType = "Please select an organization type";
    if (rules.needsState     && !state)              e.state     = "Please select a state";
    if (rules.needsContracts && state && !contract)  e.contract  = "Please select a contract";
    if (!orgName)                                     e.orgName   = "Organization name is required";
    if (rules.needsEmployees && !employees)           e.employees = "Please select a range";
    if (rules.needsTaxId     && !taxId)               e.taxId     = "Federal Tax ID is required";
    if (!role)   e.role   = "Please select your role";
    if (!volume) e.volume = "Please select a volume range";
    if (Object.keys(e).length) { setErrors(e); return; }
    const ct = ALL_CONTRACTS.find(c => c.id === contract);
    onNext({ orgType, state, contract, contractName: ct?.name || "", contractNumber: ct?.number || "", orgName, employees, taxId, dept, role, roleDesc, volume, needs });
  };

  return (
    <Sheet title="Create a New B&H B2B Account" onBack={onBack} onClose={onClose} step={2}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: T.gray6, fontFamily: "'Open Sans', sans-serif", margin: "0 0 18px" }}>Organization Information</h3>

      <FloatSelect label="Organization Type" value={orgType} onChange={changeOrgType} options={ORG_TYPES} error={errors.orgType} />
      {rules.needsState && <FloatSelect label="State" value={state} onChange={changeState} options={STATES_FULL} error={errors.state} />}
      {rules.needsContracts && state && <div style={{ animation: "su-fadeIn .2s ease" }}><ContractPicker value={contract} onChange={setContract} error={errors.contract} /></div>}

      <FloatInput label="Organization Name" value={orgName} onChange={setOrgName} error={errors.orgName} />
      {rules.needsEmployees && <FloatSelect label="Number of Employees" value={employees} onChange={setEmployees} options={EMPLOYEE_RANGES} error={errors.employees} />}
      {rules.needsTaxId && <FloatInput label="Federal Tax ID (TIN)" value={taxId} onChange={setTaxId} error={errors.taxId} hint="Enter your 9-digit EIN (XX-XXXXXXX)" />}

      <FloatInput label="Department" value={dept} onChange={setDept} />
      <FloatSelect label="Your Role" value={role} onChange={v => { setRole(v); if (v !== "Other") setRoleDesc(""); }} options={ROLES} error={errors.role} />
      {role === "Other" && <FloatInput label="Role Description" value={roleDesc} onChange={setRoleDesc} />}

      <FloatSelect label="Estimated Annual Purchase Volume" value={volume} onChange={setVolume} options={PURCHASE_VOLUMES} error={errors.volume} />

      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <h4 style={{ fontSize: 16, fontWeight: 700, color: T.gray6, fontFamily: "'Open Sans', sans-serif", margin: "0 0 14px" }}>Purchasing Needs</h4>
        <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
          {PURCHASING_NEEDS.map(need => <GreenCheck key={need} checked={needs.includes(need)} onChange={() => toggleNeed(need)} label={need} />)}
        </div>
      </div>

      <GreenBtn label="Proceed to Next Step" onClick={go} />
    </Sheet>
  );
}

// ─── Screen: Billing ─────────────────────────────────────────────────────────
function BillingScreen({ onBack, onClose, onNext, showNetTerms }) {
  const [addr1,  setAddr1]  = useState("");
  const [addr2,  setAddr2]  = useState("");
  const [zip,    setZip]    = useState("");
  const [city,   setCity]   = useState("");
  const [state,  setState]  = useState("");
  const [phone,  setPhone]  = useState("");
  const [ext,    setExt]    = useState("");
  const [xfer,   setXfer]   = useState(true);
  const [errors, setErrors] = useState({});

  const go = () => {
    const e = {};
    if (!addr1) e.addr1 = "Required"; if (!zip) e.zip = "Required";
    if (!city)  e.city  = "Required"; if (!state) e.state = "Required";
    if (!phone) e.phone = "Required";
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ addr1, addr2, zip, city, state, phone, ext, xfer });
  };

  const Row = ({ children, gap = 10 }) => <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap, marginBottom: 10 }}>{children}</div>;
  const plain = (ph, val, set, err) => (
    <div>
      <div style={{ border: `1px solid ${err ? T.scarlet : T.gray3}`, borderRadius: 4, background: T.white }}>
        <input value={val} onChange={e => set(e.target.value)} placeholder={ph}
          style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: "13px 12px", fontSize: 14, color: T.gray6, fontFamily: "'Open Sans', sans-serif", boxSizing: "border-box" }} />
      </div>
      {err && <div style={{ fontSize: 11, color: T.scarlet, marginTop: 3, paddingLeft: 2 }}>{err}</div>}
    </div>
  );

  return (
    <Sheet title="Create a New B&H B2B Account" onBack={onBack} onClose={onClose} step={3}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: T.gray6, fontFamily: "'Open Sans', sans-serif", margin: "0 0 18px" }}>Billing Address</h3>

      {/* Street Address */}
      <div style={{ marginBottom: 0 }}>
        <div style={{ border: `1px solid ${errors.addr1 ? T.scarlet : T.gray3}`, borderRadius: 4, background: T.white }}>
          <input value={addr1} onChange={e => setAddr1(e.target.value)} placeholder="Billing Address"
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: "13px 12px", fontSize: 14, color: T.gray6, fontFamily: "'Open Sans', sans-serif", boxSizing: "border-box" }} />
        </div>
        <div style={{ fontSize: 11, color: errors.addr1 ? T.scarlet : T.gray4, marginTop: 3, paddingLeft: 2, marginBottom: 10 }}>{errors.addr1 || "Street Address"}</div>
      </div>

      {/* Address 2 */}
      <div style={{ marginBottom: 0 }}>
        <div style={{ border: `1px solid ${T.gray3}`, borderRadius: 4, background: T.white }}>
          <input value={addr2} onChange={e => setAddr2(e.target.value)} placeholder="Address 2"
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: "13px 12px", fontSize: 14, color: T.gray6, fontFamily: "'Open Sans', sans-serif", boxSizing: "border-box" }} />
        </div>
        <div style={{ fontSize: 11, color: T.gray4, marginTop: 3, paddingLeft: 2, marginBottom: 10 }}>Apartment, Suite, Unit, Floor (Optional)</div>
      </div>

      {/* Zip */}
      <div style={{ marginBottom: 10 }}>{plain("Zip Code", zip, setZip, errors.zip)}</div>

      {/* City + State */}
      <Row>
        {plain("City", city, setCity, errors.city)}
        <div>
          <PlainSelect placeholder="State" value={state} onChange={setState} options={STATES_ABBR} />
          {errors.state && <div style={{ fontSize: 11, color: T.scarlet, marginTop: 3, paddingLeft: 2 }}>{errors.state}</div>}
        </div>
      </Row>

      {/* Phone + Ext */}
      <Row>
        {plain("Phone", phone, setPhone, errors.phone)}
        <div style={{ border: `1px solid ${T.gray3}`, borderRadius: 4, background: T.white }}>
          <input value={ext} onChange={e => setExt(e.target.value)} placeholder="Ext"
            style={{ width: "100%", border: "none", outline: "none", background: "transparent", padding: "13px 12px", fontSize: 14, color: T.gray6, fontFamily: "'Open Sans', sans-serif", boxSizing: "border-box" }} />
        </div>
      </Row>

      {/* Net Terms checkbox — Convert flow only */}
      {showNetTerms && (
        <div style={{ marginBottom: 4 }}>
          <GreenCheck checked={xfer} onChange={setXfer} label="Please transfer my Tax Exemptions and Net Terms to my B&H B2B Account." />
        </div>
      )}

      <GreenBtn label="Complete Registration" onClick={go} />
    </Sheet>
  );
}

// ─── Popup: Keep an Eye on Your Inbox ────────────────────────────────────────
function InboxPopup({ onClose, userData, orgData }) {
  const name = userData?.firstName || (userData?.email || "").split("@")[0] || "there";
  const dest = orgData?.contractName
    ? `${orgData.contractName} pricing`
    : orgData?.orgType
      ? `B&H B2B for ${orgData.orgType}`
      : "B&H B2B";

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2100, padding: "0 20px" }}>
      <div style={{ background: T.white, borderRadius: 8, padding: "32px 24px", maxWidth: 420, width: "100%", position: "relative", animation: "su-fadeIn .2s ease", boxShadow: "0 8px 40px rgba(0,0,0,.3)" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 16, right: 16, background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.gray5, lineHeight: 1, padding: 0 }}>✕</button>

        <h2 style={{ fontFamily: "'Open Sans', sans-serif", fontSize: 22, fontWeight: 700, color: T.black, margin: "0 0 18px", paddingRight: 28 }}>
          Keep an Eye on Your Inbox
        </h2>
        <p style={{ fontSize: 15, color: T.gray6, lineHeight: 1.65, margin: "0 0 16px" }}>
          Thank you, <strong>{name}</strong>. We've sent a verification email to the address provided.
        </p>
        <p style={{ fontSize: 15, color: T.gray6, lineHeight: 1.65, margin: 0 }}>
          Once verified, you'll be shopping at B&H B2B for <strong>{dest}</strong> whenever you log in at bhphoto.com.
        </p>

        <button onClick={onClose} style={{ display: "block", width: "100%", marginTop: 28, background: T.green, color: T.white, border: "none", borderRadius: 4, padding: "14px", fontSize: 15, fontWeight: 700, fontFamily: "'Open Sans', sans-serif", cursor: "pointer" }}>
          Got It
        </button>
      </div>
    </div>
  );
}

// ─── SignUpFlow — the exported root component ─────────────────────────────────
// Props:
//   onClose: () => void   — called when user exits at any point
export default function SignUpFlow({ onClose }) {
  const [screen,      setScreen]      = useState("entry");
  const [fromConvert, setFromConvert] = useState(false);
  const [userData,    setUserData]    = useState({});
  const [orgData,     setOrgData]     = useState({});

  return (
    <>
      {/* Scoped keyframe animations — won't collide with App.jsx's own styles */}
      <style>{`
        @keyframes su-slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes su-fadeIn  { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {screen === "entry" && (
        <EntryScreen
          onClose={onClose}
          onNew={() => { setFromConvert(false); setScreen("new"); }}
          onConvert={() => { setFromConvert(true); setScreen("convert"); }}
        />
      )}
      {screen === "new" && (
        <CreateNewScreen
          onBack={() => setScreen("entry")}
          onClose={onClose}
          onNext={data => { setUserData(data); setScreen("org"); }}
        />
      )}
      {screen === "convert" && (
        <ConvertScreen
          onBack={() => setScreen("entry")}
          onClose={onClose}
          onNext={data => { setUserData(data); setScreen("org"); }}
        />
      )}
      {screen === "org" && (
        <OrgInfoScreen
          onBack={() => setScreen(fromConvert ? "convert" : "new")}
          onClose={onClose}
          onNext={data => { setOrgData(data); setScreen("billing"); }}
        />
      )}
      {screen === "billing" && (
        <BillingScreen
          onBack={() => setScreen("org")}
          onClose={onClose}
          showNetTerms={fromConvert}
          onNext={() => setScreen("inbox")}
        />
      )}
      {screen === "inbox" && (
        <InboxPopup
          onClose={onClose}
          userData={userData}
          orgData={orgData}
        />
      )}
    </>
  );
}
