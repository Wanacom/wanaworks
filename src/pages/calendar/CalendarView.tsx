import React from 'react';
import { Calendar } from 'lucide-react';

const CalendarView: React.FC = () => {
  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Calendar className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-semibold text-gray-900">Calendar</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Calendar view implementation will go here.</p>
      </div>
    </div>
  );
};

export default CalendarView;