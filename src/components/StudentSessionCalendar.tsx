import React, { useState, useMemo } from 'react';
import { useList } from '@refinedev/core';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import PopoverStudent from './PopoverStudent';

moment.locale('fr');
const localizer = momentLocalizer(moment);

interface FilterValues {
  period?: string;
  module?: string;
}

interface Session {
  id: string;
  course_id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  hours: number;
  session_type: 'in-person' | 'online';
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  session_type: Session['session_type'];
}

const StudentSessionCalendar: React.FC<{ courseId: string; filterValues: FilterValues }> = ({ courseId, filterValues }) => {
  const [statusFilter, setStatusFilter] = useState<Session['session_type'] | ''>('');
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('week');

  const studentId = parseInt(localStorage.getItem('studentId') || '0');

  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useList<Session>({
    resource: 'sessions',
    filters: [
      { field: 'course_id', operator: 'eq', value: courseId },
      ...(filterValues.module ? [{ field: 'module', operator: 'eq' as const, value: filterValues.module }] : []),
    ],
  });

  const events = useMemo(() => {
    if (!sessionsData?.data) return [];

    return sessionsData.data
      .filter(session => !statusFilter || session.session_type === statusFilter)
      .map(session => ({
        id: session.id,
        title: `Session ${session.id} - ${session.session_type}`,
        start: new Date(session.start_time),
        end: new Date(session.end_time),
        session_type: session.session_type,
      }));
  }, [sessionsData, statusFilter]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = {
      'in-person': 'green',
      'online': 'blue',
    }[event.session_type] || 'grey';

    return { style: { backgroundColor } };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedSession(event);
  };

  if (sessionsLoading) return <div className="text-center mt-6">Chargement des sessions...</div>;
  if (sessionsError) return <div className="text-center mt-6 text-red-500">Erreur lors du chargement: {sessionsError.message}</div>;

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center">
        <label htmlFor="status-filter" className="mr-2">Filtrer par type :</label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as Session['session_type'] | '')}
          className="border border-gray-300 p-2 rounded"
          aria-label="Filtrer les sessions par type"
        >
          <option value="">Tous les types</option>
          <option value="in-person">En personne</option>
          <option value="online">En ligne</option>
        </select>
      </div>



      {events.length > 0 ? (
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          view={view}
          onView={setView}
          defaultDate={events[0].start}
          messages={{
            next: "Suivant",
            previous: "Précédent",
            today: "Aujourd'hui",
            month: "Mois",
            week: "Semaine",
            day: "Jour"
          }}
        />
      ) : (
        <div className="text-center mt-6">Aucune session trouvée pour ce cours.</div>
      )}

      {selectedSession && (
        <PopoverStudent 
          session={selectedSession} 
          studentId={studentId} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
};

export default StudentSessionCalendar;
