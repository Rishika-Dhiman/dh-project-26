import { useState } from "react";
import { Stethoscope, FlaskConical, LogOut, Plus, X, CheckCircle2, Circle, Loader2, Search, ShieldCheck, Activity } from "lucide-react";

const TODAY = "06 Oct 2026";
const USERS = [
  { role: "Doctor", id: "DOC001", pw: "doctor123", name: "Dr. Mehta" },
  { role: "Doctor", id: "DOC002", pw: "doctor123", name: "Dr. Sharma" },
  { role: "Nurse", id: "NUR001", pw: "nurse123", name: "Nurse Anjali" },
  { role: "Nurse", id: "NUR002", pw: "nurse123", name: "Nurse Priya" },
  { role: "Nurse", id: "NUR003", pw: "nurse123", name: "Nurse Kavya" },
  { role: "OPD Technician", id: "OPD001", pw: "opd123", name: "OPD Technician" },
  { role: "Lab Technician", id: "LAB001", pw: "lab123", name: "Lab Technician" },
];
const DOCS = ["Dr. Mehta", "Dr. Sharma"];
const NURSES = ["Nurse Anjali", "Nurse Priya", "Nurse Kavya"];
const TESTS = {
  CBC: [["Hemoglobin", "g/dL", "13.8"], ["WBC", "/µL", "7200"], ["Platelets", "/µL", "240000"]],
  "Blood Glucose": [["Glucose", "mg/dL", "95"]],
  "Lipid Profile": [["Total Cholesterol", "mg/dL", "180"], ["HDL", "mg/dL", "50"], ["LDL", "mg/dL", "100"], ["Triglycerides", "mg/dL", "140"]],
  LFT: [["ALT", "U/L", "30"], ["AST", "U/L", "28"], ["Bilirubin", "mg/dL", "0.8"]],
  KFT: [["Creatinine", "mg/dL", "0.9"], ["Urea", "mg/dL", "28"]],
  "Urine Routine": [["Protein", "", "Nil"], ["Glucose", "", "Nil"], ["pH", "", "6.0"]],
};
const LOINC = {
  CBC: ["58410-2", "CBC panel – Blood by automated count"],
  "Blood Glucose": ["2345-7", "Glucose [Mass/volume] in Serum or Plasma"],
  "Lipid Profile": ["24331-1", "Lipid 1996 panel – Serum or Plasma"],
  LFT: ["24325-3", "Hepatic function panel – Serum or Plasma"],
  KFT: ["24362-6", "Renal function panel – Serum or Plasma"],
  "Urine Routine": ["24357-6", "Urinalysis macro (dipstick) panel – Urine"],
};
const SYMPTOMS = [["Fever", "R50.9"], ["Fatigue", "R53.83"], ["Headache", "R51.9"], ["Cough", "R05"], ["Sore throat", "J02.9"], ["Nausea", "R11.0"], ["Abdominal pain", "R10.9"], ["Breathlessness", "R06.02"], ["Chest pain", "R07.9"], ["Dizziness", "R42"], ["Body ache", "M79.1"]];
const DIAG = [["Viral infection (unspecified)", "B34.9"], ["Fever (unspecified)", "R50.9"], ["Acute upper respiratory infection", "J06.9"], ["Acute bronchitis", "J20.9"], ["Asthma (unspecified)", "J45.909"], ["Essential hypertension", "I10"], ["Type 2 diabetes mellitus", "E11.9"], ["Migraine (unspecified)", "G43.909"], ["Iron deficiency anemia", "D50.9"], ["Urinary tract infection", "N39.0"], ["Gastritis (unspecified)", "K29.70"], ["Dengue fever", "A90"], ["Malaria (unspecified)", "B54"], ["Infectious gastroenteritis", "A09"]];
const DRUGS = [["Paracetamol 500 mg – 1 tab thrice daily for 3 days", "Antipyretic"], ["Ibuprofen 400 mg – 1 tab twice daily after food", "NSAID"], ["Amoxicillin 500 mg – 1 cap thrice daily for 5 days", "Antibiotic"], ["Azithromycin 500 mg – 1 tab daily for 3 days", "Antibiotic"], ["Cetirizine 10 mg – 1 tab at night for 5 days", "Antihistamine"], ["Pantoprazole 40 mg – 1 tab before breakfast", "Antacid"], ["ORS – 1 sachet in 1 L water as needed", "Rehydration"], ["Metformin 500 mg – 1 tab twice daily with meals", "Antidiabetic"], ["Amlodipine 5 mg – 1 tab once daily", "Antihypertensive"], ["Salbutamol inhaler – 2 puffs when needed", "Bronchodilator"], ["Vitamin C 500 mg – 1 tab daily for 7 days", "Supplement"]];
// [healthy low, healthy high, critical below, critical above] (null = no limit); demo values only
const RANGES = {
  "CBC|Hemoglobin": [13, 17, 7, 20], "CBC|WBC": [4000, 11000, 2000, 30000], "CBC|Platelets": [150000, 450000, 50000, 1000000],
  "Blood Glucose|Glucose": [70, 140, 40, 400],
  "Lipid Profile|Total Cholesterol": [100, 200, null, 400], "Lipid Profile|HDL": [40, 100, 15, null],
  "Lipid Profile|LDL": [0, 130, null, 300], "Lipid Profile|Triglycerides": [0, 150, null, 1000],
  "LFT|ALT": [7, 56, null, 1000], "LFT|AST": [10, 40, null, 1000], "LFT|Bilirubin": [0.1, 1.2, null, 15],
  "KFT|Creatinine": [0.6, 1.3, null, 10], "KFT|Urea": [15, 45, null, 200],
  "Urine Routine|pH": [4.5, 8, 4, 9],
};
const flag = (test, k, v) => {
  const r = RANGES[test + "|" + k], n = parseFloat(v);
  if (!r || isNaN(n)) return null;
  const [lo, hi, cl, ch] = r;
  if ((cl != null && n < cl) || (ch != null && n > ch)) return "critical";
  return n < lo || n > hi ? "abnormal" : "normal";
};
const FLAG_BOX = { normal: "border-green-500 bg-green-50", abnormal: "border-amber-400 bg-amber-50", critical: "border-red-500 bg-red-50" };
const FLAG_TXT = { normal: "text-green-700", abnormal: "text-amber-700", critical: "text-red-600" };
const FLAG_MSG = { normal: "✓ Within healthy range", abnormal: "Outside healthy range", critical: "⚠ Extremely abnormal — please recheck" };
const tidy = (t) => t.replace(/[,\s]+$/, "");
const E = { symptoms: "", assessment: "", diagnosis: "", prescription: "" };
const mk = (id, name, age, gender, phone, allergies, hist, doctor, nurse, status, token, sym, dx, regToday) => ({
  id, name, age, gender, phone, allergies, medicalHistory: hist, doctor, nurse, status, token, regToday,
  appointments: [], current: { ...E },
  consultations: sym ? [{ date: "05 Oct 2026", doctor, symptoms: sym, diagnosis: dx, lab: "CBC" }] : [],
});
const SEED = [
  mk("P1001", "Aarav Sharma", 24, "Male", "9876543210", "Penicillin", ["No previous major illness", "Viral fever in 2025", "No previous surgeries"], "Dr. Mehta", "Nurse Anjali", "Waiting", 1, "Fever and fatigue", "Possible viral infection", false),
  mk("P1002", "Priya Nair", 31, "Female", "9876501234", "", ["Migraine since 2022"], "Dr. Sharma", "Nurse Priya", "In Consultation", 2, "Headache and nausea", "Migraine", false),
  mk("P1003", "Rohan Gupta", 45, "Male", "9811122233", "Sulfa drugs", ["Hypertension", "No previous surgeries"], "Dr. Mehta", "Nurse Kavya", "Completed", 3, "Cough for 5 days", "Bronchitis", false),
  mk("P1004", "Sneha Rao", 28, "Female", "9822233344", "", ["Mild asthma"], "Dr. Sharma", "Nurse Anjali", "Waiting", 4, "", "", true),
  mk("P1005", "Aditya Singh", 36, "Male", "9833344455", "Dust", ["Type 2 diabetes"], "Dr. Mehta", "Nurse Priya", "Waiting", 5, "", "", true),
];

