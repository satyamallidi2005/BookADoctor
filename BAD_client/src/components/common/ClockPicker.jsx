import React, { useState } from 'react';
import { Clock } from 'lucide-react';

/**
 * Beautiful, interactive custom Clock/Time Picker component.
 * Replaces native browser time inputs with a curated, premium-feel dial grid.
 * 
 * @param {string} value - Current time string in 24h format (HH:MM)
 * @param {function} onChange - Callback returning HH:MM format
 * @param {string} label - Input label
 */
const ClockPicker = ({ value = '', onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Parse current value
  let initialHour = '09';
  let initialMinute = '00';
  let initialAmPm = 'AM';

  if (value) {
    const [hStr, mStr] = value.split(':');
    let h = parseInt(hStr, 10);
    initialMinute = mStr || '00';
    if (h >= 12) {
      initialAmPm = 'PM';
      if (h > 12) h = h - 12;
    } else {
      initialAmPm = 'AM';
      if (h === 0) h = 12;
    }
    initialHour = h < 10 ? `0${h}` : `${h}`;
  }

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  const [ampm, setAmPm] = useState(initialAmPm);

  const hoursList = ['08', '09', '10', '11', '12', '01', '02', '03', '04', '05', '06', '07'];
  const minutesList = ['00', '15', '30', '45'];

  const triggerChange = (newHour, newMin, newAmPm) => {
    let h = parseInt(newHour, 10);
    if (newAmPm === 'PM') {
      if (h < 12) h += 12;
    } else {
      if (h === 12) h = 0;
    }
    const hStr = h < 10 ? `0${h}` : `${h}`;
    onChange(`${hStr}:${newMin}`);
  };

  const handleHourSelect = (h) => {
    setHour(h);
    triggerChange(h, minute, ampm);
  };

  const handleMinSelect = (m) => {
    setMinute(m);
    triggerChange(hour, m, ampm);
  };

  const handleAmPmSelect = (ap) => {
    setAmPm(ap);
    triggerChange(hour, minute, ap);
  };

  // Convert currently selected values back to 12h display string for display
  const displayTime = `${hour}:${minute} ${ampm}`;

  return (
    <div className="relative text-slate-700">
      {label && <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>}
      
      {/* Clickable Display Input */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white text-left font-semibold hover:border-blue-500 transition-colors focus:outline-none"
      >
        <span>{value ? displayTime : 'Select Time'}</span>
        <Clock className="w-4 h-4 text-slate-400" />
      </button>

      {/* Clock UI Dropdown */}
      {isOpen && (
        <>
          {/* Overlay to close picker */}
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          
          <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-150 rounded-xl shadow-lg p-4 z-40 animate-fadeIn space-y-3">
            <div className="text-center text-xs font-bold text-slate-800 border-b border-slate-100 pb-2 flex justify-between items-center">
              <span>Time Selector</span>
              <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md font-black">{displayTime}</span>
            </div>

            {/* Selector Grid */}
            <div className="grid grid-cols-3 gap-2">
              {/* Hours */}
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-400 uppercase text-center mb-1">Hour</span>
                <div className="grid grid-cols-2 gap-1 max-h-[120px] overflow-y-auto pr-0.5">
                  {hoursList.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => handleHourSelect(h)}
                      className={`py-1 text-[10px] font-bold rounded-md border text-center transition-all ${
                        hour === h 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-400 uppercase text-center mb-1">Minute</span>
                <div className="flex flex-col gap-1">
                  {minutesList.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => handleMinSelect(m)}
                      className={`py-1 text-[10px] font-bold rounded-md border text-center transition-all ${
                        minute === m 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      :{m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div className="space-y-1">
                <span className="block text-[8px] font-bold text-slate-400 uppercase text-center mb-1">Period</span>
                <div className="flex flex-col gap-1">
                  {['AM', 'PM'].map((ap) => (
                    <button
                      key={ap}
                      type="button"
                      onClick={() => handleAmPmSelect(ap)}
                      className={`py-1 text-[10px] font-bold rounded-md border text-center transition-all ${
                        ampm === ap 
                          ? 'bg-blue-600 text-white border-blue-600' 
                          : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
                      }`}
                    >
                      {ap}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Close / Apply button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 py-1.5 rounded-lg text-[10px] font-bold transition-all text-center"
            >
              Apply Time
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ClockPicker;
