import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import BoardCard from "../../Components/BoardCard/BoardCard";
import Navbar from "../../Components/Navbar/Navbar";
import CreateBoardModal from "../../Components/CreateBoardModal/CreateBoardModal";

import { AuthContext } from "../../context/AuthContext";
import { createBoard, getBoards } from "../../services/boardService";

import "./Dashboard.css";
import toast from "react-hot-toast";

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [boards, setBoards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadBoards = async () => {
      if (!user) {
        return;
      }

      try {
        const boardsFromDb = await getBoards(user.uid);
        setBoards(boardsFromDb);
      } catch (error) {
        console.error("Failed to load boards:", error);
      }
    };

    loadBoards();
  }, [user]);

  const handleCreateBoard = async (boardData) => {
    try {
      const newBoard = await createBoard({
        title: boardData.title,
        description: boardData.description,
        ownerId: user.uid,
      });

      setBoards((currentBoards) => [
        ...currentBoards,
        {
          ...newBoard,
          cardCount: 0,
        },
      ]);

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to create board:", error);
    }
  };

  const handleBoardClick = (boardId) => {
    navigate(`/board/${boardId}`);
  };

  const handleBoardUpdated = (boardId, newTitle, newDescription) => {
    setBoards((currentBoards) =>
      currentBoards.map((board) =>
        board.id === boardId
          ? {
              ...board,
              title: newTitle,
              description: newDescription,
            }
          : board,
      ),
    );
  };

  const handleBoardDeleted = (boardId) => {
    setBoards((currentBoards) =>
      currentBoards.filter((board) => board.id !== boardId),
    );
    toast.success("Board Deleted Successfully!")
  };


  return (
    <>
      <Navbar />

      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>My Boards</h1>
            <p>Manage your projects and tasks</p>
          </div>

          <button
            className="create-board-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Create Board
          </button>
        </div>

        <div className="board-grid">
          {boards.length > 0 ? (
            boards.map((board) => (
              <BoardCard
                key={board.id}
                board={board}
                onClick={() => handleBoardClick(board.id)}
                onBoardUpdated={handleBoardUpdated}
                onBoardDeleted={handleBoardDeleted}
              />
            ))
          ) : (
            <div className="empty-boards">
              <h2>No boards yet</h2>

              <p>Create your first board to start organizing your work.</p>

              <button
                className="empty-create-board-button"
                onClick={() => setIsModalOpen(true)}
              >
                + Create Board
              </button>
          </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <CreateBoardModal
          onClose={() => setIsModalOpen(false)}
          onCreate={handleCreateBoard}
        />
      )}
    </>
  );
};

export default Dashboard;
