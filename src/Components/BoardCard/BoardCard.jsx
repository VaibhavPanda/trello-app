import { useNavigate } from "react-router-dom"
import "./BoardCard.css"

const BoardCard = ({board}) => {

  const navigate = useNavigate();

  const handleBoardClick = () =>{
    navigate(`/board/${board.id}`);
  }

  return (
    <div className="board-card" onClick={handleBoardClick}>
      <h3 className="board-card-title">
        {board.title}
      </h3>

      <p className="board-card-description">
        {board.description}
      </p>

      <span className="board-card-count">
        {board.cardCount} cards
      </span>

    </div>
  )
}

export default BoardCard
