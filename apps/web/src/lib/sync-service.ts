/**
 * Sync Service - Offline-First Architecture
 *
 * Manages bidirectional sync between localStorage and Supabase.
 * localStorage remains the primary data source; cloud sync is optional for Plus users.
 */

import { supabase, isDemoMode } from './supabase';
import { getUserStorageKey } from './profile-manager';

// ============================================
// TYPES
// ============================================

export type SyncOperation = 'create' | 'update' | 'delete';

export type EntityType =
  | 'task'
  | 'checkin'
  | 'note'
  | 'project'
  | 'focus_block'
  | 'routine'
  | 'brain_dump'
  | 'calendar_event';

export interface SyncQueueItem {
  id: string;
  entityType: EntityType;
  entityId: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  localTimestamp: string;
  syncedAt: string | null;
  errorMessage: string | null;
  retryCount: number;
}

export interface SyncResult {
  success: boolean;
  itemsSynced: number;
  conflicts: number;
  errors: string[];
}

export interface ConflictResolution {
  strategy: 'local_wins' | 'cloud_wins' | 'newest_wins' | 'manual';
  resolvedData?: Record<string, unknown>;
}

// ============================================
// SYNC QUEUE MANAGEMENT
// ============================================

const SYNC_QUEUE_KEY = 'sync_queue';
const LAST_SYNC_KEY = 'last_sync_timestamp';
const DEVICE_ID_KEY = 'device_id';

/**
 * Get or generate device ID
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Get sync queue from localStorage
 */
function getSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  const key = getUserStorageKey(SYNC_QUEUE_KEY);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Save sync queue to localStorage
 */
function saveSyncQueue(queue: SyncQueueItem[]): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(SYNC_QUEUE_KEY);
  localStorage.setItem(key, JSON.stringify(queue));
}

/**
 * Add item to sync queue (called when data changes locally)
 */
export function queueForSync(
  entityType: EntityType,
  entityId: string,
  operation: SyncOperation,
  data: Record<string, unknown>
): void {
  const queue = getSyncQueue();

  // Check if there's already a pending operation for this entity
  const existingIndex = queue.findIndex(
    (item) =>
      item.entityType === entityType &&
      item.entityId === entityId &&
      item.syncedAt === null
  );

  const newItem: SyncQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    entityType,
    entityId,
    operation,
    data,
    localTimestamp: new Date().toISOString(),
    syncedAt: null,
    errorMessage: null,
    retryCount: 0,
  };

  if (existingIndex >= 0) {
    // Merge operations: if existing is create and new is update, keep as create with new data
    const existing = queue[existingIndex];
    if (existing.operation === 'create' && operation === 'update') {
      queue[existingIndex] = { ...newItem, operation: 'create' };
    } else if (existing.operation === 'create' && operation === 'delete') {
      // Remove from queue entirely - item was never synced
      queue.splice(existingIndex, 1);
    } else {
      queue[existingIndex] = newItem;
    }
  } else {
    queue.push(newItem);
  }

  saveSyncQueue(queue);
}

/**
 * Get count of pending sync items
 */
export function getPendingSyncCount(): number {
  const queue = getSyncQueue();
  return queue.filter((item) => item.syncedAt === null).length;
}

/**
 * Get last sync timestamp
 */
export function getLastSyncTimestamp(): string | null {
  if (typeof window === 'undefined') return null;
  const key = getUserStorageKey(LAST_SYNC_KEY);
  return localStorage.getItem(key);
}

/**
 * Set last sync timestamp
 */
function setLastSyncTimestamp(timestamp: string): void {
  if (typeof window === 'undefined') return;
  const key = getUserStorageKey(LAST_SYNC_KEY);
  localStorage.setItem(key, timestamp);
}

// ============================================
// SYNC EXECUTION
// ============================================

/**
 * Push local changes to Supabase
 */
