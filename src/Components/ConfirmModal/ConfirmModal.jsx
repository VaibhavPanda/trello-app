import "./ConfirmModal.css";

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div
      className="confirm-modal-overlay"
      onClick={onCancel}
      onPointerDown={(event) => event.stopPropagation()}
    >
      <div
        className="confirm-modal"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{title}</h2>

        <p>{message}</p>

        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-cancel"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            type="button"
            className="confirm-modal-delete"
            onClick={onConfirm}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
