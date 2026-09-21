import { useState } from "react";

//dnd-stuff
import { SortableContext } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import {
  updateList,
  deleteList,
  createCard,
} from "../../services/boardService";

import ConfirmModal from "../ConfirmModal/ConfirmModal";
import Card from "../Card/Card";
import "./List.css";

import toast from "react-hot-toast";

const List = ({
  list,
  boardId,
  cards,
  onListUpdated,
  onListDeleted,
  onCardsChanged,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardDescription, setCardDescription] = useState("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
  });

  const handleEdit = () => {
    setTitle(list.title);
    setIsEditing(true);
    setIsMenuOpen(false);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();

    if (!trimmedTitle || isSaving) {
      return;
    }

    try {
      setIsSaving(true);

      await updateList({
        boardId,
        listId: list.id,
        title: trimmedTitle,
      });

      onListUpdated(list.id, trimmedTitle);

      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update list:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteList({
        boardId,
        listId: list.id,
      });

      onListDeleted(list.id);
      setIsConfirmModalOpen(false);
      toast.success("List deleted Successfully!")
    } catch (error) {
      console.error("Failed to delete list:", error);
    }
  };

  const handleCreateCard = async (event) => {
    event.preventDefault();

    const trimmedTitle = cardTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      const newCard = await createCard({
        boardId,
        listId: list.id,
        title: trimmedTitle,
        description: cardDescription.trim(),
        position: cards.length,
      });

      onCardsChanged(list.id, (currentCards) => [...currentCards, newCard]);

      setCardTitle("");
      setCardDescription("");
      setIsAddingCard(false);
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  const handleCardUpdated = (cardId, newTitle, newDescription, completed) => {
    onCardsChanged(list.id, (currentCards) =>
      currentCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              title: newTitle,
              description: newDescription,
              ...(completed !== undefined && {
                completed,
              }),
            }
          : card,
      ),
    );
  };

  const handleCardDeleted = (cardId) => {
    onCardsChanged(list.id, (currentCards) =>
      currentCards.filter((card) => card.id !== cardId),
    );
  };

  return (
    <div ref={setNodeRef} className="board-list">
      <div className="board-list-header">
        {isEditing ? (
          <form className="edit-list-form" onSubmit={handleUpdate}>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
            />

            <div className="edit-list-actions">
              <button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTitle(list.title);
                  setIsEditing(false);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="board-list-title">{list.title}</h2>

            <div className="list-menu-container">
              <button
                className="list-menu-button"
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                ⋮
              </button>

              {isMenuOpen && (
                <div className="list-menu">
                  <button onClick={handleEdit}>Edit</button>

                  <button
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
          </>
        )}
      </div>

      <SortableContext items={cards.map((card) => card.id)}>
        <div className="board-list-cards">
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              boardId={boardId}
              listId={list.id}
              onCardUpdated={handleCardUpdated}
              onCardDeleted={handleCardDeleted}
            />
          ))}
        </div>
      </SortableContext>

      {isAddingCard ? (
        <form className="add-card-form" onSubmit={handleCreateCard}>
          <input
            type="text"
            value={cardTitle}
            onChange={(event) => setCardTitle(event.target.value)}
            placeholder="Enter card title..."
            autoFocus
          />

          <textarea
            value={cardDescription}
            onChange={(event) => setCardDescription(event.target.value)}
            placeholder="Enter description (optional)..."
            rows="3"
          />

          <div className="add-card-actions">
            <button type="submit" className="confirm-card-button">
              Add card
            </button>

            <button
              type="button"
              className="cancel-card-button"
              onClick={() => {
                setCardTitle("");
                setCardDescription("");
                setIsAddingCard(false);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          className="add-card-button"
          onClick={() => setIsAddingCard(true)}
        >
          + Add a card
        </button>
      )}

        {isConfirmModalOpen && (
          <ConfirmModal
            title="Delete List"
            message={`Are you sure you want to delete "${list.title}"?`}
            onConfirm={handleDelete}
            onCancel={() => setIsConfirmModalOpen(false)}
          />
        )}
    </div>
  );
};

export default List;
