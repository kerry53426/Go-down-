import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { X, Check } from 'lucide-react';
import { Registration } from '../types';
import { cn } from '../lib/utils';
import { auth, db } from '../firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestoreUtils';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate: Date;
  isDriver?: boolean;
}

export function RegistrationModal({ isOpen, onClose, defaultDate, isDriver }: RegistrationModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isUp, setIsUp] = useState(false);
  const [isDown, setIsDown] = useState(false);
  const [isStay, setIsStay] = useState(false);
  const [error, setError] = useState('');

  // Calculate the min date
  const minDate = new Date();
  if (!isDriver) {
    minDate.setDate(minDate.getDate() + 3);
  }
  const minDateStr = format(minDate, 'yyyy-MM-dd');

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      const profileStr = localStorage.getItem('sheipa-user-profile');
      let defaultName = '';
      let defaultPhone = '';
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          defaultName = profile.name || '';
          defaultPhone = profile.phone || '';
        } catch(e) {}
      }

      setName(defaultName);
      setPhone(defaultPhone);
      
      // If defaultDate is less than minDate, use minDate
      if (defaultDate < minDate) {
        setDateStr(minDateStr);
      } else {
        setDateStr(format(defaultDate, 'yyyy-MM-dd'));
      }
      
      setIsUp(false);
      setIsDown(false);
      setIsStay(false);
      setError('');
    }
  }, [isOpen, defaultDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('請輸入姓名');
      return;
    }
    if (!phone.trim()) {
      setError('請輸入聯絡電話');
      return;
    }
    
    // Check if the selected date is at least 3 days from now (if not driver)
    if (!isDriver && dateStr < minDateStr) {
      setError('只能登記三天後的日期');
      return;
    }

    if (!isUp && !isDown && !isStay) {
      setError('請至少選擇一項行程 (上山/下山/住宿)');
      return;
    }

    if (!auth.currentUser) {
      setError('You must be logged in');
      return;
    }

    try {
      const newRef = doc(collection(db, 'registrations'));
      
      const newReg: any = {
        orgId: 'sheipa',
        userId: auth.currentUser.uid,
        date: dateStr,
        name: name.trim(),
        phone: phone.trim(),
        isUp,
        isDown,
        isStay,
        createdAt: serverTimestamp(),
      };

      await setDoc(newRef, newReg);
      
      localStorage.setItem('sheipa-user-profile', JSON.stringify({ name: name.trim(), phone: phone.trim() }));

      onClose();
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'registrations');
      setError('儲存失敗，請重試');
    }
  };

  const CheckboxCard = ({ 
    checked, 
    onChange, 
    label, 
    desc,
    colorClass,
    activeBgClass,
    activeRingClass,
    checkBgClass
  }: { 
    checked: boolean, 
    onChange: (val: boolean) => void, 
    label: string,
    desc: string,
    colorClass: string,
    activeBgClass: string,
    activeRingClass: string,
    checkBgClass: string
  }) => (
    <div 
      onClick={() => onChange(!checked)}
      className={cn(
        "cursor-pointer border-2 rounded-xl p-4 transition-all flex items-start gap-4",
        checked ? cn("border-transparent", activeBgClass, activeRingClass) : "border-gray-200 hover:border-gray-300 bg-white"
      )}
    >
      <div className={cn(
        "mt-0.5 flex items-center justify-center w-6 h-6 rounded overflow-hidden border flex-shrink-0 transition-colors",
        checked ? cn("border-transparent", checkBgClass) : "border-gray-300"
      )}>
        {checked && <Check size={16} className="text-white" />}
      </div>
      <div>
        <p className={cn("font-bold", checked ? colorClass : "text-gray-900")}>{label}</p>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50/80">
          <h2 className="text-xl font-bold text-[#1A1A1A]">{isDriver ? '司機代為登記' : '新增行程登記'}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Date Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">日期 Date</label>
              <input
                type="date"
                required
                min={isDriver ? undefined : minDateStr}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2D5A27] focus:border-[#2D5A27] outline-none transition-all text-gray-900 font-medium"
              />
              {!isDriver && <p className="text-xs text-gray-500 mt-1">＊最快僅能登記三天後的日期</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">姓名 Name</label>
                <input
                  type="text"
                  required
                  placeholder="姓名..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2D5A27] focus:border-[#2D5A27] outline-none transition-all text-gray-900 font-medium"
                />
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">電話 Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="09xx-xxx-xxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2D5A27] focus:border-[#2D5A27] outline-none transition-all text-gray-900 font-medium"
                />
              </div>
            </div>

            {/* Actions Selection */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">行程項目 Options</label>
              <div className="space-y-3">
                <CheckboxCard 
                  checked={isUp} 
                  onChange={setIsUp} 
                  label="▲ 上山 (Up)" 
                  desc="從竹東搭乘接駁車返回農場"
                  colorClass="text-[#1B5E20]"
                  activeBgClass="bg-[#E8F5E9] border-[#C8E6C9]"
                  activeRingClass="ring-1 ring-[#2D5A27]"
                  checkBgClass="bg-[#2D5A27]"
                />

                <CheckboxCard 
                  checked={isDown} 
                  onChange={setIsDown} 
                  label="▼ 下山 (Down)" 
                  desc="搭乘接駁車離開農場往竹東"
                  colorClass="text-[#E65100]"
                  activeBgClass="bg-[#FFF3E0] border-[#FFE0B2]"
                  activeRingClass="ring-1 ring-[#E65100]"
                  checkBgClass="bg-[#E65100]"
                />
                
                <CheckboxCard 
                  checked={isStay} 
                  onChange={setIsStay} 
                  label="⌂ 竹東住宿 (Stay)" 
                  desc="當晚於竹東員工宿舍/飯店過夜"
                  colorClass="text-[#0D47A1]"
                  activeBgClass="bg-[#E3F2FD] border-[#BBDEFB]"
                  activeRingClass="ring-1 ring-[#0D47A1]"
                  checkBgClass="bg-[#0D47A1]"
                />
              </div>
            </div>

            {error && (
              <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-200">
                {error}
              </p>
            )}
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[#2D5A27] text-white font-bold rounded-xl hover:bg-[#23481F] transition-colors shadow"
            >
              送出登記
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
