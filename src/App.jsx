import { useState } from "react";
import {
  Stethoscope, FlaskConical, User, Plus, CheckCircle2, Circle,
  Loader2, ArrowRight, X, Activity, FileText,
} from "lucide-react";

const INITIAL_PATIENTS = [
  { id: "P1001", name: "Aarav Sharma", age: 24, gender: "Male", symptoms: "Fever and fatigue", assessment: "Possible viral infection" },
  { id: "P1002", name: "Priya Nair", age: 31, gender: "Female", symptoms: "Headache and nausea", assessment: "Likely migraine" },
  { id: "P1003", name: "Rohan Gupta", age: 45, gender: "Male", symptoms: "Cough for 5 days", assessment: "Possible bronchitis" },
];

// orders: { [patientId]: { test, indication, status: "sent" | "resulted", result: {hb, wbc, plt} | null } }

function IntegrationBanner({ orders }) {
  const list = Object.values(orders);
  const hasSent = list.some((o) => o.status === "sent");
  const hasResult = list.some((o) => o.status === "resulted");
  const on = "bg-teal-600 text-white";
  const off = "bg-slate-100 text-slate-500";
  const Chip = ({ active, children }) => (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-500 ${active ? on : off}`}>{children}</span>
  );
  const Arrow = ({ active }) => (
    <ArrowRight size={14} className={`transition-colors duration-500 ${active ? "text-teal-600" : "text-slate-300"}`} />
  );
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-4 py-3 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold text-slate-700 mr-2">OPD–LIS Integration</span>
      <Chip active>OPD</Chip>
      <Arrow active={hasSent || hasResult} />
      <Chip active={hasSent || hasResult}>Lab order</Chip>
      <Arrow active={hasSent || hasResult} />
      <Chip active={hasSent || hasResult}>LIS</Chip>
      <Arrow active={hasResult} />
      <Chip active={hasResult}>Lab result</Chip>
      <Arrow active={hasResult} />
      <Chip active={hasResult}>OPD</Chip>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className="fixed top-5 right-5 z-50 bg-teal-700 text-white px-4 py-3 rounded-xl shadow-lg text-sm font-medium">
      {message}
    </div>
  );
}

function OrderModal({ patient, onClose, onSend }) {
  const [test, setTest] = useState("CBC");
  const [indication, setIndication] = useState(patient.symptoms);
  return (
    <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-slate-800">Order Laboratory Test</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
        </div>
        <label className="block text-sm text-slate-600 mb-1">Test</label>
        <select value={test} onChange={(e) => setTest(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option>CBC</option>
        </select>
        <label className="block text-sm text-slate-600 mb-1">Clinical indication</label>
        <input value={indication} onChange={(e) => setIndication(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-teal-500" />
        <button onClick={() => onSend(test, indication)}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2.5 rounded-lg">
          Send to LIS
        </button>
      </div>
    </div>
  );
}

function AddPatientForm({ onAdd, onCancel }) {
  const [f, setF] = useState({ name: "", age: "", gender: "Male", symptoms: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const ok = f.name.trim() && f.age && f.symptoms.trim();
  const input = "w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500";
  return (
    <div className="bg-white rounded-xl shadow-sm border-2 border-teal-200 p-5 space-y-3">
      <h3 className="font-semibold text-slate-800">Add Patient</h3>
      <div>
        <label className="block text-sm text-slate-600 mb-1">Full name</label>
        <input value={f.name} onChange={set("name")} className={input} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm text-slate-600 mb-1">Age</label>
          <input type="number" min="0" value={f.age} onChange={set("age")} className={input} />
        </div>
        <div>
          <label className="block text-sm text-slate-600 mb-1">Gender</label>
          <select value={f.gender} onChange={set("gender")} className={input}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm text-slate-600 mb-1">Symptoms</label>
        <input value={f.symptoms} onChange={set("symptoms")} className={input} />
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onAdd(f)} disabled={!ok}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-medium px-5 py-2 rounded-lg">
          Save Patient
        </button>
        <button onClick={onCancel} className="text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-100">Cancel</button>
      </div>
    </div>
  );
}

function OpdDashboard({ patients, orders, onOpen, onAdd }) {
  const [showForm, setShowForm] = useState(false);
  const pending = Object.values(orders).filter((o) => o.status === "sent").length;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">OPD Module</h1>
      <IntegrationBanner orders={orders} />
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Today's Patients</p>
          <p className="text-3xl font-semibold text-slate-800">{patients.length + 5}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Pending Lab Results</p>
          <p className="text-3xl font-semibold text-teal-700">{pending}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-700">Current Patients</h2>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 border border-teal-600 text-teal-700 hover:bg-teal-50 text-sm font-medium px-4 py-2 rounded-lg">
            <Plus size={16} /> Add Patient
          </button>
        )}
      </div>
      {showForm && <AddPatientForm onCancel={() => setShowForm(false)} onAdd={(f) => { onAdd(f); setShowForm(false); }} />}
      <div className="space-y-3">
        {patients.map((p) => (
          <div key={p.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center"><User size={20} /></div>
              <div>
                <p className="font-medium text-slate-800">{p.name}</p>
                <p className="text-sm text-slate-500">{p.age} years, {p.gender}</p>
              </div>
            </div>
            <button onClick={() => onOpen(p.id)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Open Patient
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PatientPage({ patient, order, orders, onBack, onOrder }) {
  const [showResult, setShowResult] = useState(false);
  const r = order?.result;
  const ranges = [
    ["Hemoglobin", r?.hb, "g/dL", "13.0 – 17.0"],
    ["WBC", r?.wbc, "/µL", "4000 – 11000"],
    ["Platelets", r?.plt, "/µL", "150000 – 450000"],
  ];
  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-teal-700 hover:underline">← Back to OPD</button>
      <IntegrationBanner orders={orders} />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h1 className="text-xl font-semibold text-slate-800">{patient.name}</h1>
        <p className="text-sm text-slate-500 mt-1">Patient ID: {patient.id} · Age: {patient.age} · Gender: {patient.gender}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><Stethoscope size={18} className="text-teal-600" /> Current Consultation</h2>
        <p className="text-sm text-slate-500">Symptoms</p>
        <p className="text-slate-800 mb-3">{patient.symptoms}</p>
        <p className="text-sm text-slate-500">Doctor's Assessment</p>
        <p className="text-slate-800">{patient.assessment}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2"><FlaskConical size={18} className="text-teal-600" /> Laboratory Tests</h2>

        {!order && (
          <>
            <p className="text-slate-500 mb-4">No laboratory tests ordered.</p>
            <button onClick={onOrder}
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium px-5 py-2.5 rounded-lg shadow-sm">
              <Plus size={18} /> Order Lab Test
            </button>
          </>
        )}

        {order?.status === "sent" && (
          <div className="border border-slate-200 rounded-lg p-4 flex items-center justify-between">
            <p className="font-medium text-slate-800">{order.test}</p>
            <span className="text-xs font-semibold bg-amber-50 text-amber-700 px-3 py-1 rounded-full">Status: SENT TO LIS</span>
          </div>
        )}

        {order?.status === "resulted" && (
          <div className="border-2 border-teal-500 bg-teal-50/40 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-medium text-slate-800">{order.test}</p>
              <span className="text-xs font-semibold bg-teal-100 text-teal-800 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 size={14} /> RESULT AVAILABLE
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <div><p className="text-slate-500">Hemoglobin</p><p className="font-semibold text-slate-800">{r.hb} g/dL</p></div>
              <div><p className="text-slate-500">WBC</p><p className="font-semibold text-slate-800">{r.wbc} /µL</p></div>
              <div><p className="text-slate-500">Platelets</p><p className="font-semibold text-slate-800">{r.plt} /µL</p></div>
            </div>
            <button onClick={() => setShowResult(!showResult)}
              className="inline-flex items-center gap-2 text-sm font-medium text-teal-700 border border-teal-300 bg-white px-4 py-2 rounded-lg hover:bg-teal-50">
              <FileText size={16} /> {showResult ? "Hide Result" : "View Result"}
            </button>
            {showResult && (
              <table className="w-full text-sm bg-white rounded-lg border border-slate-200">
                <thead><tr className="text-left text-slate-500">
                  <th className="p-2 font-medium">Test</th><th className="p-2 font-medium">Value</th><th className="p-2 font-medium">Reference</th>
                </tr></thead>
                <tbody>
                  {ranges.map(([n, v, u, ref]) => (
                    <tr key={n} className="border-t border-slate-100">
                      <td className="p-2">{n}</td><td className="p-2 font-medium">{v} {u}</td><td className="p-2 text-slate-500">{ref}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LisPage({ patients, orders, onProcess }) {
  const entries = Object.entries(orders);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-800">Laboratory Information System</h1>
      <IntegrationBanner orders={orders} />
      <h2 className="text-lg font-semibold text-slate-700">Incoming Lab Orders from OPD</h2>
      {entries.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No orders yet. Orders sent from OPD will appear here.
        </div>
      )}
      {entries.map(([pid, o]) => {
        const p = patients.find((x) => x.id === pid);
        const done = o.status === "resulted";
        return (
          <div key={pid} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-slate-800 text-lg">{o.test}</p>
              <p className="text-sm text-slate-600">Patient: {p.name}</p>
              <p className="text-sm text-slate-600">Ordered by: Dr. Strange</p>
              <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full ${done ? "bg-teal-100 text-teal-800" : "bg-sky-50 text-sky-700"}`}>
                Status: {done ? "RESULT SENT TO OPD" : "RECEIVED FROM OPD"}
              </span>
            </div>
            {!done && (
              <button onClick={() => onProcess(pid)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium px-4 py-2 rounded-lg">
                Process Test
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ProcessPage({ patients, pid, orders, onBack, onVerify, goOpd }) {
  const p = patients.find((x) => x.id === pid);
  const order = orders[pid];
  const done = order.status === "resulted";
  const [form, setForm] = useState({ hb: "", wbc: "", plt: "" });
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const filled = form.hb && form.wbc && form.plt;

  const Step = ({ state, children }) => (
    <li className="flex items-center gap-2 text-sm">
      {state === "done" && <CheckCircle2 size={18} className="text-teal-600" />}
      {state === "now" && <Loader2 size={18} className="text-sky-600 animate-spin" />}
      {state === "todo" && <Circle size={18} className="text-slate-300" />}
      <span className={state === "todo" ? "text-slate-400" : "text-slate-700"}>{children}</span>
    </li>
  );

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="text-sm text-teal-700 hover:underline">← Back to LIS orders</button>
      <IntegrationBanner orders={orders} />
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h1 className="text-xl font-semibold text-slate-800 mb-3">{order.test} — {p.name}</h1>
        <ul className="space-y-2">
          <Step state="done">Order received from OPD</Step>
          <Step state="done">Sample collected</Step>
          <Step state={done ? "done" : "now"}>{done ? "Processed" : "Processing"}</Step>
          <Step state={done ? "done" : "todo"}>Result verification</Step>
        </ul>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-700 mb-4 flex items-center gap-2"><Activity size={18} className="text-teal-600" /> Enter Result</h2>
        {[["hb", "Hemoglobin (g/dL)", "13.8"], ["wbc", "WBC (/µL)", "7200"], ["plt", "Platelets (/µL)", "240000"]].map(([k, label, ph]) => (
          <div key={k} className="mb-3">
            <label className="block text-sm text-slate-600 mb-1">{label}</label>
            <input value={done ? order.result[k] : form[k]} onChange={set(k)} disabled={done} placeholder={ph}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 disabled:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
        ))}
        {!done ? (
          <button onClick={() => onVerify(pid, form)} disabled={!filled}
            className="mt-2 w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-medium py-2.5 rounded-lg">
            Verify &amp; Send to OPD
          </button>
        ) : (
          <div className="mt-2 rounded-lg bg-teal-50 border border-teal-200 p-4">
            <p className="font-medium text-teal-800 flex items-center gap-2"><CheckCircle2 size={18} /> Result verified and sent to OPD</p>
            <p className="text-xs font-semibold text-teal-700 mt-1">Status: RESULT SENT TO OPD</p>
            <button onClick={goOpd} className="mt-3 text-sm font-medium text-teal-700 underline">Go to OPD</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("opd"); // opd | lis
  const [patientId, setPatientId] = useState(null);
  const [processId, setProcessId] = useState(null);
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [orders, setOrders] = useState({});
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2500); };

  const sendOrder = (test, indication) => {
    setOrders({ ...orders, [patientId]: { test, indication, status: "sent", result: null } });
    setModal(false);
    flash("✓ Lab order sent to LIS");
  };

  const verify = (pid, f) => {
    setOrders({ ...orders, [pid]: { ...orders[pid], status: "resulted", result: f } });
    flash("✓ Result verified and sent to OPD");
  };

  const go = (t) => { setTab(t); setPatientId(null); setProcessId(null); };
  const patient = patients.find((p) => p.id === patientId);

  const addPatient = (f) => {
    const id = "P" + (1001 + patients.length);
    setPatients([...patients, {
      id, name: f.name.trim(), age: f.age, gender: f.gender,
      symptoms: f.symptoms.trim(), assessment: "Awaiting assessment",
    }]);
    setPatientId(id);
    flash("✓ Patient added");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <nav className="bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2">
          <span className="font-semibold text-teal-700 mr-4">Hospital Demo</span>
          {[["opd", "OPD", Stethoscope], ["lis", "LIS", FlaskConical]].map(([k, label, Icon]) => (
            <button key={k} onClick={() => go(k)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium ${tab === k ? "bg-teal-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {tab === "opd" && !patient && <OpdDashboard patients={patients} orders={orders} onOpen={setPatientId} onAdd={addPatient} />}
        {tab === "opd" && patient && (
          <PatientPage patient={patient} order={orders[patient.id]} orders={orders}
            onBack={() => setPatientId(null)} onOrder={() => setModal(true)} />
        )}
        {tab === "lis" && !processId && <LisPage patients={patients} orders={orders} onProcess={setProcessId} />}
        {tab === "lis" && processId && (
          <ProcessPage patients={patients} pid={processId} orders={orders} onBack={() => setProcessId(null)}
            onVerify={verify} goOpd={() => go("opd")} />
        )}
      </main>

      {modal && <OrderModal patient={patient} onClose={() => setModal(false)} onSend={sendOrder} />}
      <Toast message={toast} />
    </div>
  );
}
