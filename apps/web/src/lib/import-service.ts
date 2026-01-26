/**
 * Import Service - Bulk Data Import
 *
 * Handles importing data from various formats:
 * - CSV: Tasks, notes, calendar events
 * - ICS: Calendar events
 * - JSON: Full export/import
 * - TXT: Brain dump
 */

import { getUserStorageKey } from './profile-manager';
import { queueForSync } from './sync-service';

// ============================================
// TYPES
// ============================================

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  preview?: ImportPreview;
}

export interface ImportPreview {
  items: ImportPreviewItem[];
  totalCount: number;
  validCount: number;
  errorCount: number;
}

export interface ImportPreviewItem {
  index: number;
  data: Record<string, unknown>;
  isValid: boolean;
  error?: string;
}

export type ImportFormat = 'csv' | 'ics' | 'json' | 'txt';
export type ImportTarget = 'tasks' | 'notes' | 'calendar' | 'brain_dump' | 'projects';

// ============================================
// CSV PARSER
// ============================================

/**
 * Parse CSV string to array of objects
 */
function parseCSV(content: string, hasHeader: boolean = true): Record<string, string>[] {
  const lines = content.trim().split('\n');
  if (lines.length === 0) return [];

  const separator = content.includes(';') ? ';' : ',';

  // Parse header or generate default
  let headers: string[];
  let dataStartIndex: number;

  if (hasHeader) {
    headers = parseCSVLine(lines[0], separator);
    dataStartIndex = 1;
  } else {
    const firstLine = parseCSVLine(lines[0], separator);
    headers = firstLine.map((_, i) => `column_${i + 1}`);
    dataStartIndex = 0;
  }

  // Parse data rows
  const result: Record<string, string>[] = [];

  for (let i = dataStartIndex; i < lines.length; i++) {
    const values = parseCSVLine(lines[i], separator);
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim() || '';
    });

    result.push(row);
  }

  return result;
}

/**
 * Parse a single CSV line handling quoted values
 */
function parseCSVLine(line: string, separator: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === separator && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

// ============================================
// ICS PARSER
// ============================================

interface ICSEvent {
  uid: string;
  summary: string;
  description?: string;
  dtstart: string;
  dtend?: string;
  location?: string;
  rrule?: string;
}

/**
 * Parse ICS calendar file
 */
function parseICS(content: string): ICSEvent[] {
  const events: ICSEvent[] = [];
  const lines = content.split(/\r?\n/);

  let currentEvent: Partial<ICSEvent> | null = null;
  let currentKey = '';
  let currentValue = '';

  for (const line of lines) {
    // Handle line continuation
    if (line.startsWith(' ') || line.startsWith('\t')) {
      currentValue += line.slice(1);
      continue;
    }

    // Process previous key-value if exists
    if (currentKey && currentEvent) {
      processICSProperty(currentEvent, currentKey, currentValue);
    }

    // Check for event boundaries
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
      currentKey = '';
      currentValue = '';
      continue;
    }

    if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.uid && currentEvent.summary && currentEvent.dtstart) {
        events.push(currentEvent as ICSEvent);
      }
      currentEvent = null;
      currentKey = '';
      currentValue = '';
      continue;
    }

    // Parse property
    if (currentEvent) {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        currentKey = line.slice(0, colonIndex).split(';')[0];
        currentValue = line.slice(colonIndex + 1);
      }
    }
  }

  return events;
}

/**
 * Process ICS property into event object
 */
function processICSProperty(event: Partial<ICSEvent>, key: string, value: string): void {
  switch (key) {
    case 'UID':
      event.uid = value;
      break;
    case 'SUMMARY':
      event.summary = value;
      break;
    case 'DESCRIPTION':
      event.description = value.replace(/\\n/g, '\n').replace(/\\,/g, ',');
      break;
    case 'DTSTART':
      event.dtstart = parseICSDate(value);
      break;
    case 'DTEND':
      event.dtend = parseICSDate(value);
      break;
    case 'LOCATION':
      event.location = value;
      break;
    case 'RRULE':
      event.rrule = value;
      break;
  }
}

