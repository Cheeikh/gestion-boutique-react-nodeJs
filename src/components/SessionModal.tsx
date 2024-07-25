import React, { useState, useEffect } from 'react';
import { Session } from '../types'; // Assurez-vous d'avoir un fichier de types

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionData: Partial<Session>) => void;
  session: Partial<Session> | null;
  courseName: string;
}

const SessionModal: React.FC<SessionModalProps> = ({ isOpen, onClose, onSave, session, courseName }) => {
  const [formData, setFormData] = useState<Partial<Session>>({
    date: '',
    startTime: '',
    endTime: '',
    status: 'scheduled',
  });

  useEffect(() => {
    if (session) {
      setFormData(session);
    } else {
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        status: 'scheduled',
      });
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">{session?.id ? 'Modifier' : 'Créer'} une session pour {courseName}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date :</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Heure de début :</label>
            <input
              type="time"
              id="startTime"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">Heure de fin :</label>
            <input
              type="time"
              id="endTime"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Statut :</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
            >
              <option value="scheduled">Prévu</option>
              <option value="completed">Complété</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {session?.id ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionModal;