import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ListBulletIcon, RectangleGroupIcon } from '@heroicons/react/24/outline';

interface Absence {
  id: number;
  date: string;
  justification: string | null;
  session_id: number;
  is_justified: boolean;
}

const StudentAbsenceList: React.FC<{ studentId: number | null }> = ({ studentId }) => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const absencesPerPage = 10;

  useEffect(() => {
    if (studentId !== null) {
      fetchAbsences(studentId);
    }
  }, [studentId]);

  const fetchAbsences = async (studentId: number) => {
    try {
      const response = await axios.get(`/api/absences?student_id=${studentId}`);
      setAbsences(response.data);
    } catch (error) {
      console.error("Error fetching absences:", error);
    } finally {
      setLoading(false);
    }
  };

  const justifyAbsence = async (absenceId: number, sessionId: number, date: string) => {
    const justification = prompt("Veuillez entrer un motif de justification:");
    if (justification) {
      try {
        await axios.put(`/api/justify-absence/${absenceId}`, { justification });
        fetchAbsences(studentId!); // Refresh absences after justification
      } catch (error) {
        console.error("Error justifying absence:", error);
      }
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const indexOfLastAbsence = currentPage * absencesPerPage;
  const indexOfFirstAbsence = indexOfLastAbsence - absencesPerPage;
  const currentAbsences = absences.slice(indexOfFirstAbsence, indexOfLastAbsence);

  if (loading) {
    return <div>Chargement des absences...</div>;
  }

  if (absences.length === 0) {
    return <div>Aucune absence enregistrée.</div>;
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Absences</h2>
        <div className="flex space-x-2">
          <ListBulletIcon
            className={`h-6 w-6 cursor-pointer ${viewMode === 'list' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => setViewMode('list')}
          />
          <RectangleGroupIcon
            className={`h-6 w-6 cursor-pointer ${viewMode === 'card' ? 'text-blue-500' : 'text-gray-400'}`}
            onClick={() => setViewMode('card')}
          />
        </div>
      </div>

      {viewMode === 'list' ? (
        <ul className="divide-y divide-gray-200">
          {currentAbsences.map((absence) => (
            <li key={absence.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-lg font-medium text-gray-900">{format(new Date(absence.date), 'dd MMMM yyyy', { locale: fr })}</div>
                  <div className="text-sm text-gray-500">{absence.is_justified ? `Justifiée: ${absence.justification}` : 'Non justifiée'}</div>
                </div>
                {!absence.is_justified && (
                  <button
                    onClick={() => justifyAbsence(absence.id, absence.session_id, absence.date)}
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                  >
                    Justifier
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentAbsences.map((absence) => (
            <div key={absence.id} className="bg-white p-4 shadow-md rounded-lg">
              <div className="text-lg font-medium text-gray-900">{format(new Date(absence.date), 'dd MMMM yyyy', { locale: fr })}</div>
              <div className="text-sm text-gray-500">{absence.is_justified ? `Justifiée: ${absence.justification}` : 'Non justifiée'}</div>
              {!absence.is_justified && (
                <button
                  onClick={() => justifyAbsence(absence.id, absence.session_id, absence.date)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                >
                  Justifier
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-center space-x-1">
        {Array.from({ length: Math.ceil(absences.length / absencesPerPage) }, (_, index) => (
          <button
            key={index}
            onClick={() => paginate(index + 1)}
            className={`px-3 py-1 border rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StudentAbsenceList;
