import { create } from 'zustand';
import { apiClient } from '../api/client';

export const useSheetStore = create((set, get) => ({
  sheet: { id: '', title: '', topicOrder: [] },
  topics: {},
  subTopics: {},
  questions: {},
  isLoading: false,
  searchQuery: '',
  
  fetchSheet: async () => {
    set({ isLoading: true });
    try {
      const res = await apiClient.get('/sheet');
      set({ ...res.data.data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  addTopic: async (title) => {
    const res = await apiClient.post('/add', { type: 'topic', title });
    const newId = res.data.id;
    set(state => ({
      topics: { ...state.topics, [newId]: { id: newId, title, subTopicOrder: [] } },
      sheet: { ...state.sheet, topicOrder: [...state.sheet.topicOrder, newId] }
    }));
  },

  addSubTopic: async (parentId, title) => {
    const res = await apiClient.post('/add', { type: 'subTopic', parentId, title });
    const newId = res.data.id;
    set(state => ({
      subTopics: { ...state.subTopics, [newId]: { id: newId, title, questionOrder: [] } },
      topics: {
        ...state.topics,
        [parentId]: { ...state.topics[parentId], subTopicOrder: [...state.topics[parentId].subTopicOrder, newId] }
      }
    }));
  },

  addQuestion: async (parentId, title, link, difficulty) => {
    const res = await apiClient.post('/add', { type: 'question', parentId, title, link, difficulty });
    const newId = res.data.id;
    set(state => ({
      questions: { ...state.questions, [newId]: { id: newId, title, link, difficulty, isPinned: false } },
      subTopics: {
        ...state.subTopics,
        [parentId]: { ...state.subTopics[parentId], questionOrder: [...state.subTopics[parentId].questionOrder, newId] }
      }
    }));
  },

  togglePin: async (id) => {
    set(state => ({
      questions: { ...state.questions, [id]: { ...state.questions[id], isPinned: !state.questions[id].isPinned } }
    }));
    await apiClient.post('/pin', { id });
  },

  deleteItem: async (type, id, parentId) => {
    await apiClient.post('/delete', { type, id, parentId });
    get().fetchSheet(); 
  },

  updateItem: async (type, id, data) => {
    set(state => {
      if (type === 'topic') return { topics: { ...state.topics, [id]: { ...state.topics[id], ...data } } };
      if (type === 'subTopic') return { subTopics: { ...state.subTopics, [id]: { ...state.subTopics[id], ...data } } };
      if (type === 'question') return { questions: { ...state.questions, [id]: { ...state.questions[id], ...data } } };
      return state;
    });
    await apiClient.put('/update', { type, id, ...data });
  },

  // OPTIMIZED REORDER LOGIC
  reorderItem: async (type, sourceParentId, destParentId, sourceIndex, destIndex) => {
    set((state) => {
        const newState = { ...state }; 
        let sourceList, destList;

        if (type === 'topic') {
            newState.sheet = { ...state.sheet, topicOrder: [...state.sheet.topicOrder] };
            sourceList = newState.sheet.topicOrder;
            destList = newState.sheet.topicOrder; 
        } 
        else if (type === 'subTopic') {
             newState.topics = { ...state.topics };
             newState.topics[sourceParentId] = { ...state.topics[sourceParentId], subTopicOrder: [...state.topics[sourceParentId].subTopicOrder] };
             if (sourceParentId !== destParentId) {
                newState.topics[destParentId] = { ...state.topics[destParentId], subTopicOrder: [...state.topics[destParentId].subTopicOrder] };
             }
             sourceList = newState.topics[sourceParentId].subTopicOrder;
             destList = newState.topics[destParentId].subTopicOrder;
        } 
        else if (type === 'question') {
             newState.subTopics = { ...state.subTopics };
             newState.subTopics[sourceParentId] = { ...state.subTopics[sourceParentId], questionOrder: [...state.subTopics[sourceParentId].questionOrder] };
             if (sourceParentId !== destParentId) {
                newState.subTopics[destParentId] = { ...state.subTopics[destParentId], questionOrder: [...state.subTopics[destParentId].questionOrder] };
             }
             sourceList = newState.subTopics[sourceParentId].questionOrder;
             destList = newState.subTopics[destParentId].questionOrder;
        }

        if (sourceList && destList) {
             const [moved] = sourceList.splice(sourceIndex, 1);
             destList.splice(destIndex, 0, moved);
        }
        return newState;
    });

    try {
      await apiClient.put('/reorder', { type, sourceParentId, destParentId, sourceIndex, destIndex });
    } catch (e) {
      console.error(e);
      get().fetchSheet();
    }
  },

  resetSheet: async () => {
    try {
      set({ isLoading: true });
      await apiClient.post('/reset');
      const res = await apiClient.get('/sheet');
      set({ ...res.data.data, isLoading: false });
    } catch (err) {
      console.error(err);
      set({ isLoading: false });
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
}));