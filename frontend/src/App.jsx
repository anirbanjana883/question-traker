import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useSheetStore } from "./store/useSheetStore";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin, // <--- 1. FASTER ALGORITHM
  DragOverlay,
  MeasuringStrategy, // <--- 2. IMPORT THIS
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
// ... imports of components remain same ...
import TopicItem from "./components/TopicItem";
import SubTopicItem from "./components/SubTopicItem";
import QuestionItem from "./components/QuestionItem";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import { Plus } from "lucide-react";

function App() {
  const { sheet, fetchSheet, addTopic, reorderItem, searchQuery } =
    useSheetStore();
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    fetchSheet();
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
    const state = useSheetStore.getState(); // Read fresh state directly without dependency

    let type = null;
    let sourceParentId = null;
    let destParentId = null;
    let sourceIndex = -1;
    let destIndex = -1;

    // Detect Type & Calculate Indexes
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
  }, []); // Empty dependency array ensures this function instance is stable

  // ... handleAddTopic, renderOverlayItem ... (Keep exactly as before)
  const handleAddTopic = () => {
    const title = prompt("Enter Topic Name:");
    if (title) addTopic(title);
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
      <div className="w-full max-w-4xl">
        <header className="flex flex-col mb-8 border-b border-tuf-border pb-6">
          {/* ... Header UI (Keep as before) ... */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-tuf-red">
                {sheet.title || "My Sheet"}
              </h1>
              <p className="text-tuf-muted text-sm mt-1">
                Organize, prioritize, and master your interview prep.
              </p>
            </div>
            {!isSearching && (
              <button
                onClick={handleAddTopic}
                className="bg-tuf-red hover:bg-tuf-hover text-white px-4 py-2 rounded-md font-medium flex items-center gap-2 transition"
              >
                <Plus size={20} /> Add Topic
              </button>
            )}
          </div>
          <SearchBar />
        </header>

        {isSearching ? (
          <SearchResults />
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin} // <--- 3. FASTER ALGORITHM
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always, // <--- 4. STABLE MEASURING
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
                <div className="w-full max-w-4xl">
                  {" "}
                  {/* FIX: Constrain width to match your main layout */}
                  {renderOverlayItem()}
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </div>
    </div>
  );
}

export default App;
