'use client';

import { useState, useEffect } from 'react';
import { getStorageKey } from '@/lib/storage';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  color: string;
  description?: string;
  isAllDay: boolean;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}

interface Task {
  id: string;
  content: string;
  completed: boolean;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  dueDate?: string;
}

const COLORS = [
  { id: 'blue', class: 'bg-blue-500', light: 'bg-blue-100', text: 'text-blue-700' },
  { id: 'green', class: 'bg-green-500', light: 'bg-green-100', text: 'text-green-700' },
  { id: 'purple', class: 'bg-purple-500', light: 'bg-purple-100', text: 'text-purple-700' },
  { id: 'orange', class: 'bg-orange-500', light: 'bg-orange-100', text: 'text-orange-700' },
  { id: 'pink', class: 'bg-pink-500', light: 'bg-pink-100', text: 'text-pink-700' },
  { id: 'red', class: 'bg-red-500', light: 'bg-red-100', text: 'text-red-700' },
  { id: 'teal', class: 'bg-teal-500', light: 'bg-teal-100', text: 'text-teal-700' },
  { id: 'yellow', class: 'bg-yellow-500', light: 'bg-yellow-100', text: 'text-yellow-700' },
];

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const HOURS = Array.from({ length: 24 }, (_, i) => i);

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getMonthDays(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];

  // Add days from previous month to fill the first week
  const firstDayOfWeek = firstDay.getDay();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push(d);
  }

  // Add all days of current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  // Add days from next month to complete the last week
  const lastDayOfWeek = lastDay.getDay();
  for (let i = 1; i < 7 - lastDayOfWeek; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function getWeekDays(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day;
  const days: Date[] = [];

  for (let i = 0; i < 7; i++) {
    days.push(new Date(date.getFullYear(), date.getMonth(), diff + i));
  }

  return days;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState(formatDate(new Date()));
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventColor, setEventColor] = useState('blue');
  const [eventDescription, setEventDescription] = useState('');
  const [eventIsAllDay, setEventIsAllDay] = useState(false);
  const [eventRepeat, setEventRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>('none');

  // Load data
  useEffect(() => {
    function loadData() {
      const savedEvents = localStorage.getItem(getStorageKey('nciaflux_calendar_events'));
      if (savedEvents) {
        setEvents(JSON.parse(savedEvents));
      }

      const savedTasks = localStorage.getItem(getStorageKey('nciaflux_tasks'));
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    }

    loadData();

    // Listen for refresh events from chat
    const handleRefresh = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail.type === 'events' || detail.type === 'tasks' || detail.type === 'all') {
        loadData();
      }
    };
    window.addEventListener('nciaflux-data-refresh', handleRefresh);
    return () => window.removeEventListener('nciaflux-data-refresh', handleRefresh);
  }, []);

  // Save events
  function saveEvents(newEvents: CalendarEvent[]) {
    setEvents(newEvents);
    localStorage.setItem(getStorageKey('nciaflux_calendar_events'), JSON.stringify(newEvents));
  }

  function openNewEvent(date?: Date) {
    setEditingEvent(null);
    setEventTitle('');
    setEventDate(formatDate(date || selectedDate));
    setEventStartTime('09:00');
    setEventEndTime('10:00');
    setEventColor('blue');
    setEventDescription('');
    setEventIsAllDay(false);
    setEventRepeat('none');
    setShowEventModal(true);
  }

  function openEditEvent(event: CalendarEvent) {
    setEditingEvent(event);
    setEventTitle(event.title);
    setEventDate(event.date);
    setEventStartTime(event.startTime || '09:00');
    setEventEndTime(event.endTime || '10:00');
    setEventColor(event.color);
    setEventDescription(event.description || '');
    setEventIsAllDay(event.isAllDay);
    setEventRepeat(event.repeat || 'none');
    setShowEventModal(true);
  }

  function saveEvent() {
    if (!eventTitle.trim()) return;

    if (editingEvent) {
      saveEvents(events.map(e =>
        e.id === editingEvent.id
          ? {
              ...e,
              title: eventTitle.trim(),
              date: eventDate,
              startTime: eventIsAllDay ? undefined : eventStartTime,
              endTime: eventIsAllDay ? undefined : eventEndTime,
              color: eventColor,
              description: eventDescription,
              isAllDay: eventIsAllDay,
              repeat: eventRepeat,
            }
          : e
      ));
    } else {
      const newEvent: CalendarEvent = {
        id: `event_${Date.now()}`,
        title: eventTitle.trim(),
        date: eventDate,
        startTime: eventIsAllDay ? undefined : eventStartTime,
        endTime: eventIsAllDay ? undefined : eventEndTime,
        color: eventColor,
        description: eventDescription,
        isAllDay: eventIsAllDay,
        repeat: eventRepeat,
      };
      saveEvents([...events, newEvent]);
    }

    setShowEventModal(false);
  }

  function deleteEvent(eventId: string) {
    saveEvents(events.filter(e => e.id !== eventId));
    setShowEventModal(false);
  }

  function getEventsForDate(date: string): CalendarEvent[] {
    return events.filter(e => {
      if (e.date === date) return true;
      // Handle repeating events
      if (e.repeat === 'daily') return true;
      if (e.repeat === 'weekly') {
        const eventDate = new Date(e.date);
        const checkDate = new Date(date);
        return eventDate.getDay() === checkDate.getDay() && checkDate >= eventDate;
      }
      if (e.repeat === 'monthly') {
        const eventDate = new Date(e.date);
        const checkDate = new Date(date);
        return eventDate.getDate() === checkDate.getDate() && checkDate >= eventDate;
      }
      return false;
    });
  }

  function getTasksForDate(date: string): Task[] {
    return tasks.filter(t => t.dueDate === date && !t.completed);
  }

  const getColorConfig = (colorId: string) =>
    COLORS.find(c => c.id === colorId) || COLORS[0];

  // Navigation
  function navigateMonth(delta: number) {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + delta, 1));
  }

  function navigateWeek(delta: number) {
    setSelectedDate(new Date(selectedDate.getTime() + delta * 7 * 24 * 60 * 60 * 1000));
  }

  function navigateDay(delta: number) {
    setSelectedDate(new Date(selectedDate.getTime() + delta * 24 * 60 * 60 * 1000));
  }

  const today = formatDate(new Date());
  const isToday = (date: Date) => formatDate(date) === today;
  const isCurrentMonth = (date: Date) => date.getMonth() === selectedDate.getMonth();

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Agenda
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-neutral-background rounded-lg p-1">
            {(['month', 'week', 'day'] as const).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  view === v
                    ? 'bg-white text-primary-main shadow-sm'
                    : 'text-neutral-textSecondary hover:text-neutral-textPrimary'
                }`}
              >
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>

          <button
            onClick={() => openNewEvent()}
            className="px-4 py-2 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
          >
            + Evento
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => view === 'month' ? navigateMonth(-1) : view === 'week' ? navigateWeek(-1) : navigateDay(-1)}
          className="p-2 rounded-lg hover:bg-neutral-background"
        >
          ←
        </button>

        <button
          onClick={() => setSelectedDate(new Date())}
          className="px-4 py-2 rounded-lg bg-neutral-background text-neutral-textSecondary hover:bg-neutral-border"
        >
          Hoje
        </button>

        <button
          onClick={() => view === 'month' ? navigateMonth(1) : view === 'week' ? navigateWeek(1) : navigateDay(1)}
          className="p-2 rounded-lg hover:bg-neutral-background"
        >
          →
        </button>
      </div>

      {/* Month View */}
      {view === 'month' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b border-neutral-border">
            {WEEKDAYS.map(day => (
              <div key={day} className="p-3 text-center text-sm font-medium text-neutral-textSecondary">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {getMonthDays(selectedDate.getFullYear(), selectedDate.getMonth()).map((date, i) => {
              const dateStr = formatDate(date);
              const dayEvents = getEventsForDate(dateStr);
              const dayTasks = getTasksForDate(dateStr);

              return (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedDate(date);
                    if (view === 'month') setView('day');
                  }}
                  className={`min-h-[100px] p-2 border-b border-r border-neutral-border cursor-pointer hover:bg-neutral-background/50 ${
                    !isCurrentMonth(date) ? 'bg-neutral-background/30' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${
                    isToday(date)
                      ? 'bg-primary-main text-white'
                      : isCurrentMonth(date)
                        ? 'text-neutral-textPrimary'
                        : 'text-neutral-textMuted'
                  }`}>
                    {date.getDate()}
                  </div>

                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => {
                      const color = getColorConfig(event.color);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEvent(event);
                          }}
                          className={`text-xs px-2 py-0.5 rounded truncate ${color.light} ${color.text}`}
                        >
                          {event.startTime && !event.isAllDay && (
                            <span className="font-medium">{event.startTime} </span>
                          )}
                          {event.title}
                        </div>
                      );
                    })}

                    {dayTasks.slice(0, 1).map(task => (
                      <div
                        key={task.id}
                        className="text-xs px-2 py-0.5 rounded truncate bg-accent-warning/20 text-accent-warning"
                      >
                        📋 {task.content}
                      </div>
                    ))}

                    {(dayEvents.length > 2 || dayTasks.length > 1) && (
                      <div className="text-xs text-neutral-textMuted">
                        +{dayEvents.length - 2 + Math.max(0, dayTasks.length - 1)} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week View */}
      {view === 'week' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header with days */}
          <div className="grid grid-cols-8 border-b border-neutral-border">
            <div className="p-3 text-center text-sm font-medium text-neutral-textSecondary border-r border-neutral-border">

            </div>
            {getWeekDays(selectedDate).map((date, i) => (
              <div
                key={i}
                className={`p-3 text-center border-r border-neutral-border ${
                  isToday(date) ? 'bg-primary-main/10' : ''
                }`}
              >
                <div className="text-xs text-neutral-textMuted">{WEEKDAYS[date.getDay()]}</div>
                <div className={`text-lg font-medium ${
                  isToday(date) ? 'text-primary-main' : 'text-neutral-textPrimary'
                }`}>
                  {date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map(hour => (
              <div key={hour} className="grid grid-cols-8 border-b border-neutral-border">
                <div className="p-2 text-xs text-neutral-textMuted text-right pr-3 border-r border-neutral-border">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                {getWeekDays(selectedDate).map((date, i) => {
                  const dateStr = formatDate(date);
                  const hourEvents = getEventsForDate(dateStr).filter(e => {
                    if (e.isAllDay) return hour === 0;
                    const startHour = parseInt(e.startTime?.split(':')[0] || '0');
                    return startHour === hour;
                  });

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedDate(date);
                        openNewEvent(date);
                      }}
                      className="min-h-[50px] p-1 border-r border-neutral-border hover:bg-neutral-background/50 cursor-pointer"
                    >
                      {hourEvents.map(event => {
                        const color = getColorConfig(event.color);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditEvent(event);
                            }}
                            className={`text-xs px-1 py-0.5 rounded truncate ${color.class} text-white`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day View */}
      {view === 'day' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Day Header */}
          <div className="p-4 border-b border-neutral-border">
            <div className="text-center">
              <div className="text-sm text-neutral-textMuted">{WEEKDAYS[selectedDate.getDay()]}</div>
              <div className={`text-3xl font-bold ${isToday(selectedDate) ? 'text-primary-main' : 'text-neutral-textPrimary'}`}>
                {selectedDate.getDate()}
              </div>
              <div className="text-sm text-neutral-textSecondary">
                {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </div>
            </div>
          </div>

          {/* All-day events */}
          {(() => {
            const dateStr = formatDate(selectedDate);
            const allDayEvents = getEventsForDate(dateStr).filter(e => e.isAllDay);
            const dayTasks = getTasksForDate(dateStr);

            return (allDayEvents.length > 0 || dayTasks.length > 0) && (
              <div className="p-4 border-b border-neutral-border bg-neutral-background/30">
                <div className="text-xs text-neutral-textMuted mb-2">Dia inteiro</div>
                <div className="space-y-2">
                  {allDayEvents.map(event => {
                    const color = getColorConfig(event.color);
                    return (
                      <div
                        key={event.id}
                        onClick={() => openEditEvent(event)}
                        className={`px-3 py-2 rounded-lg cursor-pointer ${color.light} ${color.text}`}
                      >
                        <div className="font-medium">{event.title}</div>
                        {event.description && (
                          <div className="text-xs opacity-75">{event.description}</div>
                        )}
                      </div>
                    );
                  })}
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className="px-3 py-2 rounded-lg bg-accent-warning/20 text-accent-warning"
                    >
                      <div className="font-medium">📋 {task.content}</div>
                      <div className="text-xs opacity-75">Tarefa pendente</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Hourly events */}
          <div className="max-h-[500px] overflow-y-auto">
            {HOURS.map(hour => {
              const dateStr = formatDate(selectedDate);
              const hourEvents = getEventsForDate(dateStr).filter(e => {
                if (e.isAllDay) return false;
                const startHour = parseInt(e.startTime?.split(':')[0] || '0');
                return startHour === hour;
              });

              return (
                <div
                  key={hour}
                  onClick={() => {
                    setEventStartTime(`${hour.toString().padStart(2, '0')}:00`);
                    setEventEndTime(`${(hour + 1).toString().padStart(2, '0')}:00`);
                    openNewEvent(selectedDate);
                  }}
                  className="flex border-b border-neutral-border hover:bg-neutral-background/50 cursor-pointer"
                >
                  <div className="w-16 p-3 text-sm text-neutral-textMuted text-right border-r border-neutral-border">
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                  <div className="flex-1 min-h-[60px] p-2">
                    {hourEvents.map(event => {
                      const color = getColorConfig(event.color);
                      return (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditEvent(event);
                          }}
                          className={`px-3 py-2 rounded-lg mb-1 ${color.class} text-white`}
                        >
                          <div className="font-medium">{event.title}</div>
                          <div className="text-xs opacity-75">
                            {event.startTime} - {event.endTime}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              {editingEvent ? 'Editar Evento' : 'Novo Evento'}
            </h3>

            {/* Title */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Titulo</label>
              <input
                type="text"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Nome do evento"
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                autoFocus
              />
            </div>

            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Data</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              />
            </div>

            {/* All Day Toggle */}
            <div className="mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eventIsAllDay}
                  onChange={(e) => setEventIsAllDay(e.target.checked)}
                  className="w-5 h-5 rounded border-neutral-border text-primary-main focus:ring-primary-main"
                />
                <span className="text-neutral-textPrimary">Dia inteiro</span>
              </label>
            </div>

            {/* Time */}
            {!eventIsAllDay && (
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm text-neutral-textSecondary mb-2">Inicio</label>
                  <input
                    type="time"
                    value={eventStartTime}
                    onChange={(e) => setEventStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-textSecondary mb-2">Fim</label>
                  <input
                    type="time"
                    value={eventEndTime}
                    onChange={(e) => setEventEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                  />
                </div>
              </div>
            )}

            {/* Repeat */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Repetir</label>
              <select
                value={eventRepeat}
                onChange={(e) => setEventRepeat(e.target.value as typeof eventRepeat)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
              >
                <option value="none">Nao repetir</option>
                <option value="daily">Diariamente</option>
                <option value="weekly">Semanalmente</option>
                <option value="monthly">Mensalmente</option>
              </select>
            </div>

            {/* Color */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setEventColor(color.id)}
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      eventColor === color.id ? 'ring-2 ring-offset-2 ring-primary-main' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm text-neutral-textSecondary mb-2">Descricao (opcional)</label>
              <textarea
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Detalhes do evento"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
              >
                Cancelar
              </button>
              <button
                onClick={saveEvent}
                className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                {editingEvent ? 'Salvar' : 'Criar'}
              </button>
            </div>

            {/* Delete */}
            {editingEvent && (
              <button
                onClick={() => deleteEvent(editingEvent.id)}
                className="w-full mt-3 py-2 rounded-xl text-accent-error hover:bg-accent-error/10"
              >
                Excluir evento
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
