import { useState } from "react";

import { useSortable } from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  updateCard,
  updateCardCompletion,
  deleteCard,
} from "../../services/boardService";

import "./Card.css";
import ConfirmModal from "../ConfirmModal/ConfirmModal";
import toast from "react-hot-toast";

const Card = ({ card, boardId, listId, onCardUpdated, onCardDeleted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(card.title);

  const [description, setDescription] = useState(card.description || "");

  const [isSaving, setIsSaving] = useState(false);

  const [isCompleting, setIsCompleting] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: card.id,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleEdit = () => {
    setTitle(card.title);
    setDescription(card.description || "");

    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      await updateCard({
        boardId,
        listId,
        cardId: card.id,
        title: trimmedTitle,
        description: trimmedDescription,
      });

      onCardUpdated(card.id, trimmedTitle, trimmedDescription);

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update card:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleComplete = async (event) => {
    event.stopPropagation();

    if (isCompleting) {
      return;
    }

    const newCompletedState = !card.completed;

    try {
      setIsCompleting(true);

      await updateCardCompletion({
        boardId,
        listId,
        cardId: card.id,
        completed: newCompletedState,
      });

      onCardUpdated(
        card.id,
        card.title,
        card.description || "",
        newCompletedState,
      );
    } catch (error) {
      console.error("Failed to update card completion:", error);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCard({
        boardId,
        listId,
        cardId: card.id,
      });

      onCardDeleted(card.id);
      setIsConfirmModalOpen(false);
      toast.success("Card deleted Successfully")
    } catch (error) {
      console.error("Failed to delete card:", error);
    }
  };

  if (isEditing) {
    return (
      <form className="task-card edit-card-form" onSubmit={handleUpdate}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Card title"
          autoFocus
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Description"
          rows="3"
        />

        <div className="edit-card-actions">
          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={() => {
              setTitle(card.title);
              setDescription(card.description || "");
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  const isCompleted = card.completed === true;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isMenuOpen ? "card-menu-open" : ""} ${
        isCompleted ? "task-card-completed" : ""
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="task-card-header">
        <div className="task-card-main">
          <button
            type="button"
            className={`card-completion-button ${
              isCompleted ? "completed" : ""
            }`}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={handleToggleComplete}
            disabled={isCompleting}
            aria-label={
              isCompleted ? "Mark card as incomplete" : "Mark card as complete"
            }
          >
            {isCompleted ? "✓" : ""}
          </button>

          <div className="task-card-text">
            <h3 className="task-card-title">{card.title}</h3>

            {card.description && (
              <p className="task-card-description">{card.description}</p>
            )}
          </div>
        </div>

        <div
          className="card-menu-container"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="card-menu-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setIsMenuOpen((current) => !current)}
          >
            ⋮
          </button>

          {isMenuOpen && (
            <div
              className="card-menu"
              onPointerDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={handleEdit}
              >
                Edit
              </button>

              <button
                type="button"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsConfirmModalOpen(true);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      {isConfirmModalOpen && (
        <ConfirmModal
          title="Delete Card"
          message={`Are you sure you want to delete "${card.title}"?`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Card;
