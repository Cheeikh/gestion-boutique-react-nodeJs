import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Importez toast
import 'react-toastify/dist/ReactToastify.css'; // Importez les styles de react-toastify

interface PopoverProps {
  session: {
    id: string;
    title: string;
    session_type: 'in-person' | 'online';
    start: Date;
    end: Date;
  };
  studentId: number; // Ajoutez studentId en tant que prop
  onClose: () => void;
}

const PopoverStudent: React.FC<PopoverProps> = ({ session, studentId, onClose }) => {
  const [isJustifying, setIsJustifying] = useState<boolean>(false);
  const [reason, setReason] = useState<string>('');
  const [comments, setComments] = useState<string>('');

  const handleMarkAttendance = async () => {
    try {
      const response = await axios.post('/api/attendance', {
        sessionId: session.id,
        studentId: studentId,
        status: 'present',
      });
  
      if (response.status === 200) {
        toast.success(`Présence marquée pour: ${session.title}`);
        onClose();
      } else {
        toast.error(response.data.error || 'Erreur lors du marquage de présence.');
      }
    } catch (error: any) {
      console.error('Erreur lors du marquage de présence:', error);
      toast.error(error.response?.data?.error || 'Erreur lors du marquage de présence.');
    }
  };
  
  const handleJustifyAbsence = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!reason || !comments) {
      toast.error('Tous les champs sont obligatoires.');
      return;
    }
  
    try {
      const response = await axios.post('/api/absences/justify', {
        student_id: studentId,
        session_id: session.id,
        date: new Date().toISOString().split('T')[0],
        is_justified: true,
        justification: `${reason} - ${comments}`,
      });
  
      if (response.status === 201) {
        toast.success('Justification d\'absence enregistrée avec succès.');
        onClose();
      } else {
        toast.error(response.data.error || 'Erreur lors de la justification de l\'absence.');
      }
    } catch (error: any) {
      console.error('Erreur lors de la justification de l\'absence:', error);
      toast.error(error.response?.data?.error || 'Erreur lors de la justification de l\'absence.');
    }
  };
  

 

  return (
    <div className="popover fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-gray-300 shadow-lg z-50">
      <h2 className="text-lg font-semibold mb-2">{session.title}</h2>
      <p><strong>Type:</strong> {session.session_type}</p>
      <p><strong>Début:</strong> {session.start.toLocaleString()}</p>
      <p><strong>Fin:</strong> {session.end.toLocaleString()}</p>
      
      {!isJustifying ? (
        <div className="flex gap-2">
          <button onClick={handleMarkAttendance} className="bg-purple-600 text-white px-4 py-2 rounded">
            Marquer Présence
          </button>
          <button onClick={() => setIsJustifying(true)} className="bg-gray-200 px-4 py-2 rounded">
            Justifier Absence
          </button>
          <button onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Fermer</button>
        </div>
      ) : (
        <form onSubmit={handleJustifyAbsence} className="mt-4">
          <div className="mb-4">
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Motif :</label>
            <input
              type="text"
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Commentaires :</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              required
              className="mt-1 block w-full border border-gray-300 rounded p-2"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Envoyer Justification</button>
            <button type="button" onClick={() => setIsJustifying(false)} className="bg-gray-200 px-4 py-2 rounded">
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PopoverStudent;