/**
 * Parse ICS date format to ISO string
 */
function parseICSDate(value: string): string {
  // Handle formats: 20260126T100000Z, 20260126T100000, 20260126
  const cleaned = value.replace(/[^0-9TZ]/g, '');

  if (cleaned.length >= 8) {
    const year = cleaned.slice(0, 4);
    const month = cleaned.slice(4, 6);
    const day = cleaned.slice(6, 8);

    if (cleaned.length >= 15) {
      const hour = cleaned.slice(9, 11);
      const minute = cleaned.slice(11, 13);
      const second = cleaned.slice(13, 15);
      const isUTC = cleaned.endsWith('Z');

      return `${year}-${month}-${day}T${hour}:${minute}:${second}${isUTC ? 'Z' : ''}`;
    }

    return `${year}-${month}-${day}`;
  }

  return value;
}

// ============================================
// IMPORT HANDLERS
// ============================================

/**
 * Import tasks from CSV
 */
export async function importTasksFromCSV(
  content: string,
  options: { hasHeader?: boolean; dryRun?: boolean } = {}
): Promise<ImportResult> {
  const { hasHeader = true, dryRun = false } = options;

  try {
    const rows = parseCSV(content, hasHeader);
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    if (dryRun) {
      result.preview = {
        items: [],
        totalCount: rows.length,
        validCount: 0,
        errorCount: 0,
      };
    }

    const tasks: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Map CSV columns to task fields
      const task = mapCSVRowToTask(row, i);

      if (!task.title) {
        if (dryRun) {
          result.preview!.items.push({
            index: i,
            data: row,
            isValid: false,
            error: 'Titulo obrigatorio',
          });
          result.preview!.errorCount++;
        } else {
          result.errors.push(`Linha ${i + 1}: Titulo obrigatorio`);
          result.skipped++;
        }
        continue;
      }

      if (dryRun) {
        result.preview!.items.push({
          index: i,
          data: task,
          isValid: true,
        });
        result.preview!.validCount++;
      } else {
        tasks.push(task);
        result.imported++;
      }
    }

    if (!dryRun && tasks.length > 0) {
      saveImportedTasks(tasks);
    }

    return result;
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Erro ao processar CSV'],
    };
  }
}

/**
 * Map CSV row to task object
 */
