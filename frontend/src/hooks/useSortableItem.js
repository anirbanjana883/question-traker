import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function useSortableItem(id, disabled = false) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    // CRITICAL FIX: If dragging, remove transition so it snaps instantly to cursor
    transition: isDragging ? undefined : transition, 
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 999 : 'auto',
    willChange: isDragging ? 'transform' : 'auto',
  };

  return {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    style,
    isDragging
  };
}