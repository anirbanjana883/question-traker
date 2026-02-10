import React, { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { useSortableItem } from '../hooks/useSortableItem';
import { GripVertical, Trash2, ExternalLink, Pin, PinOff, Edit2 } from 'lucide-react';
import Modal from './Modal'; 
import toast from 'react-hot-toast';

const difficultyColors = {
  Easy: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Hard: 'text-red-400 bg-red-400/10 border-red-400/20',
};

const QuestionItem = ({ id, isPinnedSection = false, overlay = false }) => {
  const question = useSheetStore(state => state.questions[id]);
  const deleteItem = useSheetStore(state => state.deleteItem);
  const togglePin = useSheetStore(state => state.togglePin);
  const updateItem = useSheetStore(state => state.updateItem);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [editForm, setEditForm] = useState({ title: '', link: '', difficulty: 'Medium' });

  const { attributes, listeners, setNodeRef, style, isDragging } = overlay 
    ? { attributes: {}, listeners: {}, setNodeRef: null, style: {}, isDragging: false }
    : useSortableItem(id, isPinnedSection);

  if (!question) return null;


  const handleEditClick = () => {
    setEditForm({ 
      title: question.title, 
      link: question.link || '', 
      difficulty: question.difficulty || 'Medium' 
    });
    setIsEditModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editForm.title.trim()) {
      updateItem('question', id, {
        title: editForm.title,
        link: editForm.link,
        difficulty: editForm.difficulty
      });
      toast.success('Question updated!');
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = () => {
    deleteItem('question', id);
    toast.success('Question deleted');
    setIsDeleteModalOpen(false);
  };

  const handleTogglePin = () => {
    togglePin(id);
    if (question.isPinned) {
      toast('Question unpinned', { icon: '📌' });
    } else {
      toast.success('Question pinned to top!', { icon: '📌' });
    }
  };

  const difficultyClass = difficultyColors[question.difficulty] || difficultyColors.Medium;

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className={`
          relative flex items-center justify-between p-3 rounded-md border transition-all group mb-2
          ${overlay ? 'bg-tuf-card border-tuf-red shadow-2xl z-50 cursor-grabbing' : ''} 
          ${isDragging ? 'opacity-30' : 'bg-tuf-card/60 border-tuf-border hover:border-gray-600'}
          ${isPinnedSection ? 'border-l-4 border-l-tuf-red' : ''}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {!isPinnedSection && (
            <div 
              {...attributes} 
              {...listeners} 
              className="cursor-grab text-tuf-muted hover:text-white flex items-center justify-center p-1" 
              style={{ touchAction: 'none' }}
            >
              <GripVertical size={16} />
            </div>
          )}
          
          <div className="flex flex-col truncate">
            <a 
              href={question.link} 
              target="_blank" 
              rel="noreferrer" 
              className="text-sm font-medium text-gray-200 hover:text-tuf-red hover:underline flex items-center gap-1 truncate"
              onClick={(e) => e.stopPropagation()} 
            >
              {question.title}
              <ExternalLink size={12} className="opacity-50" />
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`text-xs px-2 py-0.5 rounded border ${difficultyClass}`}>
            {question.difficulty}
          </span>

          {!overlay && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={handleEditClick}
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-white/10 rounded"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>

              <button 
                onClick={handleTogglePin} 
                className={`p-1.5 rounded hover:bg-white/10 ${question.isPinned ? 'text-tuf-red' : 'text-gray-400'}`}
                title={question.isPinned ? "Unpin" : "Pin to top"}
              >
                {question.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
              </button>
              
              <button 
                onClick={() => setIsDeleteModalOpen(true)} 
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-white/10 rounded"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Question">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-tuf-muted uppercase mb-1 block">Question Title</label>
            <input 
              autoFocus
              className="w-full bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
              value={editForm.title}
              onChange={(e) => setEditForm({...editForm, title: e.target.value})}
              placeholder="Question Title"
            />
          </div>
          
          <div>
            <label className="text-xs text-tuf-muted uppercase mb-1 block">Problem Link</label>
            <input 
              className="w-full bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
              value={editForm.link}
              onChange={(e) => setEditForm({...editForm, link: e.target.value})}
              placeholder="https://leetcode.com/..."
            />
          </div>

          <div>
            <label className="text-xs text-tuf-muted uppercase mb-1 block">Difficulty</label>
            <select 
              className="w-full bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none cursor-pointer"
              value={editForm.difficulty}
              onChange={(e) => setEditForm({...editForm, difficulty: e.target.value})}
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-tuf-red text-white rounded hover:bg-tuf-hover">Save Changes</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Question?">
        <p className="text-tuf-muted mb-6">
          Are you sure you want to delete <strong>"{question.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
        </div>
      </Modal>
    </>
  );
};

export default React.memo(QuestionItem);