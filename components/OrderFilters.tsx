import React from 'react';
import { Search, Filter } from 'lucide-react';
import { OrderStatus, Publisher, AcademicYear, Subject } from '../types';

interface OrderFiltersProps {
  searchTerm: string;
  filterStatus: OrderStatus | 'All';
  onSearchChange: (value: string) => void;
  onFilterChange: (value: OrderStatus | 'All') => void;
  publishers: Publisher[];
  years: AcademicYear[];
  subjects: Subject[];
  filterPublisher: string;
  onPublisherChange: (value: string) => void;
  filterYear: string;
  onYearChange: (value: string) => void;
  filterSubject: string;
  onSubjectChange: (value: string) => void;
  filterDate: string;
  onDateChange: (value: string) => void;
}

const statusTranslations: Record<OrderStatus, string> = {
  [OrderStatus.Pending]: 'قيد الانتظار',
  [OrderStatus.Delivered]: 'تم التسليم',
  [OrderStatus.Cancelled]: 'تم الإلغاء',
};

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  filterStatus,
  onSearchChange,
  onFilterChange,
  publishers,
  years,
  subjects,
  filterPublisher,
  onPublisherChange,
  filterYear,
  onYearChange,
  filterSubject,
  onSubjectChange,
  filterDate,
  onDateChange,
}) => (
  <div className="flex flex-col gap-4 w-full">
    <div className="relative w-full">
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <Search className="h-4 w-4 text-gray-400" />
      </div>
      <input
        type="text"
        className="pr-10 pl-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition"
        placeholder="بحث باسم العميل، الهاتف، المادة، أو الناشر..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center space-x-2 space-x-reverse">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
          value={filterStatus}
          onChange={(e) => onFilterChange(e.target.value as OrderStatus | 'All')}
        >
          <option value="All">كل الحالات</option>
          {Object.values(OrderStatus).map((s) => (
            <option key={s} value={s}>{statusTranslations[s]}</option>
          ))}
        </select>
      </div>

      <select
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
        value={filterPublisher}
        onChange={(e) => onPublisherChange(e.target.value)}
      >
        <option value="All">كل الناشرين</option>
        {publishers.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      <select
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
        value={filterYear}
        onChange={(e) => onYearChange(e.target.value)}
      >
        <option value="All">كل المراحل</option>
        {years.map((y) => (
          <option key={y.id} value={y.id}>{y.name}</option>
        ))}
      </select>

      <select
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
        value={filterSubject}
        onChange={(e) => onSubjectChange(e.target.value)}
      >
        <option value="All">كل الكتب</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>

      <input
        type="date"
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white cursor-pointer"
        value={filterDate}
        onChange={(e) => onDateChange(e.target.value)}
      />
    </div>
  </div>
);

export default OrderFilters;
