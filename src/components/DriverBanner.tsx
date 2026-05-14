import { useState } from 'react';
import { format, addDays, startOfToday } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Registration } from '../types';
import { cn } from '../lib/utils';
import { TrendingUp, TrendingDown, Home, Phone, ChevronDown, ChevronUp } from 'lucide-react';

interface DriverBannerProps {
  registrations: Registration[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function DriverBanner({ registrations, selectedDate, onSelectDate }: DriverBannerProps) {
  const today = startOfToday();
  const next3Days = [today, addDays(today, 1), addDays(today, 2)];
  
  const [expandedDates, setExpandedDates] = useState<Record<string, boolean>>({});

  const toggleExpand = (e: React.MouseEvent, dateStr: string) => {
    e.stopPropagation();
    setExpandedDates(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  return (
    <div className="w-full">
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">近三日接駁概況 Next 3 Days</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {next3Days.map((date, idx) => {
          const dateString = format(date, 'yyyy-MM-dd');
          const dayRegs = registrations.filter(r => r.date === dateString);
          
          const totalUp = dayRegs.filter(r => r.isUp).length;
          const totalDown = dayRegs.filter(r => r.isDown).length;
          const totalStay = dayRegs.filter(r => r.isStay).length;

          const isSelected = format(selectedDate, 'yyyy-MM-dd') === dateString;
          const isExpanded = expandedDates[dateString] || false;

          let label = '';
          if (idx === 0) label = '今天 Today';
          else if (idx === 1) label = '明天 Tomorrow';
          else if (idx === 2) label = '後天 Day After';

          return (
            <div 
              key={dateString}
              onClick={() => onSelectDate(date)}
              className={cn(
                "cursor-pointer rounded-2xl border p-5 transition-all shadow-sm flex flex-col hover:border-gray-400 focus:outline-none",
                isSelected ? "bg-[#2D5A27]/5 border-[#2D5A27] ring-1 ring-[#2D5A27]" : "bg-white border-gray-200"
              )}
            >
              <div className="flex justify-between items-center mb-5">
                <span className={cn("text-xs font-bold px-3 py-1 rounded", isSelected ? "bg-[#2D5A27] text-white" : "bg-gray-100 text-gray-600")}>
                  {label}
                </span>
                <span className={cn("font-bold text-lg", isSelected ? "text-[#2D5A27]" : "text-gray-900")}>
                  {format(date, 'MM月dd日')} <span className="text-sm opacity-60 font-medium">({format(date, 'E', { locale: zhTW })})</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 relative">
                <div className="flex flex-col items-center bg-[#E8F5E9] border border-[#C8E6C9] py-2 px-3 rounded-xl flex-1">
                  <span className="text-[10px] font-bold text-[#2D5A27] mb-1 flex items-center gap-1"><TrendingUp size={12}/> 上山</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#1B5E20]">{totalUp}</span>
                </div>
                <div className="flex flex-col items-center bg-[#FFF3E0] border border-[#FFE0B2] py-2 px-3 rounded-xl flex-1">
                  <span className="text-[10px] font-bold text-[#E65100] mb-1 flex items-center gap-1"><TrendingDown size={12}/> 下山</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#E65100]">{totalDown}</span>
                </div>
                <div className="flex flex-col items-center bg-[#E3F2FD] border border-[#BBDEFB] py-2 px-3 rounded-xl flex-1">
                  <span className="text-[10px] font-bold text-[#0D47A1] mb-1 flex items-center gap-1"><Home size={12}/> 住宿</span>
                  <span className="text-xl sm:text-2xl font-bold text-[#0D47A1]">{totalStay}</span>
                </div>
              </div>

              {/* Expansion toggle */}
              {dayRegs.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-200 flex flex-col">
                  <button 
                    onClick={(e) => toggleExpand(e, dateString)}
                    className="flex justify-center items-center w-full py-1 text-[#2D5A27] hover:bg-[#2D5A27]/10 rounded transition-colors text-sm font-bold gap-1"
                  >
                    {isExpanded ? (
                      <><ChevronUp size={16} /> 縮小名單</>
                    ) : (
                      <><ChevronDown size={16} /> 展開名單 ({dayRegs.length}人)</>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="flex flex-col gap-2 mt-3">
                      {dayRegs.map(reg => (
                        <div key={reg.id} className="flex flex-col gap-1.5 text-sm bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-default" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-between font-bold text-gray-800 border-b border-gray-100 pb-1.5 mb-0.5">
                            <span className="text-base">{reg.name}</span>
                            <div className="flex gap-1">
                              {reg.isUp && <span className="text-[10px] bg-[#E8F5E9] text-[#1B5E20] px-1.5 py-0.5 border border-[#C8E6C9] rounded">上山</span>}
                              {reg.isDown && <span className="text-[10px] bg-[#FFF3E0] text-[#E65100] px-1.5 py-0.5 border border-[#FFE0B2] rounded">下山</span>}
                              {reg.isStay && <span className="text-[10px] bg-[#E3F2FD] text-[#0D47A1] px-1.5 py-0.5 border border-[#BBDEFB] rounded">住宿</span>}
                            </div>
                          </div>
                          {reg.phone && (
                            <div className="flex items-center text-[#2D5A27]">
                              <Phone size={14} className="mr-1.5" />
                              <span className="font-mono text-sm tracking-wider">{reg.phone}</span>
                              <a href={`tel:${reg.phone}`} className="ml-auto text-xs bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors text-emerald-800 font-bold flex items-center shadow-sm">
                                撥打
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
