import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from "firebase/firestore";

// 🔥 CONFIG FIREBASE
const firebaseConfig = {
  apiKey: "AIzaSyC1hzlTkTt1AK4DhkR13XpB_wmal4s2v38",
  authDomain: "eri-korlantas.firebaseapp.com",
  projectId: "eri-korlantas",
  storageBucket: "eri-korlantas.firebasestorage.app",
  messagingSenderId: "472012289728",
  appId: "1:472012289728:web:86b6e0c5354f1e6ef99f25"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function App() {
  const [user, setUser] = useState(null);
  const [loginId, setLoginId] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [query, setQuery] = useState("");
  const [result, setResult] = useState("");

  const [newUser, setNewUser] = useState("");
  const [newPass, setNewPass] = useState("");
  const [days, setDays] = useState("");

  // =====================
  // 🔐 LOGIN
  // =====================
  const handleLogin = async () => {
    const ref = doc(db, "users", loginId);
    const snap = await getDoc(ref);

    if (!snap.exists()) return alert("User tidak ada");

    const data = snap.data();

    if (data.pass !== loginPass) return alert("Password salah");

    // ❌ CEK DISABLE
    if (data.active === false) {
      alert("AKUN NONAKTIF!");
      return;
    }

    const deviceId = navigator.userAgent;

    if (data.device && data.device !== deviceId) {
      alert("AKUN SUDAH DIGUNAKAN DI DEVICE LAIN!");
      return;
    }

    await updateDoc(ref, { device: deviceId });

    setUser({ ...data, docId: loginId });
    localStorage.setItem("user", JSON.stringify({ ...data, docId: loginId }));
  };

  // =====================
  // 🔄 AUTO LOGIN
  // =====================
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // =====================
  // ⏳ CEK MASA AKTIF + REALTIME
  // =====================
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(async () => {
      const ref = doc(db, "users", user.docId);
      const snap = await getDoc(ref);
      const data = snap.data();

      // ❌ DISABLE CHECK
      if (data.active === false) {
        alert("AKUN DINONAKTIFKAN!");
        logout();
      }

      // ❌ EXPIRED CHECK
      if (data.exp !== "lifetime") {
        const now = Date.now();
        const created = data.createdAt || now;
        const expTime = created + data.exp * 86400000;

        if (now > expTime) {
          alert("MASA AKTIF HABIS!");
          logout();
        }
      }

      // ❌ DEVICE CHECK
      if (data.device !== navigator.userAgent) {
        alert("LOGIN DI DEVICE LAIN!");
        logout();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [user]);

  // =====================
  // 🔍 SEARCH (API)
  // =====================
  const handleSearch = async () => {
    if (!query) return;

    setResult("LOADING...");

    try {
      const res = await fetch(
        `http://10.41.177.45:3000/api?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!data || data.length === 0) {
        setResult("DATA TIDAK DITEMUKAN");
        return;
      }

      const d = data[0];

      // ✅ NOPOL FULL (TIDAK TERPOTONG)
      const nopolFull = `${d.wilayah}${d.nopol}${d.seri}`;

      const hasil = `
DATABASE
════════════════
• PEMILIK
NAMA  : ${d.NamaPemilik}
NIK   : ${d.NoKTP}
HP    : ${d.NoHP}
EMAIL : ${d.Email}
KERJA : ${d.Pekerjaan}
════════════════
• ALAMAT
${d.alamat}
════════════════
• INFO
NOPOL   : ${nopolFull}
MEREK   : ${d.Merk}
TYPE    : ${d.Type}
TAHUN   : ${d.TahunPembuatan}
WARNA   : ${d.Warna}
CC      : ${d.IsiCylinder} CC
════════════════
• DOKUMEN
NOKA       : ${d.NoRangka}
NOSIN      : ${d.NoMesin}
NO. BPKB   : ${d.NoBPKB}
NO. STNK   : ${d.NoSTNK}
TGL DAFTAR : ${d.TanggalDaftar}
════════════════
`;

      setResult(hasil);
    } catch {
      setResult("ERROR AMBIL DATA API");
    }
  };

  // =====================
  // ➕ TAMBAH USER
  // =====================
  const handleAddUser = async () => {
    if (!newUser || !newPass || !days) return alert("Isi semua");

    await setDoc(doc(db, "users", newUser), {
      id: newUser,
      pass: newPass,
      role: "user",
      exp: Number(days),
      device: "",
      active: true,
      createdAt: Date.now()
    });

    alert("User ditambahkan!");
  };

  // =====================
  // 🚪 LOGOUT
  // =====================
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // =====================
  // 🔐 LOGIN UI
  // =====================
  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        <h2>LOGIN</h2>
        <input placeholder="User" onChange={e => setLoginId(e.target.value)} />
        <br />
        <input
          type="password"
          placeholder="Password"
          onChange={e => setLoginPass(e.target.value)}
        />
        <br />
        <button onClick={handleLogin}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <h3>
        {user.role === "admin" ? "ADMIN" : "USER"} | Masa aktif: {user.exp}
      </h3>

      <button onClick={logout}>Logout</button>

      {/* ADMIN */}
      {user.role === "admin" && (
        <>
          <h4>Tambah User</h4>
          <input placeholder="User" onChange={e => setNewUser(e.target.value)} />
          <input placeholder="Password" onChange={e => setNewPass(e.target.value)} />
          <input placeholder="Hari aktif" onChange={e => setDays(e.target.value)} />
          <button onClick={handleAddUser}>Tambah</button>
          <hr />
        </>
      )}

      {/* SEARCH */}
      <input
        placeholder="Cari Nopol / NIK / Nosin / Norangka"
        onChange={e => setQuery(e.target.value)}
      />
      <button onClick={handleSearch}>Cari</button>

      <pre>{result}</pre>

      {result && (
        <>
          <button onClick={() => navigator.clipboard.writeText(result)}>
            Copy
          </button>

          <button
            onClick={() =>
              window.open(
                `https://wa.me/?text=${encodeURIComponent(result)}`
              )
            }
          >
            Share WA
          </button>
        </>
      )}
    </div>
  );
}
