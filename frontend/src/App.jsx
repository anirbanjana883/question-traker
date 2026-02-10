import React, { useEffect, useState, useCallback } from "react";
import { useSheetStore } from "./store/useSheetStore";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TopicItem from "./components/TopicItem";
import SubTopicItem from "./components/SubTopicItem";
import QuestionItem from "./components/QuestionItem";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Modal from "./components/Modal";
import { Plus, RotateCcw } from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // Imported correctly

function App() {
  const { sheet, fetchSheet, addTopic, reorderItem, searchQuery, resetSheet } =
    useSheetStore();

  // Drag State
  const [activeId, setActiveId] = useState(null);

  // Modal States
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAddTopicModalOpen, setIsAddTopicModalOpen] = useState(false);

  // Form State
  const [newTopicTitle, setNewTopicTitle] = useState("");

  useEffect(() => {
    const init = async () => {
      await toast.promise(
        fetchSheet(),
        {
          loading: 'Waking up server... (This may take ~50s on free hosting)',
          success: <b>Connected! Data loaded.</b>,
          error: <b>Server connection failed.</b>,
        },
        {
          style: {
            minWidth: '250px',
            background: '#333',
            color: '#fff',
            border: '1px solid #374151',
          },
          loading: { duration: 3000 },
        }
      );
    };
    init();
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = useCallback((event) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const overId = over.id;
    const state = useSheetStore.getState();

    let type = null;
    let sourceParentId = null;
    let destParentId = null;
    let sourceIndex = -1;
    let destIndex = -1;

    if (activeId.toString().startsWith("topic-")) {
      type = "topic";
      sourceIndex = state.sheet.topicOrder.indexOf(activeId);
      destIndex = state.sheet.topicOrder.indexOf(overId);
    } else if (activeId.toString().startsWith("sub-")) {
      type = "subTopic";
      Object.values(state.topics).forEach((t) => {
        if (t.subTopicOrder.includes(activeId)) sourceParentId = t.id;
        if (t.subTopicOrder.includes(overId)) destParentId = t.id;
      });
      if (sourceParentId && destParentId) {
        sourceIndex =
          state.topics[sourceParentId].subTopicOrder.indexOf(activeId);
        destIndex = state.topics[destParentId].subTopicOrder.indexOf(overId);
      }
    } else if (activeId.toString().startsWith("q-")) {
      type = "question";
      Object.values(state.subTopics).forEach((st) => {
        if (st.questionOrder.includes(activeId)) sourceParentId = st.id;
        if (st.questionOrder.includes(overId)) destParentId = st.id;
      });
      if (sourceParentId && destParentId) {
        sourceIndex =
          state.subTopics[sourceParentId].questionOrder.indexOf(activeId);
        destIndex = state.subTopics[destParentId].questionOrder.indexOf(overId);
      }
    }

    if (type && sourceIndex !== -1 && destIndex !== -1) {
      reorderItem(type, sourceParentId, destParentId, sourceIndex, destIndex);
    }
  }, []);


  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (newTopicTitle.trim()) {
      await toast.promise(addTopic(newTopicTitle), {
        loading: "Creating topic...",
        success: "Topic created successfully!",
        error: "Failed to create topic",
      });
      setNewTopicTitle("");
      setIsAddTopicModalOpen(false);
    }
  };

  const handleReset = async () => {
    await toast.promise(resetSheet(), {
      loading: "Resetting database...",
      success: "Factory reset complete!",
      error: "Reset failed",
    });
    setIsResetModalOpen(false);
  };

  const isSearching = searchQuery && searchQuery.trim().length > 0;

  const renderOverlayItem = () => {
    if (!activeId) return null;
    if (activeId.toString().startsWith("topic-"))
      return <TopicItem id={activeId} overlay={true} />;
    if (activeId.toString().startsWith("sub-"))
      return <SubTopicItem id={activeId} overlay={true} />;
    if (activeId.toString().startsWith("q-"))
      return <QuestionItem id={activeId} overlay={true} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-tuf-black p-8 flex flex-col items-center">
      <Toaster 
        position="bottom-right"
        containerStyle={{
          zIndex: 99999, 
        }}
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="w-full max-w-4xl">
        <header className="flex flex-col mb-8 border-b border-tuf-border pb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-tuf-red">
                {sheet.title || "My Sheet"}
              </h1>
              <p className="text-tuf-muted text-sm mt-1">
                Interactive interview preparation sheets
              </p>
            </div>

            {!isSearching && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsResetModalOpen(true)}
                  className="bg-tuf-card border border-tuf-border hover:bg-[#252525] text-tuf-muted hover:text-white px-3 py-2 rounded-md font-medium flex items-center gap-2 transition"
                  title="Reset to Default"
                >
                  <RotateCcw size={18} />
                </button>

                <button
                  onClick={() => setIsAddTopicModalOpen(true)}
                  className="bg-tuf-red hover:bg-tuf-hover text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
                >
                  <Plus size={20} /> Add Topic
                </button>
              </div>
            )}
          </div>
          <SearchBar />
        </header>

        {isSearching ? (
          <SearchResults />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <SortableContext
              items={sheet.topicOrder}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-4">
                {sheet.topicOrder.map((topicId) => (
                  <TopicItem key={topicId} id={topicId} />
                ))}
              </div>
            </SortableContext>

            <DragOverlay
              dropAnimation={{
                duration: 250,
                easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
              }}
            >
              {activeId ? (
                <div className="w-full max-w-4xl">{renderOverlayItem()}</div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset Sheet?"
      >
        <p className="text-tuf-muted mb-6">
          Are you sure you want to reset everything? This will{" "}
          <strong>delete all your custom changes</strong> and restore the
          original Striver SDE Sheet.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setIsResetModalOpen(false)}
            className="px-4 py-2 text-sm text-tuf-muted hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 font-medium"
          >
            Yes, Reset Everything
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={isAddTopicModalOpen}
        onClose={() => setIsAddTopicModalOpen(false)}
        title="Create New Topic"
      >
        <form onSubmit={handleCreateTopic} className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-tuf-muted uppercase mb-1 block">
              Topic Name
            </label>
            <input
              autoFocus
              className="w-full bg-black border border-tuf-border text-white px-3 py-2 rounded focus:border-tuf-red outline-none"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="e.g. Dynamic Programming"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddTopicModalOpen(false)}
              className="px-4 py-2 text-sm text-tuf-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-tuf-red text-white rounded hover:bg-tuf-hover font-medium"
            >
              Create Topic
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default App;