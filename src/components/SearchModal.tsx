import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { X, Search, Trash2 } from 'lucide-react';
import { Registration } from '../types';
import { cn } from '../lib/utils';
import { auth } from '../firebase';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrations: Registration[];
  onDelete: (id: string) => void;
}

export function SearchModal({ isOpen, onClose, registrations, onDelete }: SearchModalProps) {
  const [searchName, setSearchName] = useState('');
  
  useEffect(() => {
    if (isOpen) {
      const profileStr = localStorage.getItem('sheipa-user-profile');
      if (profileStr) {
        try {
          const profile = JSON.parse(profileStr);
          if (profile.name) setSearchName(profile.name);
        } catch(e) {}
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter and sort by date descending
  const filteredRegs = registrations
    .filter(r => r.name.toLowerCase().includes(searchName.toLowerCase().trim()) && searchName.trim() !== '')
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1A1A1A]/40 backdrop-blur-sm">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-gray-200 flex flex-col max-h-[85vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50/80 shrink-0">
          <h2 className="text-xl font-bold text-[#1A1A1A]">查詢我的登記</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 border-b border-gray-100 shrink-0">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">依姓名查詢 Search By Name</label>
          <div className="relative">
            <input
              type="text"
              placeholder="請輸入姓名..."
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2D5A27] focus:border-[#2D5A27] outline-none transition-all text-gray-900 font-medium"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-gray-50/50">
          {!searchName.trim() ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm">
              請輸入姓名以查看登記紀綠
            </div>
          ) : filteredRegs.length === 0 ? (
            <div className="text-center py-10 text-gray-400 font-medium text-sm">
              找不到您的登記紀錄
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRegs.map(reg => {
                const dateObj = parseISO(reg.date);
                return (
                  <div key={reg.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold text-gray-900 mb-2">
                        {format(dateObj, 'yyyy年MM月dd日')} <span className="text-gray-500 font-medium text-sm">({format(dateObj, 'EEEEEE', { locale: zhTW })})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {reg.isUp && <span className="text-xs font-bold px-2 py-1 rounded bg-[#E8F5E9] border border-[#C8E6C9] text-[#1B5E20]">上山</span>}
                        {reg.isDown && <span className="text-xs font-bold px-2 py-1 rounded bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100]">下山</span>}
                        {reg.isStay && <span className="text-xs font-bold px-2 py-1 rounded bg-[#E3F2FD] border border-[#BBDEFB] text-[#0D47A1]">住宿</span>}
                      </div>
                    </div>
                    
                    {auth.currentUser?.uid === reg.userId && (
                      <button
                        onClick={() => onDelete(reg.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded bg-gray-50 transition-colors border border-transparent hover:border-red-100"
                        title="刪除"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
