import { useState } from "react";

import { updateBoard, deleteBoard } from "../../services/boardService";

import "./BoardCard.css";
import ConfirmModal from "../ConfirmModal/ConfirmModal";

const BoardCard = ({ board, onClick, onBoardUpdated, onBoardDeleted }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [isEditing, setIsEditing] = useState(false);

  const [title, setTitle] = useState(board.title);

  const [description, setDescription] = useState(board.description || "");

  const [isSaving, setIsSaving] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleEdit = () => {
    setTitle(board.title);
    setDescription(board.description || "");

    setIsMenuOpen(false);
    setIsEditing(true);
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

      await updateBoard({
        boardId: board.id,
        title: trimmedTitle,
        description: trimmedDescription,
      });

      onBoardUpdated(board.id, trimmedTitle, trimmedDescription);

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update board:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
  if (isDeleting) {
    return;
  }

  try {
    setIsDeleting(true);

    await deleteBoard({
      boardId: board.id,
    });

    onBoardDeleted(board.id);
    setIsConfirmModalOpen(false);
  } catch (error) {
    console.error(
      "Failed to delete board:",
      error
    );
  } finally {
    setIsDeleting(false);
  }
};

  const handleCardClick = (event) => {
    if (event.target.closest(".board-menu-container")) {
      return;
    }

    if (isEditing) {
      return;
    }

    onClick();
  };

  if (isEditing) {
    return (
      <form className="board-card board-edit-form" onSubmit={handleUpdate}>
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Board title"
          autoFocus
        />

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Board description"
          rows="3"
        />

        <div className="board-edit-actions">
          <button
            type="submit"
            disabled={isSaving}
            className="board-save-button"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            className="board-cancel-button"
            onClick={() => {
              setTitle(board.title);
              setDescription(board.description || "");
              setIsEditing(false);
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  }

  return (
    <div
      className={`board-card ${isMenuOpen ? "board-menu-open" : ""}`}
      onClick={handleCardClick}
    >
      <div className="board-card-header">
        <h3 className="board-card-title">{board.title}</h3>

        <div
          className="board-menu-container"
          onPointerDown={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="board-menu-button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();

              setIsMenuOpen((current) => !current);
            }}
          >
            ⋮
          </button>

          {isMenuOpen && (
            <div
              className="board-menu"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={(event) => event.stopPropagation()}
            >
              <button type="button" onClick={handleEdit}>
                Edit
              </button>

              <button
                type="button"
                className="board-delete-option"
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsConfirmModalOpen(true);
                }}
                disabled={isDeleting}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="board-card-description">{board.description}</p>

      <span className="board-card-count">{board.cardCount || 0} cards</span>
      {isConfirmModalOpen && (
        <ConfirmModal
          title="Delete Board"
          message={`Are you sure you want to delete "${board.title}"? This will also delete all lists and cards inside this board.`}
          onConfirm={handleDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BoardCard;
