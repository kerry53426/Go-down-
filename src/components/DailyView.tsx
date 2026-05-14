import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { Registration } from '../types';
import { Trash2, TrendingUp, TrendingDown, Home, Users, Phone } from 'lucide-react';
import { cn } from '../lib/utils';
import { auth } from '../firebase';

interface DailyViewProps {
  date: Date;
  registrations: Registration[];
  onDelete: (id: string) => void;
  isDriver?: boolean;
}

export function DailyView({ date, registrations, onDelete, isDriver }: DailyViewProps) {
  const dateString = format(date, 'yyyy-MM-dd');
  const dayRegs = registrations.filter(r => r.date === dateString);

  const upRegs = dayRegs.filter(r => r.isUp);
  const downRegs = dayRegs.filter(r => r.isDown);
  const stayRegs = dayRegs.filter(r => r.isStay);

  const ListSection = ({ 
    title, 
    items, 
    icon: Icon, 
    colorClass,
    bgClass,
    borderClass
  }: { 
    title: string, 
    items: Registration[], 
    icon: any,
    colorClass: string,
    bgClass: string,
    borderClass: string
  }) => (
    <div className="mb-6">
      <div className={cn("flex flex-col p-5 rounded-2xl border mb-3", bgClass, borderClass)}>
        <div className="flex items-center justify-between mb-3">
          <p className={cn("text-xs font-bold uppercase tracking-wider flex items-center gap-1.5", colorClass)}>
            <Icon size={14} />
            {title}
          </p>
          <p className={cn("text-2xl font-bold font-sans", colorClass)}>
            {items.length.toString().padStart(2, '0')} <span className="text-sm font-normal opacity-70">人</span>
          </p>
        </div>
        
        {items.length === 0 ? (
          <div className="px-1 py-1 text-gray-400 text-sm font-medium italic">
            目前無人登記
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {items.map(reg => (
              <div key={reg.id} className={cn("group flex flex-col gap-2 px-4 py-3 bg-white border rounded shrink-0 shadow-sm transition-colors hover:border-gray-400", borderClass)}>
                <div className="flex items-center justify-between font-bold">
                  <span className="text-gray-800 text-base">{reg.name}</span>
                  {!isDriver && auth.currentUser?.uid === reg.userId && (
                    <button
                      onClick={() => onDelete(reg.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors bg-gray-50 hover:bg-red-50 p-1.5 rounded-full"
                      title="刪除登記"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                {isDriver && reg.phone && (
                  <div className="flex items-center gap-1.5 text-[#2D5A27]">
                    <Phone size={14} />
                    <span className="text-sm font-mono tracking-wider">{reg.phone}</span>
                    <a href={`tel:${reg.phone}`} className="ml-2 text-xs bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded transition-colors text-emerald-800">
                      撥打
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col items-start shrink-0">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
          今日日期 Today
        </p>
        <p className="text-2xl font-bold text-[#1A1A1A]">
          {format(date, 'MM月dd日')} <span className="text-gray-400 text-lg font-medium font-serif italic">({format(date, 'EEEEEE', { locale: zhTW })})</span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 pb-20">
        <ListSection 
          title="上山名單 (UP)" 
          items={upRegs} 
          icon={TrendingUp}
          colorClass="text-[#2D5A27]"
          bgClass="bg-[#E8F5E9]"
          borderClass="border-[#C8E6C9]"
        />

        <ListSection 
          title="下山名單 (DOWN)" 
          items={downRegs} 
          icon={TrendingDown}
          colorClass="text-[#E65100]"
          bgClass="bg-[#FFF3E0]"
          borderClass="border-[#FFE0B2]"
        />

        <ListSection 
          title="竹東住宿 (STAY)" 
          items={stayRegs} 
          icon={Home}
          colorClass="text-[#0D47A1]"
          bgClass="bg-[#E3F2FD]"
          borderClass="border-[#BBDEFB]"
        />
      </div>
    </div>
  );
}
