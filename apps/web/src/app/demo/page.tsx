'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { userStorage, StoredUser } from '@/lib/storage';

// Sample data generator
function generateSampleData() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Sample Tasks - more complete with status and dates
  const tomorrow = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const tasks = [
    // Hoje
    { id: 'task_1', title: 'Revisar relatorio mensal', content: 'Revisar relatorio mensal', status: 'completed' as const, completed: true, projectId: 'proj_1', priority: 'high' as const, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr, period: 'morning' as const },
    { id: 'task_2', title: 'Preparar apresentacao para cliente', content: 'Preparar apresentacao para cliente', status: 'in_progress' as const, completed: false, projectId: 'proj_1', priority: 'high' as const, createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr, period: 'morning' as const, isTop1: true },
    { id: 'task_3', title: 'Responder emails pendentes', content: 'Responder emails pendentes', status: 'completed' as const, completed: true, projectId: undefined, priority: 'medium' as const, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr, period: 'morning' as const },
    { id: 'task_4', title: 'Agendar reuniao com equipe', content: 'Agendar reuniao com equipe', status: 'pending' as const, completed: false, projectId: 'proj_2', priority: 'medium' as const, createdAt: new Date().toISOString(), dueDate: todayStr, period: 'afternoon' as const },
    { id: 'task_5', title: 'Atualizar documentacao do projeto', content: 'Atualizar documentacao do projeto', status: 'pending' as const, completed: false, projectId: 'proj_1', priority: 'low' as const, createdAt: new Date().toISOString(), dueDate: todayStr, period: 'evening' as const },
    { id: 'task_6', title: 'Fazer backup dos arquivos', content: 'Fazer backup dos arquivos', status: 'completed' as const, completed: true, projectId: undefined, priority: 'low' as const, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), dueDate: todayStr },
    { id: 'task_7', title: 'Ligar para fornecedor', content: 'Ligar para fornecedor', status: 'pending' as const, completed: false, projectId: 'proj_3', priority: 'medium' as const, createdAt: new Date().toISOString(), dueDate: todayStr, period: 'afternoon' as const },
    { id: 'task_8', title: 'Revisar orcamento trimestral', content: 'Revisar orcamento trimestral', status: 'pending' as const, completed: false, projectId: 'proj_2', priority: 'high' as const, createdAt: new Date().toISOString(), dueDate: todayStr },
    // Amanha
    { id: 'task_9', title: 'Reuniao de kickoff projeto Beta', content: 'Reuniao de kickoff projeto Beta', status: 'pending' as const, completed: false, projectId: 'proj_1', priority: 'high' as const, createdAt: new Date().toISOString(), dueDate: tomorrow, period: 'morning' as const },
    { id: 'task_10', title: 'Enviar proposta comercial', content: 'Enviar proposta comercial', status: 'pending' as const, completed: false, projectId: 'proj_3', priority: 'high' as const, createdAt: new Date().toISOString(), dueDate: tomorrow },
    { id: 'task_11', title: 'Revisar codigo da feature X', content: 'Revisar codigo da feature X', status: 'pending' as const, completed: false, projectId: 'proj_1', priority: 'medium' as const, createdAt: new Date().toISOString(), dueDate: tomorrow, period: 'afternoon' as const },
    // Depois de amanha
    { id: 'task_12', title: 'Apresentacao para diretoria', content: 'Apresentacao para diretoria', status: 'pending' as const, completed: false, projectId: 'proj_2', priority: 'high' as const, createdAt: new Date().toISOString(), dueDate: dayAfter, period: 'morning' as const },
    { id: 'task_13', title: 'Entrevistar candidato', content: 'Entrevistar candidato', status: 'pending' as const, completed: false, projectId: undefined, priority: 'medium' as const, createdAt: new Date().toISOString(), dueDate: dayAfter, period: 'afternoon' as const },
    // Proxima semana
    { id: 'task_14', title: 'Deadline Projeto Alpha', content: 'Deadline Projeto Alpha', status: 'pending' as const, completed: false, projectId: 'proj_1', priority: 'high' as const, createdAt: new Date().toISOString(), dueDate: nextWeek },
    { id: 'task_15', title: 'Review mensal de performance', content: 'Review mensal de performance', status: 'pending' as const, completed: false, projectId: undefined, priority: 'medium' as const, createdAt: new Date().toISOString(), dueDate: nextWeek },
    { id: 'task_16', title: 'Planejar sprint do proximo mes', content: 'Planejar sprint do proximo mes', status: 'pending' as const, completed: false, projectId: 'proj_1', priority: 'medium' as const, createdAt: new Date().toISOString(), dueDate: nextWeek },
  ];

  // Sample Projects
  const projects = [
    { id: 'proj_1', name: 'Projeto Alpha', color: 'blue', emoji: '🚀', status: 'active' as const, createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'proj_2', name: 'Financeiro Q1', color: 'green', emoji: '💰', status: 'active' as const, createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'proj_3', name: 'Marketing Digital', color: 'purple', emoji: '📱', status: 'active' as const, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'proj_4', name: 'Treinamento Equipe', color: 'orange', emoji: '📚', status: 'completed' as const, createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  // Sample Brain Dump
  const brainDump = {
    items: [
      { id: 'bd_1', text: 'Ideia para novo produto', category: 'planejar' as const, createdAt: new Date().toISOString() },
      { id: 'bd_2', text: 'Ligar para Maria sobre parceria', category: 'ligar' as const, createdAt: new Date().toISOString() },
      { id: 'bd_3', text: 'Enviar proposta para cliente X', category: 'email' as const, createdAt: new Date().toISOString() },
      { id: 'bd_4', text: 'Pesquisar ferramentas de automacao', category: 'pesquisar' as const, createdAt: new Date().toISOString() },
      { id: 'bd_5', text: 'Mensagem para equipe sobre reuniao', category: 'mensagem' as const, createdAt: new Date().toISOString() },
    ],
    triaged: {
      hoje: ['bd_2', 'bd_3'],
      estaSemana: ['bd_1', 'bd_4'],
      delegar: [],
      algumDia: ['bd_5'],
    },
    top1: 'bd_3',
    bigGoal: 'Aumentar vendas em 20% este trimestre',
  };

  // Sample Calendar Events - full month
  const calendarEvents = [
    // Hoje
    { id: 'event_1', title: 'Reuniao de Equipe', date: todayStr, startTime: '09:00', endTime: '10:00', color: 'blue', isAllDay: false, repeat: 'weekly' as const },
    { id: 'event_2', title: 'Call com Cliente XYZ', date: todayStr, startTime: '14:00', endTime: '15:00', color: 'green', isAllDay: false, repeat: 'none' as const },
    { id: 'event_3', title: 'Daily Standup', date: todayStr, startTime: '09:30', endTime: '09:45', color: 'purple', isAllDay: false, repeat: 'daily' as const },
    // Amanha
    { id: 'event_4', title: 'Kickoff Projeto Beta', date: tomorrow, startTime: '10:00', endTime: '11:30', color: 'blue', isAllDay: false, repeat: 'none' as const },
    { id: 'event_5', title: 'Almoco com parceiro', date: tomorrow, startTime: '12:30', endTime: '14:00', color: 'orange', isAllDay: false, repeat: 'none' as const },
    // Depois de amanha
    { id: 'event_6', title: 'Apresentacao Diretoria', date: dayAfter, startTime: '09:00', endTime: '10:30', color: 'red', isAllDay: false, repeat: 'none' as const },
    { id: 'event_7', title: 'Entrevista candidato Dev Sr', date: dayAfter, startTime: '15:00', endTime: '16:00', color: 'teal', isAllDay: false, repeat: 'none' as const },
    // Proxima semana
    { id: 'event_8', title: 'Deadline Projeto Alpha', date: nextWeek, startTime: undefined, endTime: undefined, color: 'red', isAllDay: true, repeat: 'none' as const },
    { id: 'event_9', title: 'Review Mensal', date: nextWeek, startTime: '16:00', endTime: '17:30', color: 'purple', isAllDay: false, repeat: 'monthly' as const },
    { id: 'event_10', title: 'Sprint Planning', date: nextWeek, startTime: '10:00', endTime: '12:00', color: 'blue', isAllDay: false, repeat: 'biweekly' as const },
    // Eventos passados (para mostrar historico)
    { id: 'event_11', title: 'Retrospectiva Sprint', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '15:00', endTime: '16:00', color: 'purple', isAllDay: false, repeat: 'none' as const },
    { id: 'event_12', title: 'Workshop Design Thinking', date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '09:00', endTime: '12:00', color: 'orange', isAllDay: false, repeat: 'none' as const },
    { id: 'event_13', title: 'Treinamento Equipe', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '14:00', endTime: '17:00', color: 'green', isAllDay: false, repeat: 'none' as const },
    // Mais eventos no mes
    { id: 'event_14', title: 'Aniversario da Empresa', date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: undefined, endTime: undefined, color: 'pink', isAllDay: true, repeat: 'none' as const },
    { id: 'event_15', title: 'Webinar: Produtividade', date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], startTime: '19:00', endTime: '20:30', color: 'teal', isAllDay: false, repeat: 'none' as const },
  ];

  // Sample Notes
  const notes = [
    { id: 'note_1', title: 'Ideias para o Projeto Alpha', content: 'Precisamos considerar:\n\n1. Escalabilidade do sistema\n2. Integracao com APIs externas\n3. Design responsivo\n4. Testes automatizados', folderId: 'ideas', tags: ['projeto', 'planejamento'], isPinned: true, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date().toISOString() },
    { id: 'note_2', title: 'Anotacoes da reuniao', content: 'Pontos discutidos:\n- Budget aprovado\n- Timeline definido: 3 meses\n- Equipe: 4 pessoas\n\nProximos passos: agendar kickoff', folderId: 'inbox', tags: ['reuniao'], isPinned: false, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
    { id: 'note_3', title: 'Links uteis', content: 'Documentacao: https://docs.example.com\nDesign System: https://figma.com/...\nRepositorio: https://github.com/...', folderId: 'reference', tags: ['links', 'recursos'], isPinned: false, createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() },
  ];

  // Sample Weekly Review
  const weeklyReviews = [
    {
      id: 'weekly_1',
      weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      weekEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      wins: ['Finalizei o relatorio mensal', 'Consegui nova conta de cliente'],
      challenges: ['Dificuldade em manter foco pela manha'],
      lessons: ['Melhor comecar tarefas dificeis depois do almoco'],
      gratitude: ['Equipe colaborativa', 'Clima bom para trabalhar'],
      nextWeekFocus: 'Fechar proposta com cliente X',
      energyLevel: 4,
      productivityLevel: 3,
      overallMood: 'good' as const,
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Sample Planner for today
  const plannerData = {
    date: todayStr,
    confirmation: 'Focar nas tarefas de alta prioridade',
    gratitude: 'Por ter uma equipe incrivel',
    mood: 'good',
    sleepQuality: 7,
    expectedRating: 8,
    top1: 'Preparar apresentacao para cliente',
    tasks: [
      { id: 'pt_1', content: 'Preparar apresentacao para cliente', period: 'morning' as const, completed: false, isTop1: true, status: 'in_progress' as const, priority: 'high' as const, dueDate: todayStr, projectId: 'proj_1', createdAt: new Date().toISOString() },
      { id: 'pt_2', content: 'Agendar reuniao com equipe', period: 'afternoon' as const, completed: false, isTop1: false, status: 'pending' as const, priority: 'medium' as const, dueDate: todayStr, projectId: 'proj_2', createdAt: new Date().toISOString() },
      { id: 'pt_3', content: 'Ligar para fornecedor', period: 'afternoon' as const, completed: false, isTop1: false, status: 'pending' as const, priority: 'medium' as const, dueDate: todayStr, projectId: 'proj_3', createdAt: new Date().toISOString() },
      { id: 'pt_4', content: 'Atualizar documentacao do projeto', period: 'evening' as const, completed: false, isTop1: false, status: 'pending' as const, priority: 'low' as const, dueDate: todayStr, projectId: 'proj_1', createdAt: new Date().toISOString() },
    ],
    morningRoutineCompleted: true,
    eveningRoutineCompleted: false,
    morningReview: '',
    eveningReview: '',
  };

  // Sample Morning Routine
  const morningRoutine = [
    { id: '1', type: 'action' as const, content: 'Beber agua', emoji: '💧', duration: 1, nextStep: '2', isStart: true },
    { id: '2', type: 'condition' as const, content: 'Dormiu bem?', emoji: '😴', conditionYes: '3', conditionNo: '4' },
    { id: '3', type: 'action' as const, content: 'Exercicio', emoji: '🏃', duration: 20, nextStep: '5' },
    { id: '4', type: 'action' as const, content: 'Alongamento leve', emoji: '🧘', duration: 5, nextStep: '5' },
    { id: '5', type: 'action' as const, content: 'Banho', emoji: '🚿', duration: 15, nextStep: '6' },
    { id: '6', type: 'action' as const, content: 'Cafe da manha', emoji: '🍳', duration: 20, nextStep: '7' },
    { id: '7', type: 'action' as const, content: 'Definir Top 1', emoji: '⭐', duration: 5 },
  ];

  // Sample Evening Routine
  const eveningRoutine = [
    { id: '1', type: 'action' as const, content: 'Revisao do dia', emoji: '📝', duration: 5, nextStep: '2', isStart: true },
    { id: '2', type: 'action' as const, content: 'Planejar amanha', emoji: '📅', duration: 5, nextStep: '3' },
    { id: '3', type: 'action' as const, content: 'Preparar ambiente', emoji: '🏠', duration: 10, nextStep: '4' },
    { id: '4', type: 'action' as const, content: 'Leitura relaxante', emoji: '📚', duration: 20, nextStep: '5' },
    { id: '5', type: 'action' as const, content: 'Meditacao/respiracao', emoji: '🧘', duration: 10 },
  ];

  // Chronotype
  const chronotype = 'bear';

  // Note folders
  const noteFolders = [
    { id: 'inbox', name: 'Inbox', emoji: '📥', color: 'blue' },
    { id: 'ideas', name: 'Ideias', emoji: '💡', color: 'yellow' },
    { id: 'reference', name: 'Referencia', emoji: '📚', color: 'purple' },
    { id: 'archive', name: 'Arquivo', emoji: '📦', color: 'gray' },
    { id: 'work', name: 'Trabalho', emoji: '💼', color: 'green' },
  ];

  // Check-in history (last 7 days)
  const checkins: Record<string, { mood: string; energy: number; notes: string; createdAt: string }> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    const moods = ['great', 'good', 'good', 'okay', 'good', 'great', 'good'];
    const energies = [4, 3, 4, 3, 5, 4, 3];
    checkins[dateStr] = {
      mood: moods[i],
      energy: energies[i],
      notes: i === 0 ? 'Dia produtivo!' : '',
      createdAt: date.toISOString(),
    };
  }

  // Focus stats (last 7 days)
  const focusStats: Record<string, { totalMinutes: number; sessions: number }> = {};
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split('T')[0];
    focusStats[dateStr] = {
      totalMinutes: Math.floor(Math.random() * 120) + 30, // 30-150 min
      sessions: Math.floor(Math.random() * 5) + 1, // 1-5 sessions
    };
  }

  // Cognitive profile from discovery
  const cognitiveProfile = {
    chronotype: 'bear',
    executionStyle: 'structured',
    focusPattern: 'deep_blocks',
    energyPattern: 'morning_peak',
    strengths: ['Foco em blocos', 'Rotina consistente', 'Organizacao'],
    challenges: ['Sonolencia pos-almoco', 'Dificuldade com interrupcoes'],
    recommendations: [
      'Agende tarefas importantes para o periodo da manha',
      'Use tecnica Pomodoro para manter foco',
      'Faca pausas ativas apos o almoco',
    ],
    completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  // Discovery answers
  const discoveryAnswers = [
    { questionId: 1, answer: 'bear' },
    { questionId: 2, answer: 'bear' },
    { questionId: 3, answer: 'bear' },
    { questionId: 4, answer: 'bear' },
    { questionId: 5, answer: 'bear' },
  ];

  // Monthly reviews
  const monthlyReviews = [
    {
      id: 'monthly_1',
      month: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7),
      biggestWin: 'Lancamento do projeto Alpha com sucesso',
      mainChallenge: 'Equilibrar reunioes com tempo de foco',
      lessonsLearned: 'Bloquear horarios no calendario para trabalho profundo',
      goalsAchieved: ['Fechar 3 novos clientes', 'Implementar nova feature'],
      goalsNotAchieved: ['Terminar curso online'],
      nextMonthFocus: 'Melhorar rotina de exercicios',
      overallSatisfaction: 4,
      completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  // Teams (for manager view)
  const teams = [
    {
      id: 'team_1',
      name: 'Desenvolvimento',
      description: 'Equipe de desenvolvimento de software',
      ownerId: 'demo_user',
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
      members: [
        { id: 'demo_user', name: 'Usuario Demo', email: 'demo@mentesbrilhantes.app', role: 'Líder', status: 'active' as const, productivity: 85, lastCheckIn: 'Agora' },
        { id: 'member_1', name: 'Ana Silva', email: 'ana@email.com', role: 'Desenvolvedor', status: 'active' as const, productivity: 92, lastCheckIn: '10 min' },
        { id: 'member_2', name: 'Carlos Santos', email: 'carlos@email.com', role: 'Desenvolvedor', status: 'active' as const, productivity: 78, lastCheckIn: '30 min' },
        { id: 'member_3', name: 'Maria Oliveira', email: 'maria@email.com', role: 'QA', status: 'away' as const, productivity: 88, lastCheckIn: '2h' },
      ],
    },
    {
      id: 'team_2',
      name: 'Design',
      description: 'Equipe de UX/UI Design',
      ownerId: 'demo_user',
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      members: [
        { id: 'demo_user', name: 'Usuario Demo', email: 'demo@mentesbrilhantes.app', role: 'Gestor', status: 'active' as const, productivity: 85, lastCheckIn: 'Agora' },
        { id: 'member_4', name: 'Fernanda Costa', email: 'fernanda@email.com', role: 'UX Designer', status: 'active' as const, productivity: 90, lastCheckIn: '15 min' },
        { id: 'member_5', name: 'Joao Pereira', email: 'joao@email.com', role: 'UI Designer', status: 'offline' as const, productivity: 75, lastCheckIn: '1 dia' },
      ],
    },
  ];

  return {
    tasks,
    projects,
    brainDump,
    calendarEvents,
    notes,
    weeklyReviews,
    plannerData,
    todayStr,
    morningRoutine,
    eveningRoutine,
    chronotype,
    noteFolders,
    checkins,
    focusStats,
    cognitiveProfile,
    discoveryAnswers,
    monthlyReviews,
    teams,
  };
}

function loadSampleData() {
  const data = generateSampleData();

  // Clear existing data
  const keysToKeep = ['nciaflux_user'];
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('nciaflux_') && !keysToKeep.includes(key)) {
      localStorage.removeItem(key);
    }
  });

  // Load sample data
  localStorage.setItem('nciaflux_tasks', JSON.stringify(data.tasks));
  localStorage.setItem('nciaflux_projects', JSON.stringify(data.projects));
  localStorage.setItem('nciaflux_brain_dump', JSON.stringify(data.brainDump));
  localStorage.setItem('nciaflux_calendar_events', JSON.stringify(data.calendarEvents));
  localStorage.setItem('nciaflux_notes', JSON.stringify(data.notes));
  localStorage.setItem('nciaflux_weekly_reviews', JSON.stringify(data.weeklyReviews));
  localStorage.setItem(`nciaflux_planner_${data.todayStr}`, JSON.stringify(data.plannerData));
  localStorage.setItem('nciaflux_morning_routine', JSON.stringify(data.morningRoutine));
  localStorage.setItem('nciaflux_evening_routine', JSON.stringify(data.eveningRoutine));
  localStorage.setItem('nciaflux_chronotype', data.chronotype);
  localStorage.setItem('nciaflux_note_folders', JSON.stringify(data.noteFolders));
  localStorage.setItem('nciaflux_checkins', JSON.stringify(data.checkins));
  localStorage.setItem('nciaflux_focus_stats', JSON.stringify(data.focusStats));
  localStorage.setItem('nciaflux_cognitive_profile', JSON.stringify(data.cognitiveProfile));
  localStorage.setItem('nciaflux_discovery_answers', JSON.stringify(data.discoveryAnswers));
  localStorage.setItem('nciaflux_monthly_reviews', JSON.stringify(data.monthlyReviews));
  localStorage.setItem('nciaflux_teams', JSON.stringify(data.teams));
  localStorage.setItem('nciaflux_demo_mode', 'true');
}