const card = "bg-white rounded-xl shadow-sm border border-slate-200 p-5";
const btn = "bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-medium px-4 py-2 rounded-lg";
const inp = "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-teal-500 read-only:bg-slate-50";
const F = ({ l, children }) => <label className="block text-sm text-slate-600 mb-3">{l}{children}</label>;
const Cards = ({ items }) => (
  <div className="grid grid-cols-3 gap-4">
    {items.map(([l, v]) => (
      <div key={l} className={card}><p className="text-sm text-slate-500">{l}</p><p className="text-3xl font-semibold text-teal-700">{v}</p></div>
    ))}
  </div>
);
const Badge = ({ done, children }) => (
  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${done ? "bg-teal-100 text-teal-800" : "bg-amber-50 text-amber-700"}`}>{children}</span>
);
const unit = (test, k) => TESTS[test].find((x) => x[0] === k)?.[1] || "";
const OPD_STATUS = (o) => (o.reviewed ? "REVIEWED" : { "Sent to LIS": "SENT TO LIS", Processing: "PROCESSING", "Result Available": "RESULT AVAILABLE" }[o.status]);

function Login({ onLogin }) {
  const [f, setF] = useState({ role: "", id: "", pw: "" });
  const [err, setErr] = useState("");
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const go = () => {
    const u = USERS.find((x) => x.role === f.role && x.id === f.id.trim() && x.pw === f.pw);
    u ? onLogin(u) : setErr("Invalid credentials. Please check your role, ID and password.");
  };
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className={`${card} w-full max-w-sm`}>
        <div className="text-center mb-5">
          <Stethoscope className="mx-auto text-teal-600 mb-2" />
          <h1 className="text-xl font-semibold text-slate-800">Hospital OPD &amp; LIS</h1>
          <p className="text-sm text-slate-500">Integrated Outpatient Department System</p>
        </div>
        <F l="Role">
          <select value={f.role} onChange={s("role")} className={inp}>
            <option value="">Select Role</option>
            {["Doctor", "Nurse", "OPD Technician", "Lab Technician"].map((r) => <option key={r}>{r}</option>)}
          </select>
        </F>
        <F l="ID"><input value={f.id} onChange={s("id")} className={inp} /></F>
        <F l="Password"><input type="password" value={f.pw} onChange={s("pw")} className={inp} onKeyDown={(e) => e.key === "Enter" && go()} /></F>
        {err && <p className="text-sm text-red-600 mb-3">{err}</p>}
        <button onClick={go} className={`${btn} w-full`}>Login</button>
        <details className="mt-4 text-xs text-slate-600">
          <summary className="cursor-pointer text-teal-700 font-medium">Demo Credentials</summary>
          <table className="w-full mt-2">
            <tbody>{USERS.map((u) => <tr key={u.id}><td className="py-0.5">{u.name}</td><td>{u.id}</td><td>{u.pw}</td></tr>)}</tbody>
          </table>
        </details>
      </div>
    </div>
  );
}

function PatientList({ list, onOpen, showStaff }) {
  const [q, setQ] = useState("");
  const shown = list.filter((p) => (p.name + p.id).toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="space-y-3">
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by patient name or patient ID..." className={`${inp} pl-9 mt-0`} />
      </div>
      {shown.length === 0 && <p className="text-sm text-slate-500">No patients found.</p>}
      {shown.map((p) => (
        <div key={p.id} className={`${card} !p-4 flex items-center justify-between`}>
          <div>
            <p className="font-medium text-slate-800">{p.name} <span className="text-slate-400 font-normal">· {p.id}</span></p>
            <p className="text-sm text-slate-500">{p.age} years, {p.gender}{showStaff && ` · ${p.doctor} · ${p.nurse}`}</p>
          </div>
          <button onClick={() => onOpen(p.id)} className={btn}>Open Patient</button>
        </div>
      ))}
    </div>
  );
}

function Queue({ list, onOpen }) {
  return (
    <div className={`${card} overflow-x-auto`}>
      <h2 className="font-semibold text-slate-700 mb-3">Today's OPD Queue</h2>
      <table className="w-full text-sm text-left">
        <thead className="text-slate-500"><tr><th className="py-1">Token</th><th>Patient</th><th>Doctor</th><th>Nurse</th><th>Status</th></tr></thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className="border-t border-slate-100">
              <td className="py-2">{String(p.token).padStart(2, "0")}</td>
              <td><button onClick={() => onOpen(p.id)} className="text-teal-700 hover:underline">{p.name}</button></td>
              <td>{p.doctor}</td><td>{p.nurse.replace("Nurse ", "")}</td><td>{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Register({ onRegister }) {
  const [f, setF] = useState({ name: "", age: "", gender: "Male", phone: "", allergies: "", history: "", reason: "", doctor: DOCS[0], nurse: NURSES[0] });
  const s = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.name.trim() && f.age && f.reason.trim();
  return (
    <div className={card}>
      <h2 className="font-semibold text-slate-800 mb-1">Register Patient</h2>
      <p className="text-sm text-slate-500 mb-4">Patient arrives at hospital → registered at OPD.</p>
      <F l="Patient Name"><input value={f.name} onChange={s("name")} className={inp} /></F>
      <div className="grid grid-cols-3 gap-3">
        <F l="Age"><input type="number" value={f.age} onChange={s("age")} className={inp} /></F>
        <F l="Gender"><select value={f.gender} onChange={s("gender")} className={inp}><option>Male</option><option>Female</option><option>Other</option></select></F>
        <F l="Phone"><input value={f.phone} onChange={s("phone")} className={inp} /></F>
      </div>
      <F l="Allergies"><input value={f.allergies} onChange={s("allergies")} placeholder="Leave blank if none" className={inp} /></F>
      <F l="Medical History (one per line)"><textarea rows={2} value={f.history} onChange={s("history")} className={inp} /></F>
      <F l="Reason for Visit"><input value={f.reason} onChange={s("reason")} className={inp} /></F>
      <div className="grid grid-cols-2 gap-3">
        <F l="Assign Doctor"><select value={f.doctor} onChange={s("doctor")} className={inp}>{DOCS.map((d) => <option key={d}>{d}</option>)}</select></F>
        <F l="Assign Nurse"><select value={f.nurse} onChange={s("nurse")} className={inp}>{NURSES.map((d) => <option key={d}>{d}</option>)}</select></F>
      </div>
      <button disabled={!ok} onClick={() => onRegister(f)} className={btn}>Register Patient</button>
    </div>
  );
}

function Suggest({ value, onChange, list, sep, code }) {
  const [open, setOpen] = useState(false);
  const idx = Math.max(value.lastIndexOf(","), value.lastIndexOf("\n"));
  const q = value.slice(idx + 1).trim().toLowerCase();
  const hits = list.filter(([l, c]) => (l + " " + c).toLowerCase().includes(q));
  const pick = ([l, c]) => onChange((idx >= 0 ? value.slice(0, idx + 1) + (sep === "\n" ? "" : " ") : "") + (code ? `${l} (${c})` : l) + sep);
  return (
    <div className="relative">
      <textarea rows={2} value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} className={inp} />
      {open && hits.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg">
          {hits.map((h) => (
            <div key={h[0]} onMouseDown={(e) => { e.preventDefault(); pick(h); }} className="px-3 py-2 text-sm flex justify-between gap-3 cursor-pointer hover:bg-teal-50">
              <span>{h[0]}</span><span className="text-xs text-teal-700 shrink-0">{code ? `ICD-10 ${h[1]}` : h[1]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderModal({ p, orders, onSend, onClose }) {
  const [test, setTest] = useState("CBC");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const hits = Object.keys(TESTS).filter((t) => (t + " " + LOINC[t].join(" ")).toLowerCase().includes(q.toLowerCase()));
  const [ind, setInd] = useState(p.current.symptoms);
  const [pri, setPri] = useState("Routine");
  const dup = orders.some((o) => o.patientId === p.id && o.test === test && o.status !== "Result Available");
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between mb-4"><h3 className="text-lg font-semibold">Order Laboratory Test</h3><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div>
        <div className="relative">
          <F l="Test (search by name or LOINC code)"><input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} placeholder="e.g. CBC, glucose, 58410-2" className={inp} /></F>
          {open && hits.length > 0 && (
            <div className="absolute z-20 left-0 right-0 -mt-2 max-h-48 overflow-auto bg-white border border-slate-200 rounded-lg shadow-lg">
              {hits.map((t) => (
                <div key={t} onMouseDown={(e) => { e.preventDefault(); setTest(t); setQ(""); setOpen(false); }} className="px-3 py-2 text-sm cursor-pointer hover:bg-teal-50">
                  <div className="flex justify-between"><b>{t}</b><span className="text-xs text-teal-700">LOINC {LOINC[t][0]}</span></div>
                  <div className="text-xs text-slate-500">{LOINC[t][1]}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <p className="text-sm bg-teal-50 border border-teal-200 rounded-lg p-2 mb-3">Selected: <b>{test}</b> · LOINC {LOINC[test][0]}<br /><span className="text-xs text-slate-500">{LOINC[test][1]}</span></p>
        <F l="Clinical Indication"><input value={ind} onChange={(e) => setInd(e.target.value)} className={inp} /></F>
        <div className="flex gap-5 text-sm mb-4">
          {["Routine", "Urgent"].map((x) => <label key={x} className="flex items-center gap-2"><input type="radio" checked={pri === x} onChange={() => setPri(x)} />{x}</label>)}
        </div>
        {dup && <p className="text-sm text-amber-700 mb-3">{test} is already ordered and still in progress for this patient.</p>}
        <button disabled={dup} onClick={() => onSend(test, ind, pri)} className={`${btn} w-full`}>Send to LIS</button>
      </div>
    </div>
  );
}

function Profile({ p, user, orders, setOrders, upd, flash }) {
  const isDoc = user.role === "Doctor", isNurse = user.role === "Nurse";
  const [c, setC] = useState(p.current);
  const [modal, setModal] = useState(false);
  const [fu, setFu] = useState({ date: "10 Oct 2026", time: "10:30 AM", doctor: p.doctor });
  const mine = orders.filter((o) => o.patientId === p.id);
  const sc = (k) => (e) => setC({ ...c, [k]: e.target.value });
  const save = () => { upd(p.id, (x) => ({ ...x, current: { ...c, symptoms: tidy(c.symptoms), diagnosis: tidy(c.diagnosis), prescription: tidy(c.prescription) }, status: ["Waiting", "Follow-up Scheduled"].includes(x.status) ? "In Consultation" : x.status })); flash("✓ Consultation saved"); };
  const complete = () => {
    upd(p.id, (x) => ({ ...x, current: { ...E }, status: "Completed", consultations: [{ date: TODAY, doctor: p.doctor, symptoms: tidy(c.symptoms), diagnosis: tidy(c.diagnosis), lab: mine.map((o) => o.test).join(", ") || "—" }, ...x.consultations] }));
    setC({ ...E }); flash("✓ Consultation completed");
  };
  const send = (test, indication, priority) => {
    setOrders([...orders, { orderId: "L" + (1001 + orders.length), patientId: p.id, test, loinc: LOINC[test][0], indication, priority, orderedBy: user.name, status: "Sent to LIS", date: TODAY, results: null, reviewed: false }]);
    setModal(false); flash(`✓ ${test} sent to LIS`);
  };
  const schedule = () => { upd(p.id, (x) => ({ ...x, appointments: [...x.appointments, { type: "Follow-up", ...fu }], status: x.status === "Completed" ? "Follow-up Scheduled" : x.status })); flash("Follow-up appointment scheduled."); };
  return (
    <div className="space-y-5">
      <div className={card}>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">{p.name}</h1>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600">
          <p>Patient ID: <b>{p.id}</b></p><p>Phone: {p.phone}</p>
          <p>Age: {p.age}</p><p>Gender: {p.gender}</p>
          <p>Assigned Doctor: {p.doctor}</p><p>Assigned Nurse: {p.nurse}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className={card}><h2 className="font-semibold text-slate-700 mb-2">Allergies</h2><p className="text-sm">{p.allergies || "No known allergies"}</p></div>
        <div className={card}><h2 className="font-semibold text-slate-700 mb-2">Medical History</h2><ul className="text-sm list-disc ml-4">{p.medicalHistory.length ? p.medicalHistory.map((h) => <li key={h}>{h}</li>) : <li>None recorded</li>}</ul></div>
      </div>
      <div className={card}>
        <h2 className="font-semibold text-slate-700 mb-2">Consultation History</h2>
        {p.consultations.length === 0 && <p className="text-sm text-slate-500">No previous consultations.</p>}
        {p.consultations.map((x, i) => (
          <div key={i} className="text-sm border-t border-slate-100 py-2">
            <p className="font-medium">{x.date} · {x.doctor}</p>
            <p>Symptoms: {x.symptoms || "—"} · Diagnosis: {x.diagnosis || "—"} · Lab Test: {x.lab}</p>
          </div>
        ))}
        {p.appointments.map((a, i) => <p key={i} className="text-sm text-teal-700 border-t border-slate-100 pt-2 mt-2">{a.type}: {a.date}, {a.time} with {a.doctor || p.doctor}</p>)}
      </div>
      <div className={card}>
        <h2 className="font-semibold text-slate-700 mb-1">Current Consultation <span className="text-xs font-normal text-slate-500">({p.status})</span></h2>
        {!isDoc && <p className="text-xs text-slate-500 mb-2">View only — only doctors can edit.</p>}
        {[["symptoms", "Symptoms", SYMPTOMS, ", ", 0], ["assessment", "Clinical Assessment"], ["diagnosis", "Diagnosis (ICD-10 coded)", DIAG, ", ", 1], ["prescription", "Prescription", DRUGS, "\n", 0]].map(([k, l, list, sep, code]) => (
          <F key={k} l={l}>
            {list && isDoc ? <Suggest value={c[k]} onChange={(v) => setC({ ...c, [k]: v })} list={list} sep={sep} code={code} />
              : <textarea rows={2} readOnly={!isDoc} value={isDoc ? c[k] : p.current[k]} onChange={sc(k)} className={inp} />}
          </F>
        ))}
        {isDoc && p.status !== "Completed" && <div className="flex gap-2"><button onClick={save} className={btn}>Save Consultation</button><button onClick={complete} className="border border-teal-600 text-teal-700 text-sm font-medium px-4 py-2 rounded-lg">Complete Consultation</button></div>}
      </div>
      <div className={card}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2"><FlaskConical size={18} className="text-teal-600" /> Lab Investigations</h2>
          {isDoc && <button onClick={() => setModal(true)} className={`${btn} inline-flex items-center gap-1`}><Plus size={16} /> Order Lab Test</button>}
        </div>
        {mine.length === 0 && <p className="text-sm text-slate-500">No laboratory tests ordered.</p>}
        <div className="space-y-3">
          {mine.map((o) => (
            <div key={o.orderId} className={`rounded-lg p-4 ${o.results ? "border-2 border-teal-500 bg-teal-50/40" : "border border-slate-200"}`}>
              <div className="flex justify-between items-center">
                <p className="font-medium">{o.test} <span className="text-xs text-slate-400">· {o.priority} · LOINC {o.loinc}</span></p>
                <Badge done={!!o.results}>{o.results && "✓ "}{OPD_STATUS(o)}</Badge>
              </div>
              {o.results && (
                <div className="mt-2 text-sm grid grid-cols-3 gap-2">
                  {Object.entries(o.results).map(([k, v]) => <p key={k} className="text-slate-500">{k}<br /><b className={FLAG_TXT[flag(o.test, k, v)] || "text-slate-800"}>{v} {unit(o.test, k)}{flag(o.test, k, v) === "critical" && " ⚠"}</b></p>)}
                </div>
              )}
              {isDoc && o.results && !o.reviewed && <button onClick={() => setOrders(orders.map((x) => (x === o ? { ...x, reviewed: true } : x)))} className="mt-3 text-sm text-teal-700 underline">Mark result as reviewed</button>}
            </div>
          ))}
        </div>
      </div>
      {(isNurse || isDoc) && (
        <div className={card}>
          <h2 className="font-semibold text-slate-700 mb-3">Schedule Follow-up</h2>
          <div className="grid grid-cols-3 gap-3">
            <F l="Date"><input value={fu.date} onChange={(e) => setFu({ ...fu, date: e.target.value })} className={inp} /></F>
            <F l="Time"><input value={fu.time} onChange={(e) => setFu({ ...fu, time: e.target.value })} className={inp} /></F>
            <F l="Doctor"><select value={fu.doctor} onChange={(e) => setFu({ ...fu, doctor: e.target.value })} className={inp}>{DOCS.map((d) => <option key={d}>{d}</option>)}</select></F>
          </div>
          <button onClick={schedule} className={btn}>Schedule</button>
        </div>
      )}
      {modal && <OrderModal p={p} orders={orders} onSend={send} onClose={() => setModal(false)} />}
    </div>
  );
}

function LabList({ orders, page, onOpen }) {
  const [q, setQ] = useState("");
  const rows = orders.filter((o) => o.patientId.toLowerCase().includes(q.toLowerCase()) && (page === "results" ? o.results : page === "dash" ? !o.results : true));
  const n = (s) => orders.filter((o) => o.status === s).length;
  return (
    <div className="space-y-4">
      {page === "dash" && <Cards items={[["Pending Orders", n("Sent to LIS")], ["Processing", n("Processing")], ["Completed", n("Result Available")]]} />}
      <div className="flex items-start gap-2 text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg p-3">
        <ShieldCheck size={16} className="shrink-0" /> Patient-identifying information is restricted. Laboratory staff access the Patient ID required for test processing.
      </div>
      <div className="relative">
        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by Patient ID..." className={`${inp} pl-9 mt-0`} />
      </div>
      <div className={`${card} overflow-x-auto`}>
        <h2 className="font-semibold text-slate-700 mb-3">{page === "results" ? "Completed Results" : "Incoming Lab Orders"}</h2>
        {rows.length === 0 && <p className="text-sm text-slate-500">No orders yet. Orders sent from OPD will appear here.</p>}
        {rows.length > 0 && (
          <table className="w-full text-sm text-left">
            <thead className="text-slate-500"><tr><th className="py-1">Patient ID</th><th>Test</th><th>Doctor</th><th>Priority</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o.orderId} className="border-t border-slate-100">
                  <td className="py-2 font-medium">{o.patientId}</td><td>{o.test}<br /><span className="text-xs text-slate-400">LOINC {o.loinc}</span></td><td>{o.orderedBy}</td>
                  <td className={o.priority === "Urgent" ? "text-red-600 font-medium" : ""}>{o.priority}</td>
                  <td>{{ "Sent to LIS": "Received", Processing: "Processing", "Result Available": "Completed" }[o.status]}</td>
                  <td>{o.date}</td>
                  <td>{o.status !== "Result Available" && <button onClick={() => onOpen(o.orderId)} className={btn}>Process</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Process({ o, onVerify, back }) {
  const fields = TESTS[o.test];
  const done = o.status === "Result Available";
  const [f, setF] = useState(o.results || {});
  const ok = fields.every(([k]) => (f[k] || "").toString().trim());
  const [warn, setWarn] = useState(false);
  const crit = fields.filter(([k]) => flag(o.test, k, f[k]) === "critical").map(([k]) => k);
  const Step = ({ s, children }) => (
    <li className="flex items-center gap-2 text-sm">
      {s === 2 ? <CheckCircle2 size={18} className="text-teal-600" /> : s === 1 ? <Loader2 size={18} className="text-sky-600 animate-spin" /> : <Circle size={18} className="text-slate-300" />}
      <span className={s === 0 ? "text-slate-400" : ""}>{children}</span>
    </li>
  );
  return (
    <div className="space-y-5">
      <button onClick={back} className="text-sm text-teal-700 hover:underline">← Back to orders</button>
      <div className={card}>
        <p className="text-sm text-slate-600">Patient ID: <b>{o.patientId}</b></p>
        <p className="text-sm text-slate-600">Test: <b>{o.test}</b> <span className="text-xs text-slate-400">(LOINC {o.loinc})</span> · Ordered by: {o.orderedBy}</p>
        <ul className="space-y-2 mt-3">
          <Step s={2}>Received</Step><Step s={2}>Sample collected</Step>
          <Step s={done ? 2 : 1}>Processing</Step><Step s={done ? 2 : 0}>Result verification</Step>
        </ul>
      </div>
      <div className={card}>
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Activity size={18} className="text-teal-600" /> Enter Results</h2>
        {fields.map(([k, u, ph]) => {
          const fl = flag(o.test, k, f[k]);
          const r = RANGES[o.test + "|" + k];
          return (
            <F key={k} l={`${k} ${u && `(${u})`}`}>
              <input disabled={done} value={f[k] || ""} placeholder={ph} onChange={(e) => { setF({ ...f, [k]: e.target.value }); setWarn(false); }}
                className={fl ? inp.replace("border-slate-300", FLAG_BOX[fl]) : inp} />
              {fl && <span className={`block text-xs mt-1 ${FLAG_TXT[fl]}`}>{FLAG_MSG[fl]} ({r[0]}–{r[1]} {u})</span>}
            </F>
          );
        })}
        {warn && !done && (
          <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            <p className="font-medium">⚠ Warning: extremely abnormal value{crit.length > 1 ? "s" : ""} — {crit.join(", ")}.</p>
            <p className="mt-1">Please confirm these are correct before sending to OPD.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setWarn(false)} className="border border-red-300 bg-white text-red-700 text-sm font-medium px-4 py-2 rounded-lg">Go back and check</button>
              <button onClick={() => onVerify(o.orderId, f)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg">Verify &amp; Send anyway</button>
            </div>
          </div>
        )}
        {done ? <p className="text-teal-800 bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm">✓ Result verified · ✓ Result sent to OPD</p>
          : !warn && <button disabled={!ok} onClick={() => (crit.length ? setWarn(true) : onVerify(o.orderId, f))} className={`${btn} w-full`}>Verify &amp; Send to OPD</button>}
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [patients, setPatients] = useState(SEED);
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState("dash");
  const [pid, setPid] = useState(null);
  const [oid, setOid] = useState(null);
  const [toast, setToast] = useState("");
  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 2500); };
  const upd = (id, fn) => setPatients((ps) => ps.map((p) => (p.id === id ? fn(p) : p)));
  const nav = (pg) => { setPage(pg); setPid(null); setOid(null); };

  if (!user) return <Login onLogin={(u) => { setUser(u); nav("dash"); }} />;
  const r = user.role;
  const mine = patients.filter((p) => (r === "Doctor" ? p.doctor === user.name : r === "Nurse" ? p.nurse === user.name : true));
  const myOrders = orders.filter((o) => mine.some((p) => p.id === o.patientId));
  const common = [["dash", "OPD Dashboard"], ["pts", "My Patients"], ["appts", "Appointments"]];
  const navs = { Doctor: common, Nurse: common, "OPD Technician": [["dash", "OPD Dashboard"], ["pts", "All Patients"], ["reg", "Register Patient"], ["queue", "OPD Queue"]], "Lab Technician": [["dash", "LIS Dashboard"], ["orders", "Lab Orders"], ["results", "Results"]] }[r];
  const patient = patients.find((p) => p.id === pid);
  const open = (id) => setPid(id);
  const followups = mine.flatMap((p) => p.appointments.map((a) => ({ ...a, name: p.name })));

  const register = (f) => {
    const id = "P" + (1001 + patients.length);
    setPatients([...patients, {
      id, name: f.name.trim(), age: f.age, gender: f.gender, phone: f.phone, allergies: f.allergies.trim(),
      medicalHistory: f.history.split("\n").map((x) => x.trim()).filter(Boolean), doctor: f.doctor, nurse: f.nurse,
      appointments: [], consultations: [], current: { ...E, symptoms: f.reason }, status: "Waiting", token: patients.length + 1, regToday: true,
    }]);
    flash(`Patient registered successfully. ID: ${id}`); nav("pts");
  };
  const verify = (orderId, results) => {
    setOrders(orders.map((o) => (o.orderId === orderId ? { ...o, status: "Result Available", results } : o)));
    flash("✓ Result verified and sent to OPD");
  };
  const startProcess = (id) => {
    setOrders(orders.map((o) => (o.orderId === id && o.status === "Sent to LIS" ? { ...o, status: "Processing" } : o)));
    setOid(id);
  };

  let body;
  if (r === "Lab Technician") {
    const o = orders.find((x) => x.orderId === oid);
    body = o ? <Process key={o.orderId} o={o} onVerify={verify} back={() => setOid(null)} /> : <LabList orders={orders} page={page} onOpen={startProcess} />;
  } else if (patient) {
    body = <div><button onClick={() => setPid(null)} className="text-sm text-teal-700 hover:underline mb-3">← Back</button><Profile key={patient.id} p={patient} user={user} orders={orders} setOrders={setOrders} upd={upd} flash={flash} /></div>;
  } else if (page === "reg") body = <Register onRegister={register} />;
  else if (page === "queue") body = <Queue list={patients} onOpen={open} />;
  else if (page === "appts") body = (
    <div className="space-y-4"><Queue list={mine} onOpen={open} />
      <div className={card}><h2 className="font-semibold text-slate-700 mb-2">Follow-up Appointments</h2>
        {followups.length === 0 && <p className="text-sm text-slate-500">None scheduled.</p>}
        {followups.map((a, i) => <p key={i} className="text-sm py-1">{a.name} — {a.date}, {a.time} with {a.doctor}</p>)}</div></div>
  );
  else if (page === "pts") body = <PatientList list={mine} onOpen={open} showStaff={r === "OPD Technician"} />;
  else {
    const waiting = patients.filter((p) => p.status === "Waiting").length;
    body = (
      <div className="space-y-5">
        {r === "Doctor" && <Cards items={[["Assigned Patients", mine.length], ["Today's Appointments", mine.filter((p) => ["Waiting", "In Consultation"].includes(p.status)).length], ["Pending Lab Results", myOrders.filter((o) => !o.results).length]]} />}
        {r === "Nurse" && <Cards items={[["Assigned Patients", mine.length], ["Today's Appointments", mine.length], ["Follow-ups", followups.length]]} />}
        {r === "OPD Technician" && <>
          <Cards items={[["Total Patients", patients.length], ["Today's Registrations", patients.filter((p) => p.regToday).length], ["Waiting Patients", waiting]]} />
          <div className="flex gap-3"><button onClick={() => nav("reg")} className={btn}>Register Patient</button><button onClick={() => nav("pts")} className={btn}>View All Patients</button><button onClick={() => nav("queue")} className={btn}>View OPD Queue</button></div></>}
        {(r === "Doctor" || r === "Nurse") && <><h2 className="text-lg font-semibold text-slate-700">My Patients</h2><PatientList list={mine} onOpen={open} /></>}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center gap-1">
          <span className="font-semibold text-teal-700 mr-3 text-sm">{r === "Lab Technician" ? "LIS" : "OPD"}</span>
          {navs.map(([k, l]) => (
            <button key={k} onClick={() => nav(k)} className={`px-3 py-1.5 rounded-lg text-sm font-medium ${page === k ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{l}</button>
          ))}
          <span className="ml-auto text-sm text-slate-500 mr-2">{user.name}</span>
          <button onClick={() => setUser(null)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-red-600"><LogOut size={16} /> Logout</button>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-semibold mb-4">{page === "dash" && !pid && !oid ? `Welcome, ${user.name}` : ""}</h1>
        {body}
      </main>
      {toast && <div className="fixed top-5 right-5 z-50 bg-teal-700 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">{toast}</div>}
    </div>
  );
}
