import { useState } from "react";
import "./CreateBoardModal.css"

const CreateBoardModal = ({ onClose, onCreate }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if(!title.trim()){
      return;
    }

    const newBoard = {
      id : Date.now(),
      title: title.trim(),
      description: description.trim(),
      cardCount: 0
    }

    onCreate(newBoard);
    onClose();

  };

  return (
    <div className="modal-overlay">
      <div className="create-board-modal">
        <div className="modal-header">
          <h2>Create Board</h2>
          <button className="modal-close" onClick={onClose}>
            X
          </button>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="board-title">Board Name:</label>
              <input
                type="text"
                id="board-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Board Title"
              />
              <textarea
                id="board-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe"
                rows="4"
              />
            </div>

            <div className="modal-actions">
              <button type="button" className="cancel-button" onClick={onClose}>
                Cancel
              </button>

              <button type="submit " className="submit-button">
                Create Board
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;
