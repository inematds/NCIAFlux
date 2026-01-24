'use client';

import { useState, useEffect } from 'react';

interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  tags: string[];
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Folder {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

const DEFAULT_FOLDERS: Folder[] = [
  { id: 'inbox', name: 'Inbox', emoji: '📥', color: 'blue' },
  { id: 'ideas', name: 'Ideias', emoji: '💡', color: 'yellow' },
  { id: 'reference', name: 'Referencia', emoji: '📚', color: 'purple' },
  { id: 'archive', name: 'Arquivo', emoji: '📦', color: 'gray' },
];

const COLORS: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-700' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700' },
  gray: { bg: 'bg-gray-100', text: 'text-gray-700' },
  green: { bg: 'bg-green-100', text: 'text-green-700' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-700' },
};

const FOLDER_EMOJIS = ['📁', '📚', '💡', '🎯', '🚀', '💼', '🏠', '🔧', '📝', '⭐', '🎨', '📱'];
const FOLDER_COLORS = Object.keys(COLORS);

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>(DEFAULT_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // Quick capture
  const [quickNote, setQuickNote] = useState('');

  // Note editor
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');

  // Folder form
  const [folderName, setFolderName] = useState('');
  const [folderEmoji, setFolderEmoji] = useState('📁');
  const [folderColor, setFolderColor] = useState('blue');

  // Load data
  useEffect(() => {
    const savedNotes = localStorage.getItem('nciaflux_notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    const savedFolders = localStorage.getItem('nciaflux_note_folders');
    if (savedFolders) {
      setFolders(JSON.parse(savedFolders));
    }
  }, []);

  // Save notes
  function saveNotes(newNotes: Note[]) {
    setNotes(newNotes);
    localStorage.setItem('nciaflux_notes', JSON.stringify(newNotes));
  }

  // Save folders
  function saveFolders(newFolders: Folder[]) {
    setFolders(newFolders);
    localStorage.setItem('nciaflux_note_folders', JSON.stringify(newFolders));
  }

  // Quick capture
  function handleQuickCapture() {
    if (!quickNote.trim()) return;

    const newNote: Note = {
      id: `note_${Date.now()}`,
      title: quickNote.split('\n')[0].slice(0, 50) || 'Nota rapida',
      content: quickNote.trim(),
      folderId: 'inbox',
      tags: [],
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveNotes([newNote, ...notes]);
    setQuickNote('');
  }

  // Create/Edit note
  function openNewNote() {
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags([]);
  }

  function openNote(note: Note) {
    setSelectedNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteTags(note.tags);
  }

  function saveNote() {
    if (!noteTitle.trim() && !noteContent.trim()) return;

    if (selectedNote) {
      saveNotes(notes.map(n =>
        n.id === selectedNote.id
          ? {
              ...n,
              title: noteTitle.trim() || 'Sem titulo',
              content: noteContent,
              tags: noteTags,
              updatedAt: new Date().toISOString(),
            }
          : n
      ));
    } else {
      const newNote: Note = {
        id: `note_${Date.now()}`,
        title: noteTitle.trim() || 'Sem titulo',
        content: noteContent,
        folderId: selectedFolder || 'inbox',
        tags: noteTags,
        isPinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveNotes([newNote, ...notes]);
      setSelectedNote(newNote);
    }
  }

  function deleteNote(noteId: string) {
    if (!confirm('Excluir esta nota?')) return;
    saveNotes(notes.filter(n => n.id !== noteId));
    setSelectedNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags([]);
  }

  function togglePin(noteId: string) {
    saveNotes(notes.map(n =>
      n.id === noteId ? { ...n, isPinned: !n.isPinned } : n
    ));
  }

  function moveToFolder(noteId: string, folderId: string) {
    saveNotes(notes.map(n =>
      n.id === noteId ? { ...n, folderId, updatedAt: new Date().toISOString() } : n
    ));
  }

  // Tags
  function addTag() {
    if (!newTag.trim() || noteTags.includes(newTag.trim())) return;
    setNoteTags([...noteTags, newTag.trim()]);
    setNewTag('');
  }

  function removeTag(tag: string) {
    setNoteTags(noteTags.filter(t => t !== tag));
  }

  // Folders
  function openNewFolder() {
    setEditingFolder(null);
    setFolderName('');
    setFolderEmoji('📁');
    setFolderColor('blue');
    setShowFolderModal(true);
  }

  function openEditFolder(folder: Folder) {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderEmoji(folder.emoji);
    setFolderColor(folder.color);
    setShowFolderModal(true);
  }

  function saveFolder() {
    if (!folderName.trim()) return;

    if (editingFolder) {
      saveFolders(folders.map(f =>
        f.id === editingFolder.id
          ? { ...f, name: folderName.trim(), emoji: folderEmoji, color: folderColor }
          : f
      ));
    } else {
      const newFolder: Folder = {
        id: `folder_${Date.now()}`,
        name: folderName.trim(),
        emoji: folderEmoji,
        color: folderColor,
      };
      saveFolders([...folders, newFolder]);
    }

    setShowFolderModal(false);
  }

  function deleteFolder(folderId: string) {
    if (DEFAULT_FOLDERS.some(f => f.id === folderId)) {
      alert('Nao e possivel excluir pastas padrao');
      return;
    }
    if (!confirm('Excluir pasta? As notas serao movidas para o Inbox.')) return;

    // Move notes to inbox
    saveNotes(notes.map(n =>
      n.folderId === folderId ? { ...n, folderId: 'inbox' } : n
    ));

    saveFolders(folders.filter(f => f.id !== folderId));
    setSelectedFolder(null);
    setShowFolderModal(false);
  }

  // Filtering
  const filteredNotes = notes
    .filter(n => {
      if (selectedFolder && n.folderId !== selectedFolder) return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          n.title.toLowerCase().includes(query) ||
          n.content.toLowerCase().includes(query) ||
          n.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  const getFolderNoteCount = (folderId: string) =>
    notes.filter(n => n.folderId === folderId).length;

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return `${days} dias atras`;
    return date.toLocaleDateString('pt-BR');
  }

  return (
    <div className="h-[calc(100vh-80px)] flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-neutral-border p-4 flex flex-col">
        {/* Quick Capture */}
        <div className="mb-6">
          <textarea
            value={quickNote}
            onChange={(e) => setQuickNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleQuickCapture();
            }}
            placeholder="Captura rapida... (Cmd+Enter)"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main resize-none text-sm"
          />
          <button
            onClick={handleQuickCapture}
            disabled={!quickNote.trim()}
            className="w-full mt-2 py-2 rounded-lg bg-primary-main text-white text-sm font-medium disabled:opacity-50"
          >
            + Adicionar ao Inbox
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar notas..."
            className="w-full px-3 py-2 rounded-lg bg-neutral-background border-none focus:outline-none focus:ring-2 focus:ring-primary-main text-sm"
          />
        </div>

        {/* Folders */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-neutral-textMuted uppercase font-medium">Pastas</span>
            <button
              onClick={openNewFolder}
              className="text-xs text-primary-main hover:underline"
            >
              + Nova
            </button>
          </div>

          <button
            onClick={() => setSelectedFolder(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left mb-1 ${
              selectedFolder === null
                ? 'bg-primary-main/10 text-primary-main'
                : 'hover:bg-neutral-background text-neutral-textSecondary'
            }`}
          >
            <span>📋</span>
            <span className="flex-1 text-sm">Todas</span>
            <span className="text-xs text-neutral-textMuted">{notes.length}</span>
          </button>

          {folders.map(folder => {
            const color = COLORS[folder.color] || COLORS.blue;
            return (
              <div key={folder.id} className="group relative">
                <button
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left mb-1 ${
                    selectedFolder === folder.id
                      ? `${color.bg} ${color.text}`
                      : 'hover:bg-neutral-background text-neutral-textSecondary'
                  }`}
                >
                  <span>{folder.emoji}</span>
                  <span className="flex-1 text-sm truncate">{folder.name}</span>
                  <span className="text-xs text-neutral-textMuted">{getFolderNoteCount(folder.id)}</span>
                </button>
                {!DEFAULT_FOLDERS.some(f => f.id === folder.id) && (
                  <button
                    onClick={() => openEditFolder(folder)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 text-neutral-textMuted hover:text-neutral-textPrimary"
                  >
                    ✏️
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Notes List */}
      <div className="w-80 bg-neutral-background border-r border-neutral-border p-4 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-neutral-textPrimary">
            {selectedFolder
              ? folders.find(f => f.id === selectedFolder)?.name || 'Notas'
              : 'Todas as Notas'}
          </h2>
          <button
            onClick={openNewNote}
            className="px-3 py-1.5 rounded-lg bg-primary-main text-white text-sm font-medium"
          >
            + Nova
          </button>
        </div>

        {filteredNotes.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl block mb-2">📝</span>
            <p className="text-neutral-textMuted text-sm">
              {searchQuery ? 'Nenhuma nota encontrada' : 'Nenhuma nota ainda'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredNotes.map(note => (
              <div
                key={note.id}
                onClick={() => openNote(note)}
                className={`p-3 rounded-xl cursor-pointer transition-colors ${
                  selectedNote?.id === note.id
                    ? 'bg-white shadow-sm ring-2 ring-primary-main'
                    : 'bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-start gap-2">
                  {note.isPinned && <span className="text-sm">📌</span>}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-neutral-textPrimary truncate">
                      {note.title || 'Sem titulo'}
                    </h3>
                    <p className="text-sm text-neutral-textMuted line-clamp-2">
                      {note.content.slice(0, 100)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-neutral-textMuted">
                        {formatDate(note.updatedAt)}
                      </span>
                      {note.tags.length > 0 && (
                        <div className="flex gap-1">
                          {note.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-primary-main/10 text-primary-main">
                              {tag}
                            </span>
                          ))}
                          {note.tags.length > 2 && (
                            <span className="text-xs text-neutral-textMuted">+{note.tags.length - 2}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note Editor */}
      <div className="flex-1 bg-white p-6 overflow-y-auto">
        {selectedNote || noteTitle || noteContent ? (
          <div className="max-w-2xl mx-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {selectedNote && (
                  <>
                    <button
                      onClick={() => togglePin(selectedNote.id)}
                      className={`p-2 rounded-lg hover:bg-neutral-background ${
                        selectedNote.isPinned ? 'text-primary-main' : 'text-neutral-textMuted'
                      }`}
                      title={selectedNote.isPinned ? 'Desafixar' : 'Fixar'}
                    >
                      📌
                    </button>

                    <select
                      value={selectedNote.folderId || 'inbox'}
                      onChange={(e) => moveToFolder(selectedNote.id, e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-neutral-border text-sm focus:outline-none focus:ring-2 focus:ring-primary-main"
                    >
                      {folders.map(folder => (
                        <option key={folder.id} value={folder.id}>
                          {folder.emoji} {folder.name}
                        </option>
                      ))}
                    </select>
                  </>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={saveNote}
                  className="px-4 py-1.5 rounded-lg bg-primary-main text-white text-sm font-medium"
                >
                  Salvar
                </button>
                {selectedNote && (
                  <button
                    onClick={() => deleteNote(selectedNote.id)}
                    className="p-2 rounded-lg text-accent-error hover:bg-accent-error/10"
                  >
                    🗑️
                  </button>
                )}
              </div>
            </div>

            {/* Title */}
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              onBlur={saveNote}
              placeholder="Titulo da nota"
              className="w-full text-2xl font-bold text-neutral-textPrimary border-none focus:outline-none mb-4 placeholder:text-neutral-textMuted"
            />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {noteTags.map(tag => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary-main/10 text-primary-main text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-accent-error"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="+ tag"
                  className="w-20 px-2 py-1 text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary-main rounded"
                />
              </div>
            </div>

            {/* Content */}
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              onBlur={saveNote}
              placeholder="Escreva sua nota aqui..."
              className="w-full min-h-[400px] text-neutral-textPrimary border-none focus:outline-none resize-none leading-relaxed"
            />

            {/* Metadata */}
            {selectedNote && (
              <div className="mt-8 pt-4 border-t border-neutral-border text-xs text-neutral-textMuted">
                <p>Criado: {new Date(selectedNote.createdAt).toLocaleString('pt-BR')}</p>
                <p>Atualizado: {new Date(selectedNote.updatedAt).toLocaleString('pt-BR')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl block mb-4">📝</span>
              <h2 className="text-xl font-semibold text-neutral-textPrimary mb-2">
                Selecione ou crie uma nota
              </h2>
              <p className="text-neutral-textMuted mb-4">
                Use a captura rapida para adicionar ideias ao Inbox
              </p>
              <button
                onClick={openNewNote}
                className="px-6 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                Nova Nota
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Folder Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-neutral-textPrimary mb-4">
              {editingFolder ? 'Editar Pasta' : 'Nova Pasta'}
            </h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Nome</label>
              <input
                type="text"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Nome da pasta"
                className="w-full px-4 py-3 rounded-xl border border-neutral-border focus:outline-none focus:ring-2 focus:ring-primary-main"
                autoFocus
              />
            </div>

            {/* Emoji */}
            <div className="mb-4">
              <label className="block text-sm text-neutral-textSecondary mb-2">Emoji</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setFolderEmoji(emoji)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl ${
                      folderEmoji === emoji ? 'bg-primary-main/20 ring-2 ring-primary-main' : 'bg-neutral-background'
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
                {FOLDER_COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFolderColor(color)}
                    className={`w-8 h-8 rounded-full ${COLORS[color].bg} ${
                      folderColor === color ? 'ring-2 ring-offset-2 ring-primary-main' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFolderModal(false)}
                className="flex-1 py-3 rounded-xl border border-neutral-border text-neutral-textSecondary"
              >
                Cancelar
              </button>
              <button
                onClick={saveFolder}
                className="flex-1 py-3 rounded-xl bg-primary-main text-white font-semibold"
              >
                {editingFolder ? 'Salvar' : 'Criar'}
              </button>
            </div>

            {/* Delete */}
            {editingFolder && !DEFAULT_FOLDERS.some(f => f.id === editingFolder.id) && (
              <button
                onClick={() => deleteFolder(editingFolder.id)}
                className="w-full mt-3 py-2 rounded-xl text-accent-error hover:bg-accent-error/10"
              >
                Excluir pasta
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
