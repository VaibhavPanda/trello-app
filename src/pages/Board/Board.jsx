import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { DndContext, closestCenter, DragOverlay } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

import Navbar from "../../Components/Navbar/Navbar";
import List from "../../Components/List/List";
import LoadingSpinner from "../../Components/Loading/Loading";

import {
  createList,
  getBoard,
  getLists,
  getCards,
  moveCard,
  updateCardPositions,
} from "../../services/boardService";

import "./Board.css";

const Board = () => {
  const { boardId } = useParams();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");

  const [cardsByList, setCardsByList] = useState({});
  const [activeCard, setActiveCard] = useState(null);

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const boardFromDb = await getBoard(boardId);

        setBoard(boardFromDb);

        const listsFromDb = await getLists(boardId);

        setLists(listsFromDb);

        const cardsResults = await Promise.all(
          listsFromDb.map((list) =>
            getCards({
              boardId,
              listId: list.id,
            }),
          ),
        );

        const cardsData = {};

        listsFromDb.forEach((list, index) => {
          cardsData[list.id] = cardsResults[index];
        });

        setCardsByList(cardsData);
      } catch (error) {
        console.error("GET BOARD FAILED:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [boardId]);

  const handleCreateList = async (event) => {
    event.preventDefault();

    const trimmedTitle = listTitle.trim();

    if (!trimmedTitle) {
      return;
    }

    try {
      const newList = await createList({
        boardId,
        title: trimmedTitle,
        position: lists.length,
      });

      setLists((currentLists) => [...currentLists, newList]);

      setCardsByList((currentCards) => ({
        ...currentCards,
        [newList.id]: [],
      }));

      setListTitle("");
      setIsAddingList(false);
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  const handleListUpdated = (listId, newTitle) => {
    setLists((currentLists) =>
      currentLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              title: newTitle,
            }
          : list,
      ),
    );
  };

  const handleListDeleted = (listId) => {
    setLists((currentLists) =>
      currentLists.filter((list) => list.id !== listId),
    );

    setCardsByList((currentCards) => {
      const updatedCards = {
        ...currentCards,
      };

      delete updatedCards[listId];

      return updatedCards;
    });
  };

  const handleCardsChanged = (listId, updateCards) => {
    setCardsByList((currentCards) => ({
      ...currentCards,
      [listId]: updateCards(currentCards[listId] || []),
    }));
  };

  // =========================
  // DRAG AND DROP
  // =========================

  const handleDragStart = (event) => {
    const { active } = event;

    for (const listId of Object.keys(cardsByList)) {
      const cards = cardsByList[listId] || [];

      const card = cards.find((item) => item.id === active.id);

      if (card) {
        setActiveCard(card);
        break;
      }
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over) {
      setActiveCard(null);
      return;
    }

    if (active.id === over.id) {
      setActiveCard(null);
      return;
    }

    const previousCards = cardsByList;

    // Find source list
    let sourceListId = null;

    for (const listId of Object.keys(previousCards)) {
      const cards = previousCards[listId] || [];

      if (cards.some((card) => card.id === active.id)) {
        sourceListId = listId;
        break;
      }
    }

    if (!sourceListId) {
      setActiveCard(null);
      return;
    }

    // Find destination list
    let destinationListId = null;

    if (String(over.id).startsWith("list-")) {
      destinationListId = String(over.id).replace("list-", "");
    } else {
      for (const listId of Object.keys(previousCards)) {
        const cards = previousCards[listId] || [];

        if (cards.some((card) => card.id === over.id)) {
          destinationListId = listId;
          break;
        }
      }
    }

    if (!destinationListId) {
      setActiveCard(null);
      return;
    }

    const sourceCards = [...(previousCards[sourceListId] || [])];

    const destinationCards = [...(previousCards[destinationListId] || [])];

    // =========================
    // SAME LIST
    // =========================

    if (sourceListId === destinationListId) {
      const oldIndex = sourceCards.findIndex((card) => card.id === active.id);

      const newIndex = sourceCards.findIndex((card) => card.id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        setActiveCard(null);
        return;
      }

      const reorderedCards = arrayMove(sourceCards, oldIndex, newIndex);

      setCardsByList((current) => ({
        ...current,
        [sourceListId]: reorderedCards,
      }));

      try {
        await updateCardPositions({
          boardId,
          listId: sourceListId,
          cards: reorderedCards,
        });
      } catch (error) {
        console.error("Failed to save card order:", error);

        setCardsByList(previousCards);
      }

      setActiveCard(null);
      return;
    }

    // =========================
    // DIFFERENT LISTS
    // =========================

    const sourceIndex = sourceCards.findIndex((card) => card.id === active.id);

    if (sourceIndex === -1) {
      setActiveCard(null);
      return;
    }

    const [movedCard] = sourceCards.splice(sourceIndex, 1);

    const destinationIndex = destinationCards.findIndex(
      (card) => card.id === over.id,
    );

    if (destinationIndex === -1) {
      destinationCards.push(movedCard);
    } else {
      destinationCards.splice(destinationIndex, 0, movedCard);
    }

    setCardsByList((current) => ({
      ...current,
      [sourceListId]: sourceCards,
      [destinationListId]: destinationCards,
    }));

    try {
      await moveCard({
        boardId,
        sourceListId,
        destinationListId,
        card: movedCard,
        sourceCards,
        destinationCards,
      });
    } catch (error) {
      console.error("Failed to save card movement:", error);

      setCardsByList(previousCards);
    }

    setActiveCard(null);
  };

  if (loading) {
    return <LoadingSpinner message="Loading Board..."/>;
  }

  if (!board) {
    return <p>Board not found</p>;
  }

  return (
    <>
      <Navbar />

      <main className="board-page">
        <div className="board-header">
          <div>
            <h1>{board.title}</h1>
            <p>{board.description}</p>
          </div>
        </div>

        <DndContext
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveCard(null)}
        >
          <div className="board-lists">
            {lists.map((list) => (
              <List
                key={list.id}
                list={list}
                boardId={boardId}
                cards={cardsByList[list.id] || []}
                onListUpdated={handleListUpdated}
                onListDeleted={handleListDeleted}
                onCardsChanged={handleCardsChanged}
              />
            ))}

            {isAddingList ? (
              <form className="add-list-form" onSubmit={handleCreateList}>
                <input
                  type="text"
                  value={listTitle}
                  onChange={(event) => setListTitle(event.target.value)}
                  placeholder="Enter list title..."
                  autoFocus
                />

                <div className="add-list-actions">
                  <button type="submit" className="confirm-list-button">
                    Add list
                  </button>

                  <button
                    type="button"
                    className="cancel-list-button"
                    onClick={() => {
                      setListTitle("");
                      setIsAddingList(false);
                    }}
                  >
                    ×
                  </button>
                </div>
              </form>
            ) : (
              <button
                className="add-list-button"
                onClick={() => setIsAddingList(true)}
              >
                + Add another list
              </button>
            )}
          </div>

          <DragOverlay>
            {activeCard ? (
              <div className="task-card drag-overlay-card">
                <div className="task-card-header">
                  <h3 className="task-card-title">{activeCard.title}</h3>
                </div>

                {activeCard.description && (
                  <p className="task-card-description">
                    {activeCard.description}
                  </p>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>
    </>
  );
};

export default Board;
