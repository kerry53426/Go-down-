import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';
import { zhTW } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Registration } from '../types';
import { cn } from '../lib/utils';

interface CalendarProps {
  currentMonth: Date;
  selectedDate: Date;
  registrations: Registration[];
  onMonthChange: (date: Date) => void;
  onSelectDate: (date: Date) => void;
}

export function Calendar({ currentMonth, selectedDate, registrations, onMonthChange, onSelectDate }: CalendarProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "yyyy-MM-dd";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50/80 border-b border-gray-200">
        <h2 className="text-lg font-bold text-[#1A1A1A]">
          {format(currentMonth, 'yyyy年 MM月', { locale: zhTW })}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-700"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-white">
        {weekDays.map(day => (
          <div key={day} className="py-3 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 ">
        {days.map((day, dayIdx) => {
          const dayString = format(day, dateFormat);
          const dayRegs = registrations.filter(r => r.date === dayString);
          
          const totalUp = dayRegs.filter(r => r.isUp).length;
          const totalDown = dayRegs.filter(r => r.isDown).length;
          const totalStay = dayRegs.filter(r => r.isStay).length;

          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const today = isToday(day);

          return (
            <div
              key={day.toString()}
              onClick={() => onSelectDate(day)}
              className={cn(
                "min-h-[100px] border-b border-r border-gray-100 p-3 cursor-pointer transition-colors relative group hover:bg-gray-50",
                !isCurrentMonth && "bg-gray-50/50 text-gray-400 opacity-60",
                isSelected && "bg-blue-50/20 ring-2 ring-inset ring-[#2D5A27]",
                dayIdx % 7 === 6 && "border-r-0"
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full",
                  today && !isSelected && "bg-[#E8F5E9] text-[#2D5A27]",
                  isSelected && "bg-[#2D5A27] text-white",
                  !today && !isSelected && "text-gray-700"
                )}>
                  {format(day, 'd')}
                </span>
                
                {/* Total Indicators */}
                <div className="flex flex-col gap-1.5 items-end pt-1">
                  {totalUp > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E8F5E9] border border-[#C8E6C9] text-[#1B5E20]">上 {totalUp}</span>}
                  {totalDown > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFF3E0] border border-[#FFE0B2] text-[#E65100]">下 {totalDown}</span>}
                  {totalStay > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#E3F2FD] border border-[#BBDEFB] text-[#0D47A1]">宿 {totalStay}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
