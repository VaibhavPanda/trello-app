import { useContext, useEffect, useState } from "react";
import BoardCard from "../../Components/BoardCard/BoardCard";
import Navbar from "../../Components/Navbar/Navbar";
import "./Dashboard.css";
import CreateBoardModal from "../../Components/CreateBoardModal/CreateBoardModal";
import { AuthContext } from "../../context/AuthContext";
import { createBoard, getBoards } from "../../services/boardService";

const Dashboard = () => {
  const {user} = useContext(AuthContext)
  const [boards, setBoards] = useState([]);

  useEffect(()=>{
    const loadBoards = async () => {
      if (!user) {
        return;
      }
      try {
        const boardsFromDb = await getBoards(user.uid);
        setBoards(boardsFromDb);
      } catch (error) {
        console.log(error);
      }

    };
    loadBoards();
  },[user])

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateBoard = async(boardData) => {
    try{
      const newBoard = await createBoard({
        title : boardData.title,
        description : boardData.description,
        ownerId : user.uid
      })
      setBoards((curr) => [
        ...curr,
        newBoard
      ])
    } catch(error){
      console.error(error)
    }
  };

  return (
    <>
      <Navbar />
      <main className="dashboard">
        <div className="dashboard-header">
          <div>
            <h1>My Boards</h1>
            <p>Manger your projectd and tasks</p>
          </div>

          <button
            className="create-board-button"
            onClick={() => setIsModalOpen(true)}
          >
            + Create Board
          </button>
        </div>

        <div className="board-grid">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
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
