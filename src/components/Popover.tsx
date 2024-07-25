// src/components/Popover.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify'; // Importez toast et ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importez les styles de react-toastify

const Popover: React.FC<{ session: any; onClose: () => void }> = ({ session, onClose }) => {
  const [reason, setReason] = useState('');
  const [comments, setComments] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!reason || !comments) {
      toast.error('Tous les champs sont obligatoires.');
      return;
    }

    try {
      await axios.post('/api/cancellation_requests', {
        sessionId: session.id,
        reason,
        comments,
      });
      toast.success('Demande d\'annulation enregistrée avec succès.');
      onClose();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la demande.');
    }
  };

  return (
    <div className="popover fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 border border-gray-300 shadow-lg z-50">
      <h2 className="text-lg font-semibold mb-2">Demande d'annulation</h2>
      <form onSubmit={handleSubmit}>
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
          <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded">Envoyer</button>
          <button type="button" onClick={onClose} className="bg-gray-200 px-4 py-2 rounded">Annuler</button>
        </div>
      </form>
      {/* Assurez-vous que ToastContainer est importé et utilisé au niveau de votre application principale */}
    </div>
  );
};

export default Popover;
