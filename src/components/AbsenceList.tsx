// src/components/AbsenceList.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Absence {
  id: number;
  date: string;
  reason: string;
  session_id: string; // Lien avec la session de cours
  status: 'pending' | 'approved' | 'rejected'; // État de la justification
}

const AbsenceList: React.FC<{ studentId: number | null }> = ({ studentId }) => {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      fetchAbsences(studentId);
    }
  }, [studentId]);

  const fetchAbsences = async (studentId: number) => {
    try {
      const response = await axios.get(`/api/absences?student_id=${studentId}`);
      setAbsences(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching absences:", error);
      setLoading(false);
    }
  };

  const justifyAbsence = async (absenceId: number) => {
    const reason = prompt("Veuillez entrer un motif de justification:");
    if (reason) {
      try {
        await axios.post('/api/absences/justify', { absenceId, justification: reason });
        alert('Absence justifiée avec succès!');
        fetchAbsences(studentId); // Rafraîchir la liste des absences
      } catch (error) {
        console.error("Error justifying absence:", error);
        alert('Erreur lors de la justification de l\'absence.');
      }
    }
  };

  if (loading) return <div>Chargement des absences...</div>;

  return (
    <div>
      <h2>Mes Absences</h2>
      <ul>
        {absences.length > 0 ? (
          absences.map((absence) => (
            <li key={absence.id}>
              {absence.date} - {absence.reason} - {absence.status}
              {absence.status === 'pending' && (
                <button onClick={() => justifyAbsence(absence.id)}>Justifier</button>
              )}
            </li>
          ))
        ) : (
          <p>Aucune absence trouvée.</p>
        )}
      </ul>
    </div>
  );
};

export default AbsenceList;