export default function DemoPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (userStorage.isAuthenticated()) {
      router.push('/dashboard');
    }
  }, [router]);

  async function startDemo() {
    setIsLoading(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Create demo user
    const demoUser: StoredUser = {
      id: 'demo_user',
      email: 'demo@mentesbrilhantes.app',
      name: 'Usuario Demo',
      role: 'manager',
    };

    // Store user
    userStorage.set(demoUser);

    // Load sample data
    loadSampleData();

    // Redirect to dashboard
    router.push('/dashboard');
  }

  const features = [
    { icon: '📝', title: 'Brain Dump', desc: 'Capture pensamentos e organize com triagem' },
    { icon: '📅', title: 'Planner Diario', desc: 'Planeje seu dia em blocos de tempo' },
    { icon: '🔄', title: 'Rotinas', desc: 'Crie rotinas matinais e noturnas' },
    { icon: '📁', title: 'Projetos', desc: 'Organize tarefas por projetos' },
    { icon: '📆', title: 'Agenda', desc: 'Visualize eventos em calendario' },
    { icon: '📓', title: 'Notas', desc: 'Capture ideias e referencias' },
    { icon: '🧠', title: 'Cronotipos', desc: 'Descubra seu perfil de produtividade' },
    { icon: '📊', title: 'Revisoes', desc: 'Reflita sobre seu progresso' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-main/10 to-secondary-main/10">
      {/* Header */}
      <header className="p-6">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-primary-main rounded-xl flex items-center justify-center text-white font-bold text-lg">
            M
          </div>
          <span className="text-xl font-bold text-neutral-textPrimary">MentesBrilhantes</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="text-6xl mb-6 block">🚀</span>
          <h1 className="text-4xl lg:text-5xl font-bold text-neutral-textPrimary mb-4">
            Experimente o MentesBrilhantes
          </h1>
          <p className="text-xl text-neutral-textSecondary max-w-2xl mx-auto">
            Explore todas as funcionalidades com dados de exemplo. Sem cadastro, sem compromisso.
          </p>
        </div>

        {/* Start Demo Button */}
        <div className="text-center mb-16">
          <button
            onClick={startDemo}
            disabled={isLoading}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary-main text-white text-xl font-bold hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                Preparando demo...
              </>
            ) : (
              <>
                <span>▶️</span>
                Iniciar Demo Gratuito
              </>
            )}
          </button>
          <p className="text-sm text-neutral-textMuted mt-4">
            Seus dados ficam salvos localmente no navegador
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <span className="text-3xl block mb-3">{feature.icon}</span>
              <h3 className="font-semibold text-neutral-textPrimary mb-1">{feature.title}</h3>
              <p className="text-sm text-neutral-textSecondary">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* What's Included */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-12">
          <h2 className="text-2xl font-bold text-neutral-textPrimary mb-6 text-center">
            O que esta incluido no demo?
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <span className="text-accent-success text-xl">✓</span>
              <div>
                <p className="font-medium text-neutral-textPrimary">Tarefas e Projetos de exemplo</p>
                <p className="text-sm text-neutral-textSecondary">Veja como organizar seu trabalho</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-success text-xl">✓</span>
              <div>
                <p className="font-medium text-neutral-textPrimary">Rotinas pre-configuradas</p>
                <p className="text-sm text-neutral-textSecondary">Rotinas matinal e noturna prontas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-success text-xl">✓</span>
              <div>
                <p className="font-medium text-neutral-textPrimary">Cronotipo definido</p>
                <p className="text-sm text-neutral-textSecondary">Veja dicas personalizadas</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-success text-xl">✓</span>
              <div>
                <p className="font-medium text-neutral-textPrimary">Notas e Brain Dump</p>
                <p className="text-sm text-neutral-textSecondary">Exemplos de captura de ideias</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-success text-xl">✓</span>
              <div>
                <p className="font-medium text-neutral-textPrimary">Eventos no calendario</p>
                <p className="text-sm text-neutral-textSecondary">Visualize sua agenda</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent-success text-xl">✓</span>
              <div>
                <p className="font-medium text-neutral-textPrimary">Revisao semanal completa</p>
                <p className="text-sm text-neutral-textSecondary">Veja como refletir sobre progresso</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-neutral-textSecondary mb-4">
            Ja tem uma conta?
          </p>
          <Link
            href="/login"
            className="text-primary-main font-semibold hover:underline"
          >
            Fazer login
          </Link>
          <span className="mx-3 text-neutral-border">|</span>
          <Link
            href="/register"
            className="text-primary-main font-semibold hover:underline"
          >
            Criar conta gratuita
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-sm text-neutral-textMuted">
        <p>MentesBrilhantes - Produtividade que entende voce</p>
      </footer>
    </div>
  );
}
