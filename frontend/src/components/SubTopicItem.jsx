import React, { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { useSortableItem } from '../hooks/useSortableItem';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, Trash2, Plus, ChevronDown, ChevronRight, Edit2 } from 'lucide-react';
import QuestionItem from './QuestionItem';
import Modal from './Modal'; // <--- Import Modal

const SubTopicItem = ({ id, overlay = false }) => {
  const subTopic = useSheetStore(state => state.subTopics[id]);
  const questions = useSheetStore(state => state.questions);
  const deleteItem = useSheetStore(state => state.deleteItem);
  const addQuestion = useSheetStore(state => state.addQuestion);
  const updateItem = useSheetStore(state => state.updateItem);

  const [isExpanded, setIsExpanded] = useState(false);

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);

  // Form States
  const [editTitle, setEditTitle] = useState(subTopic?.title || '');
  const [newQuestionForm, setNewQuestionForm] = useState({ title: '', link: '', difficulty: 'Medium' });

  const { attributes, listeners, setNodeRef, style, isDragging } = overlay 
    ? { attributes: {}, listeners: {}, setNodeRef: null, style: {}, isDragging: false }
    : useSortableItem(id, false);

  if (!subTopic) return null;

  const questionIds = subTopic.questionOrder || [];
  const pinnedIds = questionIds.filter(qid => questions[qid]?.isPinned);
  const unpinnedIds = questionIds.filter(qid => !questions[qid]?.isPinned);

  // --- HANDLERS ---
  const handleUpdate = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateItem('subTopic', id, { title: editTitle });
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = () => {
    deleteItem('subTopic', id);
    setIsDeleteModalOpen(false);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (newQuestionForm.title.trim()) {
      addQuestion(id, newQuestionForm.title, newQuestionForm.link, newQuestionForm.difficulty);
      setNewQuestionForm({ title: '', link: '', difficulty: 'Medium' });
      setIsAddQuestionModalOpen(false);
    }
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className={`ml-4 mt-4 border-l-2 pl-4 
          ${overlay ? 'border-tuf-red bg-tuf-card p-3 rounded-lg shadow-2xl cursor-grabbing' : 'border-tuf-border'}
          ${isDragging ? 'opacity-40' : ''}
        `}
      >
        <div className="flex items-center gap-2 group mb-2">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab text-tuf-muted hover:text-white flex items-center justify-center p-1"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={18} />
          </div>

          <button onClick={() => setIsExpanded(!isExpanded)} className="text-tuf-red hover:text-tuf-hover">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          <div className="flex-1">
            <h4 className="text-md font-medium text-gray-200">{subTopic.title}</h4>
          </div>

          {!overlay && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={() => { setEditTitle(subTopic.title); setIsEditModalOpen(true); }} className="p-1 text-tuf-muted hover:text-blue-400"><Edit2 size={14} /></button>
               <button onClick={() => setIsDeleteModalOpen(true)} className="p-1 text-tuf-muted hover:text-red-500"><Trash2 size={14} /></button>
               <button onClick={() => setIsAddQuestionModalOpen(true)} className="flex items-center gap-1 px-2 py-0.5 bg-tuf-card border border-tuf-border text-xs rounded hover:bg-white hover:text-black transition">
                 <Plus size={12} /> Add Q
               </button>
            </div>
          )}
        </div>

        {!overlay && isExpanded && (
          <div className="flex flex-col mt-2">
            {pinnedIds.length > 0 && (
              <div className="mb-2 pb-2 border-b border-dashed border-gray-700">
                {pinnedIds.map(qid => <QuestionItem key={qid} id={qid} isPinnedSection={true} />)}
              </div>
            )}
            <SortableContext items={unpinnedIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col min-h-[10px]">
                {unpinnedIds.map(qid => <QuestionItem key={qid} id={qid} />)}
              </div>
            </SortableContext>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}

      {/* 1. Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Rename Sub-Topic">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input 
            autoFocus
            className="bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Sub-Topic Name"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-tuf-red text-white rounded hover:bg-tuf-hover">Save</button>
          </div>
        </form>
      </Modal>

      {/* 2. Delete Confirmation */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Sub-Topic?">
        <p className="text-tuf-muted mb-6">
          Are you sure you want to delete <strong>"{subTopic.title}"</strong>? This will delete all {subTopic.questionOrder.length} questions inside it.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      {/* 3. Add Question Modal */}
      <Modal isOpen={isAddQuestionModalOpen} onClose={() => setIsAddQuestionModalOpen(false)} title="Add New Question">
        <form onSubmit={handleAddQuestion} className="flex flex-col gap-3">
          <input 
            autoFocus
            required
            className="bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
            value={newQuestionForm.title}
            onChange={(e) => setNewQuestionForm({...newQuestionForm, title: e.target.value})}
            placeholder="Question Title"
          />
          <input 
            className="bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
            value={newQuestionForm.link}
            onChange={(e) => setNewQuestionForm({...newQuestionForm, link: e.target.value})}
            placeholder="Problem Link (Optional)"
          />
          <select 
            className="bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
            value={newQuestionForm.difficulty}
            onChange={(e) => setNewQuestionForm({...newQuestionForm, difficulty: e.target.value})}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={() => setIsAddQuestionModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-tuf-red text-white rounded hover:bg-tuf-hover">Add Question</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default React.memo(SubTopicItem);