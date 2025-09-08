import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function MyDatePicker() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date: Date | null) => setSelectedDate(date)}
      dateFormat="dd/MM/yyyy"
      className="w-full px-3 py-2 rounded-lg border border-slate-600 bg-slate-800 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400"
      calendarClassName="!bg-slate-800 !border-slate-600 !rounded-xl"
      dayClassName={() =>
        "text-slate-100 hover:bg-cyan-500 hover:text-black rounded-md"
      }
      popperClassName="!z-50"
    />
  );
}
