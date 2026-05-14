import { useState, useEffect } from 'react';
import { UserPlus, Info, Bus, Leaf, Navigation, KeyRound, UsersOutline, ShieldCheck, Search, LogOut } from 'lucide-react';
import { Registration } from './types';
import { Calendar } from './components/Calendar';
import { DailyView } from './components/DailyView';
import { RegistrationModal } from './components/RegistrationModal';
import { SearchModal } from './components/SearchModal';
import { DriverBanner } from './components/DriverBanner';

import { auth, db } from './firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './lib/firestoreUtils';

export default function App() {
  const [role, setRole] = useState<'employee' | 'driver' | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Driver Login States
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch from Firebase
  useEffect(() => {
    if (!user) {
      setRegistrations([]);
      return;
    }

    const q = query(collection(db, 'registrations'), where('orgId', '==', 'sheipa'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Registration[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Registration);
      });
      setRegistrations(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'registrations');
    });

    return () => unsubscribe();
  }, [user]);

  const handleDeleteRegistration = async (id: string) => {
    if (window.confirm("確定要刪除這筆登記嗎？")) {
      try {
        await deleteDoc(doc(db, 'registrations', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `registrations/${id}`);
      }
    }
  };

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setRole('employee');
    } catch (error) {
      console.error("登入失敗", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRole(null);
    setPin('');
  };

  const handleDriverLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') { // Mock PIN for driver
      if (!user) {
        const provider = new GoogleAuthProvider();
        try {
          await signInWithPopup(auth, provider);
          setRole('driver');
          setPinError(false);
        } catch (error) {
          console.error("登入失敗", error);
        }
      } else {
        setRole('driver');
        setPinError(false);
      }
    } else {
      setPinError(true);
    }
  };

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">載入中...</div>;
  }

  // ----------------------------------------------------
  // RENDER: Landing Page
  // ----------------------------------------------------
  if (role === null) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436] flex flex-col items-center justify-center font-sans p-6">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#2D5A27] rounded-xl flex items-center justify-center text-white font-bold text-3xl mb-4">
            雪
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] mb-2">雪霸農場交通住宿系統</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">請選擇您的身分以繼續操作</p>

          <button 
            onClick={user ? () => setRole('employee') : signIn}
            className="w-full flex items-center justify-center gap-3 bg-[#E8F5E9] hover:bg-[#C8E6C9] text-[#2D5A27] p-4 rounded-xl font-bold transition-colors mb-4 border border-[#ADD8E6]"
            style={{ borderColor: '#C8E6C9' }}
          >
            <UserPlus size={20} />
            {user ? '我是員工 (我要登記)' : '員工 Google 登入'}
          </button>

          <div className="w-full border-t border-gray-100 my-4 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-white px-3 text-xs text-gray-400 font-bold tracking-widest uppercase">OR</span>
          </div>

          <form onSubmit={handleDriverLogin} className="w-full bg-gray-50 p-4 rounded-xl border border-gray-200">
            <p className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 mb-3">
              <Bus size={16} /> 司機登入
            </p>
            <input 
              type="password"
              placeholder="司機密碼 (預設: 1234) + 登入"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setPinError(false);
              }}
              className="w-full px-4 py-2 mb-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#2D5A27] focus:border-[#2D5A27] outline-none transition-all text-center tracking-[0.5em] font-mono"
            />
            {pinError && <p className="text-xs text-red-500 mb-3 font-semibold text-center">密碼錯誤，請重試</p>}
            <button 
              type="submit"
              className="w-full bg-[#2D3436] hover:bg-[#1A1A1A] text-white p-3 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
            >
              <ShieldCheck size={18} />
              司機登入
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: Main Dashboard
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#2D3436] flex flex-col font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-200 shrink-0">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#2D5A27] rounded-lg flex items-center justify-center text-white font-bold text-xl">
              雪
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A]">雪霸農場交通住宿登記</h1>
              <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-0.5 hidden sm:block">Shei-Pa Farm • Staff Shuttle & Housing</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold bg-gray-100 px-3 py-1.5 rounded-full text-gray-600">
              {role === 'driver' ? '司機模式' : '員工模式'}
            </span>
            <span className="text-sm font-medium text-gray-600 hidden md:block">{user?.displayName || user?.email}</span>
            <button 
              onClick={handleLogout}
              className="text-sm flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium"
            >
              <LogOut size={16} /> <span className="hidden sm:inline">登出</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        
        {role === 'driver' && (
          <DriverBanner 
            registrations={registrations} 
            selectedDate={selectedDate} 
            onSelectDate={(d) => {
              setSelectedDate(d);
              setCurrentMonth(d);
            }} 
          />
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Calendar */}
          <div className="w-full lg:w-[60%] flex-shrink-0 flex flex-col gap-5">
          
          <Calendar 
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            registrations={registrations}
            onMonthChange={setCurrentMonth}
            onSelectDate={setSelectedDate}
          />

          <div className="mt-2 text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-5 px-2">
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#E8F5E9] border border-[#C8E6C9] block"></span>上山 UP</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#FFF3E0] border border-[#FFE0B2] block"></span>下山 DOWN</span>
            <span className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-[#E3F2FD] border border-[#BBDEFB] block"></span>住宿 STAY</span>
          </div>
        </div>

        {/* Right Column: Daily Details */}
        <div className="w-full lg:w-[40%] flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:h-[calc(100vh-8rem)]">
          <DailyView 
            date={selectedDate} 
            registrations={registrations} 
            onDelete={handleDeleteRegistration}
            isDriver={role === 'driver'}
          />
        </div>
        </div>
      </main>

      {/* Floating Action Button for Mobile / Fixed bottom for easy reach */}
      {(role === 'employee' || role === 'driver') && (
        <div className="fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-20 flex flex-col sm:flex-row gap-3">
          {role === 'employee' && (
            <button
              onClick={() => setIsSearchOpen(true)}
              className="bg-white hover:bg-gray-50 text-[#2D5A27] border border-gray-200 p-4 rounded-full sm:rounded-2xl shadow-lg flex items-center justify-center gap-2 group transition-colors"
              title="查詢我的登記"
            >
              <Search size={24} className="group-hover:scale-110 transition-transform" />
              <span className="font-bold text-lg hidden sm:block pr-2">查詢紀錄</span>
            </button>
          )}
          
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#2D5A27] hover:bg-[#23481F] text-white p-4 rounded-full sm:rounded-2xl shadow-lg shadow-[#2D5A27]/30 flex items-center justify-center gap-2 group transition-colors"
            title={role === 'driver' ? '代為登記' : '我要登記'}
          >
            <UserPlus size={24} className="group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg hidden sm:block pr-2">{role === 'driver' ? '代為登記' : '我要登記'}</span>
          </button>
        </div>
      )}

      <RegistrationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
        isDriver={role === 'driver'}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        registrations={registrations}
        onDelete={handleDeleteRegistration}
      />
    </div>
  );
}

