/**
 * Adaptive Profile Service
 *
 * Tracks user behavior patterns and suggests adjustments to their cognitive profile.
 * Implements the "Redescoberta Pontual" feature - automatic refinement of user profile
 * based on actual usage patterns.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CognitiveProfile,
  EnergyLevel,
  EnergyPattern,
  ExecutionStyle,
  FocusTechnique,
} from '@nciaflux/shared';

const BEHAVIOR_STORAGE_KEY = '@nciaflux/behavior_data';
const SUGGESTIONS_STORAGE_KEY = '@nciaflux/profile_suggestions';

// Types for behavior tracking
interface TaskCompletion {
  taskId: string;
  completedAt: Date;
  hourOfDay: number;
  dayOfWeek: number;
  estimatedMinutes: number;
  actualMinutes?: number;
  energyLevel?: number;
  focusTechnique?: FocusTechnique;
}

interface FocusSession {
  technique: FocusTechnique;
  startedAt: Date;
  endedAt?: Date;
  plannedMinutes: number;
  actualMinutes: number;
  completed: boolean;
  interruptions: number;
  hourOfDay: number;
}

interface CheckInData {
  timestamp: Date;
  hourOfDay: number;
  dayOfWeek: number;
  energyLevel: number;
  mood: string;
}

interface BehaviorData {
  taskCompletions: TaskCompletion[];
  focusSessions: FocusSession[];
  checkIns: CheckInData[];
  appOpens: { timestamp: Date; hourOfDay: number }[];
  lastUpdated: Date;
}

interface ProfileSuggestion {
  id: string;
  type: 'energy_pattern' | 'focus_duration' | 'best_focus_time' | 'execution_style' | 'technique';
  title: string;
  description: string;
  currentValue: string;
  suggestedValue: string;
  confidence: number; // 0-100
  dataPoints: number;
  createdAt: Date;
  dismissed: boolean;
  applied: boolean;
}

const INITIAL_BEHAVIOR_DATA: BehaviorData = {
  taskCompletions: [],
  focusSessions: [],
  checkIns: [],
  appOpens: [],
  lastUpdated: new Date(),
};

const MAX_DATA_POINTS = 100; // Keep last 100 entries of each type

class AdaptiveProfileService {
  private behaviorData: BehaviorData = INITIAL_BEHAVIOR_DATA;
  private suggestions: ProfileSuggestion[] = [];

  async initialize(): Promise<void> {
    await this.loadBehaviorData();
    await this.loadSuggestions();
  }

  private async loadBehaviorData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(BEHAVIOR_STORAGE_KEY);
      if (stored) {
        this.behaviorData = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load behavior data:', error);
    }
  }

  private async saveBehaviorData(): Promise<void> {
    try {
      this.behaviorData.lastUpdated = new Date();
      await AsyncStorage.setItem(BEHAVIOR_STORAGE_KEY, JSON.stringify(this.behaviorData));
    } catch (error) {
      console.error('Failed to save behavior data:', error);
    }
  }

  private async loadSuggestions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(SUGGESTIONS_STORAGE_KEY);
      if (stored) {
        this.suggestions = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load suggestions:', error);
    }
  }

  private async saveSuggestions(): Promise<void> {
    try {
      await AsyncStorage.setItem(SUGGESTIONS_STORAGE_KEY, JSON.stringify(this.suggestions));
    } catch (error) {
      console.error('Failed to save suggestions:', error);
    }
  }

  // Track task completion
  async trackTaskCompletion(data: {
    taskId: string;
    estimatedMinutes: number;
    actualMinutes?: number;
    energyLevel?: number;
    focusTechnique?: FocusTechnique;
  }): Promise<void> {
    const now = new Date();
    const completion: TaskCompletion = {
      ...data,
      completedAt: now,
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
    };

    this.behaviorData.taskCompletions.unshift(completion);
    if (this.behaviorData.taskCompletions.length > MAX_DATA_POINTS) {
      this.behaviorData.taskCompletions = this.behaviorData.taskCompletions.slice(0, MAX_DATA_POINTS);
    }

    await this.saveBehaviorData();
    await this.analyzeAndSuggest();
  }

  // Track focus session
  async trackFocusSession(data: {
    technique: FocusTechnique;
    plannedMinutes: number;
    actualMinutes: number;
    completed: boolean;
    interruptions: number;
  }): Promise<void> {
    const now = new Date();
    const session: FocusSession = {
      ...data,
      startedAt: new Date(now.getTime() - data.actualMinutes * 60000),
      endedAt: now,
      hourOfDay: now.getHours(),
    };

    this.behaviorData.focusSessions.unshift(session);
    if (this.behaviorData.focusSessions.length > MAX_DATA_POINTS) {
      this.behaviorData.focusSessions = this.behaviorData.focusSessions.slice(0, MAX_DATA_POINTS);
    }

    await this.saveBehaviorData();
    await this.analyzeAndSuggest();
  }

  // Track check-in
  async trackCheckIn(data: { energyLevel: number; mood: string }): Promise<void> {
    const now = new Date();
    const checkIn: CheckInData = {
      ...data,
      timestamp: now,
      hourOfDay: now.getHours(),
      dayOfWeek: now.getDay(),
    };

    this.behaviorData.checkIns.unshift(checkIn);
    if (this.behaviorData.checkIns.length > MAX_DATA_POINTS) {
      this.behaviorData.checkIns = this.behaviorData.checkIns.slice(0, MAX_DATA_POINTS);
    }

    await this.saveBehaviorData();
  }

  // Track app open
  async trackAppOpen(): Promise<void> {
    const now = new Date();
    this.behaviorData.appOpens.unshift({
      timestamp: now,
      hourOfDay: now.getHours(),
    });

    if (this.behaviorData.appOpens.length > MAX_DATA_POINTS) {
      this.behaviorData.appOpens = this.behaviorData.appOpens.slice(0, MAX_DATA_POINTS);
    }

    await this.saveBehaviorData();
  }

  // Analyze data and generate suggestions
  private async analyzeAndSuggest(): Promise<void> {
    const newSuggestions: ProfileSuggestion[] = [];

    // Analyze best focus time
    const focusTimeSuggestion = this.analyzeBestFocusTime();
    if (focusTimeSuggestion) {
      newSuggestions.push(focusTimeSuggestion);
    }

    // Analyze optimal focus duration
    const focusDurationSuggestion = this.analyzeOptimalFocusDuration();
    if (focusDurationSuggestion) {
      newSuggestions.push(focusDurationSuggestion);
    }

    // Analyze preferred technique
    const techniqueSuggestion = this.analyzePreferredTechnique();
    if (techniqueSuggestion) {
      newSuggestions.push(techniqueSuggestion);
    }

    // Analyze energy patterns
    const energySuggestion = this.analyzeEnergyPattern();
    if (energySuggestion) {
      newSuggestions.push(energySuggestion);
    }

    // Merge with existing suggestions (don't duplicate)
    for (const suggestion of newSuggestions) {
      const existingIndex = this.suggestions.findIndex(
        (s) => s.type === suggestion.type && !s.applied && !s.dismissed
      );
      if (existingIndex >= 0) {
        // Update existing suggestion if confidence is higher
        if (suggestion.confidence > this.suggestions[existingIndex].confidence) {
          this.suggestions[existingIndex] = suggestion;
        }
      } else {
        this.suggestions.push(suggestion);
      }
    }

    await this.saveSuggestions();
  }

  private analyzeBestFocusTime(): ProfileSuggestion | null {
    const completedSessions = this.behaviorData.focusSessions.filter((s) => s.completed);
    if (completedSessions.length < 5) return null;

    // Group by hour and calculate completion rate
    const hourlyStats: Record<number, { completed: number; total: number }> = {};

    for (const session of this.behaviorData.focusSessions) {
      const hour = session.hourOfDay;
      if (!hourlyStats[hour]) {
        hourlyStats[hour] = { completed: 0, total: 0 };
      }
      hourlyStats[hour].total++;
      if (session.completed) {
        hourlyStats[hour].completed++;
      }
    }

    // Find best hour(s)
    let bestHour = -1;
    let bestRate = 0;

    for (const [hour, stats] of Object.entries(hourlyStats)) {
      if (stats.total >= 3) {
        const rate = stats.completed / stats.total;
        if (rate > bestRate) {
          bestRate = rate;
          bestHour = parseInt(hour);
        }
      }
    }

    if (bestHour < 0 || bestRate < 0.7) return null;

    const timeRange = this.getTimeRange(bestHour);
    const confidence = Math.min(Math.round(bestRate * 100), 95);

    return {
      id: `focus_time_${Date.now()}`,
      type: 'best_focus_time',
      title: 'Melhor horário para foco',
      description: `Você completa ${Math.round(bestRate * 100)}% das sessões de foco neste período`,
      currentValue: 'Não definido',
      suggestedValue: timeRange,
      confidence,
      dataPoints: completedSessions.length,
      createdAt: new Date(),
      dismissed: false,
      applied: false,
    };
  }

  private analyzeOptimalFocusDuration(): ProfileSuggestion | null {
    const completedSessions = this.behaviorData.focusSessions.filter(
      (s) => s.completed && s.interruptions === 0
    );
    if (completedSessions.length < 5) return null;

    // Calculate average successful focus duration
    const totalMinutes = completedSessions.reduce((sum, s) => sum + s.actualMinutes, 0);
    const avgMinutes = Math.round(totalMinutes / completedSessions.length);

    // Round to nearest 5 minutes
    const suggestedMinutes = Math.round(avgMinutes / 5) * 5;

    if (suggestedMinutes < 10 || suggestedMinutes > 90) return null;

    const confidence = Math.min(70 + completedSessions.length, 95);

    return {
      id: `focus_duration_${Date.now()}`,
      type: 'focus_duration',
      title: 'Duração ideal de foco',
      description: `Você mantém foco sem interrupções por aproximadamente ${avgMinutes} minutos`,
      currentValue: 'Padrão do sistema',
      suggestedValue: `${suggestedMinutes} minutos`,
      confidence,
      dataPoints: completedSessions.length,
      createdAt: new Date(),
      dismissed: false,
      applied: false,
    };
  }

  private analyzePreferredTechnique(): ProfileSuggestion | null {
    if (this.behaviorData.focusSessions.length < 10) return null;

    // Count technique usage and success
    const techniqueStats: Record<string, { used: number; completed: number }> = {};

    for (const session of this.behaviorData.focusSessions) {
      const tech = session.technique;
      if (!techniqueStats[tech]) {
        techniqueStats[tech] = { used: 0, completed: 0 };
      }
      techniqueStats[tech].used++;
      if (session.completed) {
        techniqueStats[tech].completed++;
      }
    }

    // Find most successful technique
    let bestTech = '';
    let bestScore = 0;

    for (const [tech, stats] of Object.entries(techniqueStats)) {
      if (stats.used >= 3) {
        const score = (stats.completed / stats.used) * Math.log(stats.used + 1);
        if (score > bestScore) {
          bestScore = score;
          bestTech = tech;
        }
      }
    }

    if (!bestTech) return null;

    const stats = techniqueStats[bestTech];
    const successRate = Math.round((stats.completed / stats.used) * 100);
    const confidence = Math.min(successRate, 90);

    const techNames: Record<string, string> = {
      pomodoro: 'Pomodoro',
      deep_work: 'Trabalho Profundo',
      timeboxing: 'Timeboxing',
      free_flow: 'Fluxo Livre',
    };

    return {
      id: `technique_${Date.now()}`,
      type: 'technique',
      title: 'Técnica mais eficaz',
      description: `${techNames[bestTech] || bestTech} tem ${successRate}% de sucesso para você`,
      currentValue: 'Todas as técnicas',
      suggestedValue: techNames[bestTech] || bestTech,
      confidence,
      dataPoints: stats.used,
      createdAt: new Date(),
      dismissed: false,
      applied: false,
    };
  }

  private analyzeEnergyPattern(): ProfileSuggestion | null {
    if (this.behaviorData.checkIns.length < 10) return null;

    // Group check-ins by time of day
    const periodEnergy: Record<string, number[]> = {
      morning: [],   // 6-12
      afternoon: [], // 12-18
      evening: [],   // 18-22
      night: [],     // 22-6
    };

    for (const checkIn of this.behaviorData.checkIns) {
      const hour = checkIn.hourOfDay;
      if (hour >= 6 && hour < 12) {
        periodEnergy.morning.push(checkIn.energyLevel);
      } else if (hour >= 12 && hour < 18) {
        periodEnergy.afternoon.push(checkIn.energyLevel);
      } else if (hour >= 18 && hour < 22) {
        periodEnergy.evening.push(checkIn.energyLevel);
      } else {
        periodEnergy.night.push(checkIn.energyLevel);
      }
    }

    // Calculate averages
    const averages: Record<string, number> = {};
    let hasEnoughData = false;

    for (const [period, levels] of Object.entries(periodEnergy)) {
      if (levels.length >= 3) {
        averages[period] = levels.reduce((a, b) => a + b, 0) / levels.length;
        hasEnoughData = true;
      }
    }

    if (!hasEnoughData) return null;

    // Find highest energy period
    let peakPeriod = '';
    let peakEnergy = 0;

    for (const [period, avg] of Object.entries(averages)) {
      if (avg > peakEnergy) {
        peakEnergy = avg;
        peakPeriod = period;
      }
    }

    const periodNames: Record<string, string> = {
      morning: 'Manhã',
      afternoon: 'Tarde',
      evening: 'Noite',
      night: 'Madrugada',
    };

    const confidence = Math.min(75 + this.behaviorData.checkIns.length, 90);

    return {
      id: `energy_${Date.now()}`,
      type: 'energy_pattern',
      title: 'Pico de energia',
      description: `Sua energia é maior no período da ${periodNames[peakPeriod]}`,
      currentValue: 'Padrão estimado',
      suggestedValue: periodNames[peakPeriod],
      confidence,
      dataPoints: this.behaviorData.checkIns.length,
      createdAt: new Date(),
      dismissed: false,
      applied: false,
    };
  }

  private getTimeRange(hour: number): string {
    if (hour >= 6 && hour < 9) return 'Manhã cedo (6h-9h)';
    if (hour >= 9 && hour < 12) return 'Manhã (9h-12h)';
    if (hour >= 12 && hour < 14) return 'Início da tarde (12h-14h)';
    if (hour >= 14 && hour < 17) return 'Tarde (14h-17h)';
    if (hour >= 17 && hour < 20) return 'Fim da tarde (17h-20h)';
    if (hour >= 20 && hour < 23) return 'Noite (20h-23h)';
    return 'Madrugada (23h-6h)';
  }

  // Get active suggestions
  async getSuggestions(): Promise<ProfileSuggestion[]> {
    return this.suggestions.filter((s) => !s.dismissed && !s.applied);
  }

  // Dismiss a suggestion
  async dismissSuggestion(suggestionId: string): Promise<void> {
    const suggestion = this.suggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      suggestion.dismissed = true;
      await this.saveSuggestions();
    }
  }

  // Apply a suggestion
  async applySuggestion(suggestionId: string): Promise<void> {
    const suggestion = this.suggestions.find((s) => s.id === suggestionId);
    if (suggestion) {
      suggestion.applied = true;
      await this.saveSuggestions();
      // In production, this would update the actual cognitive profile
    }
  }

  // Get statistics for rediscovery prompt
  async getRediscoveryStats(): Promise<{
    totalSessions: number;
    avgFocusMinutes: number;
    preferredTechnique: string;
    peakHour: number;
    suggestRediscovery: boolean;
  }> {
    const sessions = this.behaviorData.focusSessions;
    const totalSessions = sessions.length;

    if (totalSessions < 10) {
      return {
        totalSessions,
        avgFocusMinutes: 0,
        preferredTechnique: '',
        peakHour: -1,
        suggestRediscovery: false,
      };
    }

    const avgFocusMinutes = Math.round(
      sessions.reduce((sum, s) => sum + s.actualMinutes, 0) / totalSessions
    );

    // Count techniques
    const techCounts: Record<string, number> = {};
    for (const s of sessions) {
      techCounts[s.technique] = (techCounts[s.technique] || 0) + 1;
    }
    const preferredTechnique = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Find peak hour
    const hourCounts: Record<number, number> = {};
    for (const s of sessions.filter((s) => s.completed)) {
      hourCounts[s.hourOfDay] = (hourCounts[s.hourOfDay] || 0) + 1;
    }
    const peakHour = parseInt(
      Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-1'
    );

    // Suggest rediscovery if there are many unresolved suggestions
    const activeSuggestions = this.suggestions.filter((s) => !s.dismissed && !s.applied);
    const suggestRediscovery = activeSuggestions.length >= 3 && totalSessions >= 30;

    return {
      totalSessions,
      avgFocusMinutes,
      preferredTechnique,
      peakHour,
      suggestRediscovery,
    };
  }
}

// Export singleton instance
export const adaptiveProfileService = new AdaptiveProfileService();
