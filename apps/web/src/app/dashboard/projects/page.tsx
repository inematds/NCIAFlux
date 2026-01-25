'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getStorageKey } from '@/lib/storage';

interface Project {
  id: string;
  name: string;
  color: string;
  emoji: string;
  status: 'active' | 'archived' | 'completed';
  createdAt: string;
  updatedAt: string;
}

interface Task {
  id: string;
  content: string;
  completed: boolean;
  projectId?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

const COLORS = [
  { id: 'blue', class: 'bg-blue-500', light: 'bg-blue-100' },
  { id: 'green', class: 'bg-green-500', light: 'bg-green-100' },
  { id: 'purple', class: 'bg-purple-500', light: 'bg-purple-100' },
  { id: 'orange', class: 'bg-orange-500', light: 'bg-orange-100' },
  { id: 'pink', class: 'bg-pink-500', light: 'bg-pink-100' },
  { id: 'yellow', class: 'bg-yellow-500', light: 'bg-yellow-100' },
  { id: 'red', class: 'bg-red-500', light: 'bg-red-100' },
  { id: 'teal', class: 'bg-teal-500', light: 'bg-teal-100' },
];

const EMOJIS = ['📁', '💼', '🎯', '🚀', '💡', '📚', '🏠', '💪', '🎨', '🔧', '📱', '🌟'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('blue');
  const [newEmoji, setNewEmoji] = useState('📁');

  // Load data
  useEffect(() => {
    const savedProjects = localStorage.getItem(getStorageKey('nciaflux_projects'));
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    const savedTasks = localStorage.getItem(getStorageKey('nciaflux_tasks'));
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save projects
  useEffect(() => {
    localStorage.setItem(getStorageKey('nciaflux_projects'), JSON.stringify(projects));
  }, [projects]);

  function createProject() {
    if (!newName.trim()) return;

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: newName.trim(),
      color: newColor,
      emoji: newEmoji,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setProjects([...projects, newProject]);
    resetForm();
    setShowCreateModal(false);
  }

  function updateProject() {
    if (!editingProject || !newName.trim()) return;

    setProjects(projects.map(p =>
      p.id === editingProject.id
        ? { ...p, name: newName.trim(), color: newColor, emoji: newEmoji, updatedAt: new Date().toISOString() }
        : p
    ));
    resetForm();
    setEditingProject(null);
  }

  function archiveProject(projectId: string) {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'archived', updatedAt: new Date().toISOString() } : p
    ));
  }

