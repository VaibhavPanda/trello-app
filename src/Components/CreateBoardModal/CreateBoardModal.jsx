import { useEffect, useState } from "react";

import "./CreateBoardModal.css";

const CreateBoardModal = ({
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedDescription =
      description.trim();

    if (!trimmedTitle || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      await onCreate({
        title: trimmedTitle,
        description: trimmedDescription,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={handleOverlayClick}
    >
      <div
        className="create-board-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-board-title"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="modal-header">
          <div>
            <h2 id="create-board-title">
              Create Board
            </h2>

            <p className="modal-subtitle">
              Create a workspace for your
              projects and tasks.
            </p>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close create board dialog"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="board-title">
              Board name
            </label>

            <input
              type="text"
              id="board-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              placeholder="e.g. Website Redesign"
              autoFocus
              maxLength={80}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="board-description">
              Description
              <span className="optional-label">
                Optional
              </span>
            </label>

            <textarea
              id="board-description"
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value
                )
              }
              placeholder="What is this board for?"
              rows={4}
              maxLength={300}
              disabled={isSubmitting}
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={
                !title.trim() ||
                isSubmitting
              }
            >
              {isSubmitting
                ? "Creating..."
                : "Create Board"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateBoardModal;
