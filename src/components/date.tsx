import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface Props {
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
}

export default function MyDatePicker({ selectedDate, setSelectedDate }: Props) {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={setSelectedDate}
      dateFormat="dd/MM/yyyy"
      className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 
                 text-slate-100 placeholder-slate-400 focus:outline-none 
                 focus:ring-2 focus:ring-cyan-400"
      calendarClassName="!bg-slate-800 !border-slate-600 !rounded-xl"
      dayClassName={() =>
        "text-slate-100 hover:bg-cyan-500 hover:text-black rounded-md"
      }
      popperClassName="!z-50"
    />
  );
}