  function restoreProject(projectId: string) {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'active', updatedAt: new Date().toISOString() } : p
    ));
  }

  function completeProject(projectId: string) {
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'completed', updatedAt: new Date().toISOString() } : p
    ));
  }

  function deleteProject(projectId: string) {
    if (!confirm('Excluir projeto permanentemente?')) return;
    setProjects(projects.filter(p => p.id !== projectId));
    // Remove project from tasks
    setTasks(tasks.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t));
    localStorage.setItem(getStorageKey('nciaflux_tasks'), JSON.stringify(
      tasks.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t)
    ));
  }

  function startEdit(project: Project) {
    setEditingProject(project);
    setNewName(project.name);
    setNewColor(project.color);
    setNewEmoji(project.emoji);
  }

  function resetForm() {
    setNewName('');
    setNewColor('blue');
    setNewEmoji('📁');
  }

  function getProjectTasks(projectId: string) {
    return tasks.filter(t => t.projectId === projectId);
  }

  function getProjectProgress(projectId: string) {
    const projectTasks = getProjectTasks(projectId);
    if (projectTasks.length === 0) return 0;
    const completed = projectTasks.filter(t => t.completed).length;
    return Math.round((completed / projectTasks.length) * 100);
  }

  const getColorClass = (colorId: string) =>
    COLORS.find(c => c.id === colorId)?.class || 'bg-blue-500';

  const getColorLightClass = (colorId: string) =>
    COLORS.find(c => c.id === colorId)?.light || 'bg-blue-100';

  const activeProjects = projects.filter(p => p.status === 'active');
  const archivedProjects = projects.filter(p => p.status === 'archived' || p.status === 'completed');

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-neutral-textPrimary">
            Projetos
          </h1>
          <p className="text-neutral-textSecondary mt-1">
            {activeProjects.length} projetos ativos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-primary-main text-white font-semibold hover:bg-primary-dark transition-colors"
        >
          + Novo Projeto
        </button>
      </div>

      {/* Active Projects Grid */}
      {activeProjects.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <span className="text-6xl block mb-4">📁</span>
          <h2 className="text-xl font-semibold text-neutral-textPrimary mb-2">
            Nenhum projeto ainda
          </h2>
          <p className="text-neutral-textSecondary mb-6">
            Crie seu primeiro projeto para organizar suas tarefas
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-primary-main text-white font-semibold"
          >
            Criar Projeto
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {activeProjects.map(project => {
            const projectTasks = getProjectTasks(project.id);
            const progress = getProjectProgress(project.id);
            const completedTasks = projectTasks.filter(t => t.completed).length;

            return (
              <div
                key={project.id}
                className={`${getColorLightClass(project.color)} rounded-2xl p-5 border border-transparent hover:border-neutral-border transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{project.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-neutral-textPrimary">{project.name}</h3>
                      <span className="text-xs text-neutral-textMuted">
                        {projectTasks.length} tarefas
                      </span>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getColorClass(project.color)}`} />
                </div>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-neutral-textMuted mb-1">
                    <span>{completedTasks} de {projectTasks.length}</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 bg-white/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getColorClass(project.color)} transition-all`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="flex-1 py-2 rounded-lg bg-white text-center text-sm font-medium text-neutral-textPrimary hover:bg-white/80"
                  >
                    Abrir
                  </Link>
                  <button
                    onClick={() => startEdit(project)}
                    className="px-3 py-2 rounded-lg bg-white text-neutral-textMuted hover:bg-white/80"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => archiveProject(project.id)}
                    className="px-3 py-2 rounded-lg bg-white text-neutral-textMuted hover:bg-white/80"
                  >
                    📦
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Archived Projects */}
      {archivedProjects.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className="flex items-center gap-2 text-neutral-textSecondary hover:text-neutral-textPrimary mb-4"
          >
            <span>{showArchived ? '▼' : '▶'}</span>
            <span>Arquivados ({archivedProjects.length})</span>
          </button>

          {showArchived && (
            <div className="space-y-2">
              {archivedProjects.map(project => (
                <div
                  key={project.id}
                  className="flex items-center gap-4 p-4 bg-neutral-background rounded-xl"
                >
                  <span className="text-2xl opacity-50">{project.emoji}</span>
                  <div className="flex-1">
                    <p className="font-medium text-neutral-textMuted">{project.name}</p>
                    <span className="text-xs text-neutral-textMuted">
                      {project.status === 'completed' ? '✅ Concluído' : '📦 Arquivado'}
                    </span>
                  </div>
                  <button
                    onClick={() => restoreProject(project.id)}
                    className="text-sm text-primary-main hover:underline"
                  >
                    Restaurar
                  </button>
                  <button
                    onClick={() => deleteProject(project.id)}
                    className="text-sm text-accent-error hover:underline"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingProject) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              {editingProject ? 'Editar Projeto' : 'Novo Projeto'}
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Nome</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome do projeto"
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                autoFocus
              />
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setNewEmoji(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      newEmoji === emoji ? 'bg-primary-main/20 ring-2 ring-primary-main' : 'bg-neutral-background'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div className="mb-6">
              <label className="block text-sm text-neutral-textSecondary mb-2">Cor</label>
              <div className="flex gap-2">
                {COLORS.map(color => (
                  <button
                    key={color.id}
                    onClick={() => setNewColor(color.id)}
                    className={`w-8 h-8 rounded-full ${color.class} ${
                      newColor === color.id ? 'ring-2 ring-offset-2 ring-primary-main' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingProject(null);
                  resetForm();
                }}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
              >
                Cancelar
              </button>
              <button
                onClick={editingProject ? updateProject : createProject}
                className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                {editingProject ? 'Salvar' : 'Criar'}
              </button>
            </div>

            {/* Complete/Delete for editing */}
            {editingProject && (
              <div className="mt-4 pt-4 border-t border-neutral-border flex gap-2">
                <button
                  onClick={() => {
                    completeProject(editingProject.id);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="flex-1 py-2 rounded-lg text-sm text-accent-success hover:bg-accent-success/10"
                >
                  ✅ Marcar como concluido
                </button>
                <button
                  onClick={() => {
                    deleteProject(editingProject.id);
                    setEditingProject(null);
                    resetForm();
                  }}
                  className="flex-1 py-2 rounded-lg text-sm text-accent-error hover:bg-accent-error/10"
                >
                  🗑️ Excluir
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
