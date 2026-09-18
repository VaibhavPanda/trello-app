import "./List.css"

const List = ({list}) =>{
  return (
    <div className="board-list">
      <div className="board-list-header">
        <h2 className="board-list-title">{list.title}</h2>
      </div>

      <div className="board-list-cards">cards</div>

      <button className="add-card-button">
        + Add a card
      </button>
    </div>
  );
}

export default List
