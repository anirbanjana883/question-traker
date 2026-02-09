import React, { useState } from 'react';
import { useSheetStore } from '../store/useSheetStore';
import { useSortableItem } from '../hooks/useSortableItem';
import { GripVertical, Trash2, Edit2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SubTopicItem from './SubTopicItem';
import Modal from './Modal'; // <--- Import Modal

const TopicItem = ({ id, overlay = false }) => {
  const topic = useSheetStore(state => state.topics[id]);
  const deleteItem = useSheetStore(state => state.deleteItem);
  const updateItem = useSheetStore(state => state.updateItem);
  const addSubTopic = useSheetStore(state => state.addSubTopic);

  const [isExpanded, setIsExpanded] = useState(false);
  
  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddSubModalOpen, setIsAddSubModalOpen] = useState(false);
  
  // Form States
  const [editTitle, setEditTitle] = useState(topic?.title || '');
  const [newSubTopicTitle, setNewSubTopicTitle] = useState('');

  const { attributes, listeners, setNodeRef, style, isDragging } = overlay 
     ? { attributes: {}, listeners: {}, setNodeRef: null, style: {}, isDragging: false }
     : useSortableItem(id, false); // Removed isEditing check since we use modals now

  if (!topic) return null;

  // --- HANDLERS ---
  const handleUpdate = (e) => {
    e.preventDefault();
    if (editTitle.trim()) {
      updateItem('topic', id, { title: editTitle });
      setIsEditModalOpen(false);
    }
  };

  const handleDelete = () => {
    deleteItem('topic', id);
    setIsDeleteModalOpen(false);
  };

  const handleAddSubTopic = (e) => {
    e.preventDefault();
    if (newSubTopicTitle.trim()) {
      addSubTopic(id, newSubTopicTitle);
      setNewSubTopicTitle('');
      setIsAddSubModalOpen(false);
    }
  };

  return (
    <>
      <div 
        ref={setNodeRef} 
        style={style} 
        className={`mb-4 bg-tuf-card border rounded-lg shadow-sm 
          ${overlay ? 'border-tuf-red shadow-2xl cursor-grabbing z-50' : 'border-tuf-border'} 
          ${isDragging ? 'opacity-40' : ''}
        `}
      >
        <div className="flex items-center p-3 hover:bg-[#252525] transition-colors rounded-t-lg group">
          <div 
            {...attributes} 
            {...listeners} 
            className="cursor-grab p-1 text-tuf-muted hover:text-white flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            <GripVertical size={20} />
          </div>
          
          <button onClick={() => setIsExpanded(!isExpanded)} className="mr-2 text-tuf-red">
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </button>
          
          <div className="flex-1 ml-2">
            <h3 className="text-lg font-semibold text-tuf-text">{topic.title}</h3>
          </div>

          {!overlay && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => { setEditTitle(topic.title); setIsEditModalOpen(true); }} 
                className="p-1 text-tuf-muted hover:text-blue-400"
                title="Rename Topic"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => setIsDeleteModalOpen(true)} 
                className="p-1 text-tuf-muted hover:text-red-500"
                title="Delete Topic"
              >
                <Trash2 size={16} />
              </button>
              <button 
                onClick={() => setIsAddSubModalOpen(true)}
                className="flex items-center gap-1 px-3 py-1 bg-tuf-red text-white text-sm rounded hover:bg-tuf-hover transition"
              >
                <Plus size={14} /> SubTopic
              </button>
            </div>
          )}
        </div>

        {!overlay && isExpanded && (
          <div className="p-4 pl-8 border-t border-tuf-border bg-[#161616]">
            <SortableContext items={topic.subTopicOrder} strategy={verticalListSortingStrategy}>
              {topic.subTopicOrder.length === 0 ? (
                <p className="text-sm text-tuf-muted italic">No sub-topics yet.</p>
              ) : (
                topic.subTopicOrder.map(subId => <SubTopicItem key={subId} id={subId} />)
              )}
            </SortableContext>
          </div>
        )}
      </div>

      {/* --- MODALS --- */}
      
      {/* 1. Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Rename Topic">
        <form onSubmit={handleUpdate} className="flex flex-col gap-4">
          <input 
            autoFocus
            className="bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Topic Name"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-tuf-red text-white rounded hover:bg-tuf-hover">Save</button>
          </div>
        </form>
      </Modal>

      {/* 2. Delete Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Topic?">
        <p className="text-tuf-muted mb-6">
          Are you sure you want to delete <strong>"{topic.title}"</strong>? This will delete all sub-topics and questions inside it. This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
          <button onClick={handleDelete} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
        </div>
      </Modal>

      {/* 3. Add SubTopic Modal */}
      <Modal isOpen={isAddSubModalOpen} onClose={() => setIsAddSubModalOpen(false)} title="Add Sub-Topic">
        <form onSubmit={handleAddSubTopic} className="flex flex-col gap-4">
          <input 
            autoFocus
            className="bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
            value={newSubTopicTitle}
            onChange={(e) => setNewSubTopicTitle(e.target.value)}
            placeholder="Sub-Topic Name (e.g., Arrays Part 1)"
          />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setIsAddSubModalOpen(false)} className="px-4 py-2 text-sm text-tuf-muted hover:text-white">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-tuf-red text-white rounded hover:bg-tuf-hover">Create</button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default React.memo(TopicItem);