async function pushChanges(userId: string): Promise<{ success: number; failed: number; errors: string[] }> {
  if (isDemoMode || !supabase) {
    return { success: 0, failed: 0, errors: ['Sync not available in demo mode'] };
  }

  const queue = getSyncQueue();
  const pending = queue.filter((item) => item.syncedAt === null);

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const item of pending) {
    try {
      const tableName = getTableName(item.entityType);

      switch (item.operation) {
        case 'create':
          await supabase.from(tableName).insert({
            ...item.data,
            id: item.entityId,
            user_id: userId,
          });
          break;

        case 'update':
          await supabase
            .from(tableName)
            .update(item.data)
            .eq('id', item.entityId)
            .eq('user_id', userId);
          break;

        case 'delete':
          await supabase
            .from(tableName)
            .delete()
            .eq('id', item.entityId)
            .eq('user_id', userId);
          break;
      }

      // Mark as synced
      item.syncedAt = new Date().toISOString();
      item.errorMessage = null;
      success++;
    } catch (error) {
      item.retryCount++;
      item.errorMessage = error instanceof Error ? error.message : 'Unknown error';
      failed++;
      errors.push(`${item.entityType}/${item.entityId}: ${item.errorMessage}`);
    }
  }

  // Save updated queue
  saveSyncQueue(queue);

  // Also log sync to Supabase
  if (!isDemoMode && supabase) {
    await supabase.from('sync_log').insert({
      user_id: userId,
      device_id: getDeviceId(),
      sync_type: 'push',
      entities_synced: success,
      success: failed === 0,
      error_message: errors.length > 0 ? errors.join('; ') : null,
    });
  }

  return { success, failed, errors };
}

/**
 * Pull changes from Supabase to localStorage
 */
