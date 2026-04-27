import React, { useState, useEffect } from 'react';
import { User, Lock, Search, ShieldAlert, LogOut, UserPlus, Phone, ChevronLeft, Shield } from 'lucide-react';

export default function App() {
  const [view, setView] = useState('login');
  const [currentUser, setCurrentUser] = useState(null);
  const [usersDb, setUsersDb] = useState([]);

  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');

  const [newUserId, setNewUserId] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserPeriod, setNewUserPeriod] = useState('1');
  const [adminMsg, setAdminMsg] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedUsers = localStorage.getItem('eri_users');
    if (storedUsers) {
      setUsersDb(JSON.parse(storedUsers));
    } else {
      const initialDb = [{
        id: 'Admin',
        password: 'Naga2588',
        role: 'admin',
        masaAktif: 'UNLIMITED',
        deviceId: null
      }];
      setUsersDb(initialDb);
      localStorage.setItem('eri_users', JSON.stringify(initialDb));
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');

    const user = usersDb.find(u => u.id === loginId && u.password === loginPass);

    if (!user) {
      setLoginError('User ID atau Password salah!');
      return;
    }

    setCurrentUser(user);
    setView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('login');
  };

  const handleAddUser = (e) => {
    e.preventDefault();

    if (!newUserId || !newUserPass) {
      setAdminMsg('Isi semua data!');
      return;
    }

    if (usersDb.some(u => u.id === newUserId)) {
      setAdminMsg('User sudah ada!');
      return;
    }

    const newUser = {
      id: newUserId,
      password: newUserPass,
      role: 'user',
      masaAktif: '30 hari',
      deviceId: null
    };

    const updatedDb = [...usersDb, newUser];
    setUsersDb(updatedDb);
    localStorage.setItem('eri_users', JSON.stringify(updatedDb));

    setAdminMsg("Berhasil! User " + newUserId + " ditambahkan.");
    setNewUserId('');
    setNewUserPass('');
  };

  const handleSearch = () => {
    if (!searchQuery) return;

    setIsLoading(true);

    setTimeout(() => {
      setSearchResult("DATA DITEMUKAN UNTUK: " + searchQuery);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: 20, color: 'white', background: '#111', minHeight: '100vh' }}>

      {view === 'login' && (
        <div>
          <h2>LOGIN</h2>
          <input placeholder="User" onChange={(e) => setLoginId(e.target.value)} /><br/><br/>
          <input type="password" placeholder="Password" onChange={(e) => setLoginPass(e.target.value)} /><br/><br/>
          <button onClick={handleLogin}>Login</button>
          <p>{loginError}</p>
        </div>
      )}

      {view === 'dashboard' && (
        <div>
          <h2>DASHBOARD</h2>
          <input placeholder="Cari data..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          <button onClick={handleSearch}>Cari</button>

          {isLoading && <p>Loading...</p>}
          <pre>{searchResult}</pre>

          {currentUser && currentUser.role === 'admin' && (
            <button onClick={() => setView('admin')}>Admin Panel</button>
          )}

          <br/><br/>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}

      {view === 'admin' && (
        <div>
          <h2>ADMIN</h2>
          <input placeholder="User Baru" value={newUserId} onChange={(e) => setNewUserId(e.target.value)} /><br/>
          <input placeholder="Password" value={newUserPass} onChange={(e) => setNewUserPass(e.target.value)} /><br/>
          <button onClick={handleAddUser}>Tambah</button>
          <p>{adminMsg}</p>

          <button onClick={() => setView('dashboard')}>Kembali</button>
        </div>
      )}

    </div>
  );
}
