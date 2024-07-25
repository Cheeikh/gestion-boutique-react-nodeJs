import React from 'react';
import { useForm } from 'react-hook-form';

interface FilterValues {
  period?: string;
  date?: string;
  status?: string;
  module?: string;
}

interface StudentFiltersProps {
  onFilter: (values: FilterValues) => void;
  modules: string[];
}

const StudentFilters: React.FC<StudentFiltersProps> = ({ onFilter, modules }) => {
  const { register, handleSubmit } = useForm<FilterValues>();

  return (
    <form onSubmit={handleSubmit(onFilter)} className="mb-4 flex space-x-4">
      <select {...register('period')} className="px-4 py-2 border rounded">
        <option value="">Période</option>
        <option value="day">Jour</option>
        <option value="week">Semaine</option>
      </select>

      <input type="date" {...register('date')} className="px-4 py-2 border rounded" />

      <select {...register('module')} className="px-4 py-2 border rounded">
        <option value="">Module</option>
        {modules.map((module, index) => (
          <option key={index} value={module}>
            {module}
          </option>
        ))}
      </select>

      <select {...register('status')} className="px-4 py-2 border rounded">
        <option value="">Statut</option>
        <option value="completed">Terminées</option>
        <option value="cancelled">Annulées</option>
        <option value="not_yet">Non effectuées</option>
      </select>

      <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded">Filtrer</button>
    </form>
  );
};

export default StudentFilters;
