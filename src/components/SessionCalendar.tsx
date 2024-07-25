import React, { useState, useMemo } from 'react';
import { useList } from '@refinedev/core';
import { Calendar, momentLocalizer, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Popover from './Popover';

moment.locale('fr');
const localizer = momentLocalizer(moment);

interface FilterValues {
  period?: string;
  date?: string;
  status?: string;
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

interface Course {
  id: string;
  name: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  session_type: Session['session_type'];
}

const SessionCalendar: React.FC<{ courseId: string; filterValues: FilterValues }> = ({ courseId, filterValues }) => {
  const [statusFilter, setStatusFilter] = useState<Session['session_type'] | ''>('');
  const [selectedSession, setSelectedSession] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('week');

  const { data: sessionsData, isLoading: sessionsLoading, error: sessionsError } = useList<Session>({
    resource: 'sessions',
    filters: [
      { field: 'course_id', operator: 'eq', value: courseId },
      ...(filterValues.status ? [{ field: 'session_type', operator: 'eq' as const, value: filterValues.status }] : []),
      ...(filterValues.date ? [{ field: 'start_time', operator: 'eq' as const, value: filterValues.date }] : []),
    ],
  });

  const { data: coursesData, isLoading: coursesLoading, error: coursesError } = useList<Course>({
    resource: 'courses',
  });

  const events = useMemo(() => {
    if (!sessionsData?.data || !coursesData?.data) return [];

    const coursesMap = new Map(coursesData.data.map(course => [course.id, course.name]));

    return sessionsData.data
      .filter(session => !statusFilter || session.session_type === statusFilter)
      .map(session => ({
        id: session.id,
        title: `Session ${session.id} - ${coursesMap.get(session.course_id) || 'Inconnu'}`,
        start: new Date(session.start_time),
        end: new Date(session.end_time),
        session_type: session.session_type,
      }));
  }, [sessionsData, coursesData, statusFilter]);

  const eventStyleGetter = (event: CalendarEvent) => {
    const backgroundColor = {
      'in-person': 'green',
      'online': 'blue',
    }[event.session_type] || 'grey';

    return { style: { backgroundColor } };
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    if (event.session_type === 'in-person') {
      setSelectedSession(event);
    }
  };

  if (sessionsLoading || coursesLoading) return <div aria-live="polite">Chargement...</div>;
  if (sessionsError || coursesError) return <div aria-live="assertive">Erreur lors du chargement: {sessionsError?.message || coursesError?.message}</div>;

  return (
    <div>
      <div className="mb-4">
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
        <div aria-live="polite">Aucune session trouvée pour ce cours.</div>
      )}
      {selectedSession && (
        <Popover 
          session={selectedSession} 
          onClose={() => setSelectedSession(null)} 
        />
      )}
    </div>
  );
};

export default SessionCalendar;