function mapCSVRowToTask(row: Record<string, string>, index: number): Record<string, unknown> {
  // Try to find title in common column names
  const titleColumns = ['title', 'titulo', 'tarefa', 'task', 'name', 'nome', 'assunto', 'subject'];
  const title = findValueByColumns(row, titleColumns);

  // Find description
  const descColumns = ['description', 'descricao', 'desc', 'notes', 'notas', 'detalhes', 'details'];
  const description = findValueByColumns(row, descColumns);

  // Find priority
  const priorityColumns = ['priority', 'prioridade', 'prio', 'importance', 'importancia'];
  const priorityRaw = findValueByColumns(row, priorityColumns);
  const priority = mapPriority(priorityRaw);

  // Find due date
  const dateColumns = ['due', 'duedate', 'due_date', 'data', 'prazo', 'date', 'deadline', 'vencimento'];
  const dueDate = findValueByColumns(row, dateColumns);

  // Find category
  const categoryColumns = ['category', 'categoria', 'cat', 'type', 'tipo', 'label', 'tag'];
  const category = findValueByColumns(row, categoryColumns) || 'importado';

  return {
    id: `imported_${Date.now()}_${index}`,
    title,
    description,
    priority,
    status: 'pending',
    category,
    dueDate: dueDate ? normalizeDate(dueDate) : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Find value by trying multiple column names
 */
function findValueByColumns(row: Record<string, string>, columns: string[]): string {
  for (const col of columns) {
    // Try exact match
    if (row[col]) return row[col];

    // Try case-insensitive match
    const key = Object.keys(row).find((k) => k.toLowerCase() === col.toLowerCase());
    if (key && row[key]) return row[key];
  }
  return '';
}

/**
 * Map priority string to valid priority value
 */
function mapPriority(value: string): 'high' | 'medium' | 'low' {
  const normalized = value.toLowerCase().trim();

  if (['high', 'alta', 'urgent', 'urgente', '1', 'a'].includes(normalized)) return 'high';
  if (['low', 'baixa', '3', 'c'].includes(normalized)) return 'low';

  return 'medium';
}

/**
 * Normalize date string to ISO format
 */
function normalizeDate(value: string): string {
  // Try common formats
  const formats = [
    /^(\d{4})-(\d{2})-(\d{2})/, // YYYY-MM-DD
    /^(\d{2})\/(\d{2})\/(\d{4})/, // DD/MM/YYYY
    /^(\d{2})-(\d{2})-(\d{4})/, // DD-MM-YYYY
  ];

  for (const format of formats) {
    const match = value.match(format);
    if (match) {
      if (format === formats[0]) {
        return value;
      }
      return `${match[3]}-${match[2]}-${match[1]}`;
    }
  }

  // Try native Date parsing
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  return value;
}

/**
 * Save imported tasks to localStorage
 */
function saveImportedTasks(newTasks: Record<string, unknown>[]): void {
  const key = getUserStorageKey('nciaflux_tasks');
  const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
  const tasks = existing ? JSON.parse(existing) : [];

  const merged = [...tasks, ...newTasks];
  localStorage.setItem(key, JSON.stringify(merged));

  // Queue for sync
  for (const task of newTasks) {
    queueForSync('task', task.id as string, 'create', task);
  }
}

/**
 * Import calendar events from ICS
 */
export async function importCalendarFromICS(
  content: string,
  options: { dryRun?: boolean } = {}
): Promise<ImportResult> {
  const { dryRun = false } = options;

  try {
    const events = parseICS(content);
    const result: ImportResult = {
      success: true,
      imported: 0,
      skipped: 0,
      errors: [],
    };

    if (dryRun) {
      result.preview = {
        items: events.map((event, index) => ({
          index,
          data: event as unknown as Record<string, unknown>,
          isValid: true,
        })),
        totalCount: events.length,
        validCount: events.length,
        errorCount: 0,
      };
      return result;
    }

    const calendarEvents = events.map((event, index) => ({
      id: `imported_cal_${Date.now()}_${index}`,
      title: event.summary,
      description: event.description,
      start: event.dtstart,
      end: event.dtend,
      location: event.location,
      isRecurring: !!event.rrule,
      rrule: event.rrule,
      source: 'import',
      createdAt: new Date().toISOString(),
    }));

    // Save to localStorage
    const key = getUserStorageKey('nciaflux_calendar_events');
    const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const existingEvents = existing ? JSON.parse(existing) : [];

    localStorage.setItem(key, JSON.stringify([...existingEvents, ...calendarEvents]));

    result.imported = calendarEvents.length;
    return result;
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Erro ao processar ICS'],
    };
  }
}

/**
 * Import brain dump from text
 */
export async function importBrainDump(content: string): Promise<ImportResult> {
  try {
    // Split content into items (by newlines or bullets)
    const lines = content
      .split(/\n/)
      .map((line) => line.replace(/^[-*•]\s*/, '').trim())
      .filter((line) => line.length > 0);

    const items = lines.map((text, index) => ({
      id: `bd_${Date.now()}_${index}`,
      text,
      createdAt: new Date().toISOString(),
      processed: false,
    }));

    // Save to brain dump storage
    const key = getUserStorageKey('nciaflux_brain_dump');
    const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const existingItems = existing ? JSON.parse(existing) : { items: [], lastUpdated: null };

    existingItems.items = [...existingItems.items, ...items];
    existingItems.lastUpdated = new Date().toISOString();

    localStorage.setItem(key, JSON.stringify(existingItems));

    return {
      success: true,
      imported: items.length,
      skipped: 0,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Erro ao processar texto'],
    };
  }
}

/**
 * Import notes from text or JSON
 */
export async function importNotes(content: string, format: 'txt' | 'json'): Promise<ImportResult> {
  try {
    let notes: Record<string, unknown>[] = [];

    if (format === 'json') {
      const parsed = JSON.parse(content);
      notes = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      // Split by double newlines (paragraphs) as separate notes
      const paragraphs = content.split(/\n\n+/).filter((p) => p.trim());
      notes = paragraphs.map((text, index) => ({
        id: `note_${Date.now()}_${index}`,
        content: text.trim(),
        title: text.trim().split('\n')[0].slice(0, 50),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
    }

    // Save to notes storage
    const key = getUserStorageKey('nciaflux_notes');
    const existing = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    const existingNotes = existing ? JSON.parse(existing) : [];

    localStorage.setItem(key, JSON.stringify([...existingNotes, ...notes]));

    return {
      success: true,
      imported: notes.length,
      skipped: 0,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Erro ao processar arquivo'],
    };
  }
}

/**
 * Full JSON export of all user data
 */
export function exportAllData(): string {
  const keys = [
    'nciaflux_tasks',
    'nciaflux_notes',
    'nciaflux_projects',
    'nciaflux_brain_dump',
    'nciaflux_calendar_events',
    'nciaflux_checkins',
    'nciaflux_settings',
    'nciaflux_chronotype',
    'nciaflux_cognitive_profile',
    'nciaflux_discovery_answers',
  ];

  const exportData = {
    exportedAt: new Date().toISOString(),
    version: '1.4',
    data: {} as Record<string, unknown>,
  };

  for (const baseKey of keys) {
    const key = getUserStorageKey(baseKey);
    const data = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    if (data) {
      const simpleName = baseKey.replace('nciaflux_', '');
      exportData.data[simpleName] = JSON.parse(data);
    }
  }

  return JSON.stringify(exportData, null, 2);
}

/**
 * Full JSON import of user data
 */
export async function importAllData(content: string): Promise<ImportResult> {
  try {
    const imported = JSON.parse(content);

    if (!imported.data) {
      return {
        success: false,
        imported: 0,
        skipped: 0,
        errors: ['Formato de arquivo invalido'],
      };
    }

    let totalImported = 0;

    for (const [simpleName, data] of Object.entries(imported.data)) {
      const key = getUserStorageKey(`nciaflux_${simpleName}`);
      localStorage.setItem(key, JSON.stringify(data));

      if (Array.isArray(data)) {
        totalImported += data.length;
      } else {
        totalImported++;
      }
    }

    return {
      success: true,
      imported: totalImported,
      skipped: 0,
      errors: [],
    };
  } catch (error) {
    return {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [error instanceof Error ? error.message : 'Erro ao importar dados'],
    };
  }
}

/**
 * Detect import format from file content
 */
export function detectImportFormat(content: string, filename: string): ImportFormat {
  const ext = filename.split('.').pop()?.toLowerCase();

  if (ext === 'ics' || content.includes('BEGIN:VCALENDAR')) return 'ics';
  if (ext === 'json' || content.trim().startsWith('{') || content.trim().startsWith('[')) return 'json';
  if (ext === 'csv' || content.includes(',') || content.includes(';')) return 'csv';

  return 'txt';
}

/**
 * Detect import target from content
 */
export function detectImportTarget(content: string, format: ImportFormat): ImportTarget {
  if (format === 'ics') return 'calendar';

  if (format === 'json') {
    try {
      const data = JSON.parse(content);
      if (data.exportedAt && data.data) return 'projects'; // Full backup
      if (Array.isArray(data) && data[0]?.title && data[0]?.status) return 'tasks';
      if (Array.isArray(data) && data[0]?.content) return 'notes';
    } catch {
      // Not valid JSON
    }
  }

  if (format === 'csv') {
    const firstLine = content.split('\n')[0].toLowerCase();
    if (firstLine.includes('tarefa') || firstLine.includes('task') || firstLine.includes('titulo')) {
      return 'tasks';
    }
  }

  return 'brain_dump';
}
