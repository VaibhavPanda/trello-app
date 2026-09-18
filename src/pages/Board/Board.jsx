import { useParams } from "react-router";
import Navbar from "../../Components/Navbar/Navbar";
import "./Board.css";
import { useEffect, useState } from "react";
import { createList, getBoard, getLists } from "../../services/boardService";
import List from "../../Components/List/List";

const Board = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingList, setIsAddingList] = useState(false);
  const [listTitle, setListTitle] = useState("");

  useEffect(() => {
    const loadBoard = async () => {
      try {
        const boardfromDb = await getBoard(boardId);
        setBoard(boardfromDb);
        const listFromDb = await getLists(boardId);
        setLists(listFromDb);
      } catch (error) {
        console.log(error);
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
      setListTitle("");
      setIsAddingList(false);
    } catch (error) {
      console.log(error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
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
        <div className="board-lists">
          {lists.map((list) => (
            <List key={list.id} list={list} />
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
      </main>
    </>
  );
};

export default Board;