async function pullChanges(userId: string): Promise<{ success: number; conflicts: number; errors: string[] }> {
  if (isDemoMode || !supabase) {
    return { success: 0, conflicts: 0, errors: ['Sync not available in demo mode'] };
  }

  const lastSync = getLastSyncTimestamp();
  let success = 0;
  let conflicts = 0;
  const errors: string[] = [];

  const entityTypes: EntityType[] = ['task', 'checkin', 'note', 'project', 'focus_block'];

  for (const entityType of entityTypes) {
    try {
      const tableName = getTableName(entityType);
      let query = supabase.from(tableName).select('*').eq('user_id', userId);

      if (lastSync) {
        query = query.gt('updated_at', lastSync);
      }

      const { data, error } = await query;

      if (error) {
        errors.push(`${entityType}: ${error.message}`);
        continue;
      }

      if (data && data.length > 0) {
        const storageKey = getLocalStorageKey(entityType);
        const localData = getLocalData(storageKey);

        for (const cloudItem of data) {
          const localItem = localData.find((l: Record<string, unknown>) => l.id === cloudItem.id);

          if (localItem) {
            // Check for conflict
            const localUpdated = new Date(localItem.updatedAt || localItem.updated_at || 0);
            const cloudUpdated = new Date(cloudItem.updated_at);

            if (localUpdated > cloudUpdated) {
              // Local is newer - conflict
              conflicts++;
              // Default: newest wins, so keep local
              continue;
            }
          }

          // Update local data
          mergeCloudToLocal(storageKey, cloudItem);
          success++;
        }
      }
    } catch (error) {
      errors.push(`${entityType}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Update last sync timestamp
  setLastSyncTimestamp(new Date().toISOString());

  // Log sync
  if (!isDemoMode && supabase) {
    await supabase.from('sync_log').insert({
      user_id: userId,
      device_id: getDeviceId(),
      sync_type: 'pull',
      entities_synced: success,
      conflicts_resolved: conflicts,
      success: errors.length === 0,
      error_message: errors.length > 0 ? errors.join('; ') : null,
    });
  }

  return { success, conflicts, errors };
}

/**
 * Perform full sync (push then pull)
 */
export async function performFullSync(userId: string): Promise<SyncResult> {
  if (isDemoMode || !supabase) {
    return {
      success: false,
      itemsSynced: 0,
      conflicts: 0,
      errors: ['Sync not available - demo mode or no Supabase connection'],
    };
  }

  const pushResult = await pushChanges(userId);
  const pullResult = await pullChanges(userId);

  return {
    success: pushResult.failed === 0 && pullResult.errors.length === 0,
    itemsSynced: pushResult.success + pullResult.success,
    conflicts: pullResult.conflicts,
    errors: [...pushResult.errors, ...pullResult.errors],
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map entity type to Supabase table name
 */
function getTableName(entityType: EntityType): string {
  const mapping: Record<EntityType, string> = {
    task: 'tasks',
    checkin: 'check_ins',
    note: 'notes',
    project: 'projects',
    focus_block: 'focus_blocks',
    routine: 'routines',
    brain_dump: 'brain_dumps',
    calendar_event: 'calendar_events',
  };
  return mapping[entityType] || entityType;
}

/**
 * Map entity type to localStorage key
 */
function getLocalStorageKey(entityType: EntityType): string {
  const mapping: Record<EntityType, string> = {
    task: 'nciaflux_tasks',
    checkin: 'nciaflux_checkins',
    note: 'nciaflux_notes',
    project: 'nciaflux_projects',
    focus_block: 'nciaflux_focus_stats',
    routine: 'nciaflux_routines',
    brain_dump: 'nciaflux_brain_dump',
    calendar_event: 'nciaflux_calendar_events',
  };
  return mapping[entityType] || `nciaflux_${entityType}`;
}

/**
 * Get local data from localStorage
 */
function getLocalData(storageKey: string): Record<string, unknown>[] {
  if (typeof window === 'undefined') return [];
  const key = getUserStorageKey(storageKey);
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

/**
 * Merge cloud item to local storage
 */
function mergeCloudToLocal(storageKey: string, cloudItem: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;

  const key = getUserStorageKey(storageKey);
  const localData = getLocalData(storageKey);

  const existingIndex = localData.findIndex((item) => item.id === cloudItem.id);

  // Convert snake_case to camelCase for local storage
  const localFormat = convertToLocalFormat(cloudItem);

  if (existingIndex >= 0) {
    localData[existingIndex] = localFormat;
  } else {
    localData.push(localFormat);
  }

  localStorage.setItem(key, JSON.stringify(localData));
}

/**
 * Convert Supabase snake_case to localStorage camelCase
 */
function convertToLocalFormat(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }

  return result;
}

/**
 * Convert localStorage camelCase to Supabase snake_case
 */
export function convertToCloudFormat(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    result[snakeKey] = value;
  }

  return result;
}

// ============================================
// SYNC STATUS
// ============================================

export interface SyncStatus {
  isOnline: boolean;
  isSyncEnabled: boolean;
  pendingChanges: number;
  lastSyncAt: string | null;
  lastSyncStatus: 'success' | 'error' | 'never';
}

/**
 * Get current sync status
 */
export function getSyncStatus(): SyncStatus {
  const pendingCount = getPendingSyncCount();
  const lastSync = getLastSyncTimestamp();

  return {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncEnabled: !isDemoMode && supabase !== null,
    pendingChanges: pendingCount,
    lastSyncAt: lastSync,
    lastSyncStatus: lastSync ? 'success' : 'never',
  };
}

// ============================================
// AUTO-SYNC
// ============================================

let syncInterval: NodeJS.Timeout | null = null;

/**
 * Start auto-sync at specified interval
 */
export function startAutoSync(userId: string, intervalMs: number = 5 * 60 * 1000): void {
  if (syncInterval) {
    clearInterval(syncInterval);
  }

  // Initial sync
  performFullSync(userId).then((result) => {
    console.log('[Sync] Initial sync complete:', result);
  });

  // Periodic sync
  syncInterval = setInterval(() => {
    if (navigator.onLine) {
      performFullSync(userId).then((result) => {
        console.log('[Sync] Auto-sync complete:', result);
      });
    }
  }, intervalMs);

  // Sync on coming back online
  window.addEventListener('online', () => {
    performFullSync(userId).then((result) => {
      console.log('[Sync] Online sync complete:', result);
    });
  });
}

/**
 * Stop auto-sync
 */
export function stopAutoSync(): void {
  if (syncInterval) {
    clearInterval(syncInterval);
    syncInterval = null;
  }
}
