import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

//board crud

export const createBoard = async ({ title, description, ownerId }) => {
  const boardCollection = collection(db, "boards");

  const boardData = {
    title,
    description,
    ownerId,
    createdAt: serverTimestamp(),
  };

  const boardRef = await addDoc(boardCollection, boardData);

  return {
    id: boardRef.id,
    ...boardData,
  };
};

export const getBoards = async (ownerId) => {
  const boardCollection = collection(db, "boards");

  const boardQuery = query(boardCollection, where("ownerId", "==", ownerId));

  const snapshot = await getDocs(boardQuery);

  const boards = await Promise.all(
    snapshot.docs.map(async (document) => {
      const board = {
        id: document.id,
        ...document.data(),
      };

      const listsCollection = collection(db, "boards", document.id, "lists");

      const listsSnapshot = await getDocs(listsCollection);

      const cardSnapshots = await Promise.all(
        listsSnapshot.docs.map(async (listDocument) => {
          const cardsCollection = collection(
            db,
            "boards",
            document.id,
            "lists",
            listDocument.id,
            "cards",
          );

          return getDocs(cardsCollection);
        }),
      );

      const cardCount = cardSnapshots.reduce(
        (total, cardsSnapshot) => total + cardsSnapshot.size,
        0,
      );

      return {
        ...board,
        cardCount,
      };
    }),
  );

  return boards;
};

export const getBoard = async (boardId) => {
  const boardRef = doc(db, "boards", boardId);

  const boardSnapshot = await getDoc(boardRef);

  if (!boardSnapshot.exists()) {
    return null;
  }

  return {
    id: boardSnapshot.id,
    ...boardSnapshot.data(),
  };
};

export const updateBoard = async ({ boardId, title, description }) => {
  const boardRef = doc(db, "boards", boardId);

  await updateDoc(boardRef, {
    title,
    description,
  });
};

export const deleteBoard = async ({ boardId }) => {
  const listsCollection = collection(db, "boards", boardId, "lists");

  const listsSnapshot = await getDocs(listsCollection);

  const documentsToDelete = [];

  for (const listDocument of listsSnapshot.docs) {
    const cardsCollection = collection(
      db,
      "boards",
      boardId,
      "lists",
      listDocument.id,
      "cards",
    );

    const cardsSnapshot = await getDocs(cardsCollection);

    cardsSnapshot.docs.forEach((cardDocument) => {
      documentsToDelete.push(cardDocument.ref);
    });

    documentsToDelete.push(listDocument.ref);
  }

  documentsToDelete.push(doc(db, "boards", boardId));

  const batchSize = 450;

  for (let start = 0; start < documentsToDelete.length; start += batchSize) {
    const batch = writeBatch(db);

    const currentBatch = documentsToDelete.slice(start, start + batchSize);

    currentBatch.forEach((documentRef) => {
      batch.delete(documentRef);
    });

    await batch.commit();
  }
};

//list crud

export const createList = async ({ boardId, title, position }) => {
  const listsCollection = collection(db, "boards", boardId, "lists");

  const listData = {
    title,
    position,
    createdAt: serverTimestamp(),
  };

  const listRef = await addDoc(listsCollection, listData);

  return {
    id: listRef.id,
    ...listData,
  };
};

export const getLists = async (boardId) => {
  const listsCollection = collection(db, "boards", boardId, "lists");

  const snapshot = await getDocs(query(listsCollection));

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .sort((a, b) => a.position - b.position);
};

export const updateList = async ({ boardId, listId, title }) => {
  const listRef = doc(db, "boards", boardId, "lists", listId);

  await updateDoc(listRef, {
    title,
  });
};

export const deleteList = async ({ boardId, listId }) => {
  const cardsCollection = collection(
    db,
    "boards",
    boardId,
    "lists",
    listId,
    "cards",
  );

  const cardsSnapshot = await getDocs(cardsCollection);

  const batch = writeBatch(db);

  cardsSnapshot.docs.forEach((cardDocument) => {
    batch.delete(cardDocument.ref);
  });

  const listRef = doc(db, "boards", boardId, "lists", listId);

  batch.delete(listRef);

  await batch.commit();
};

//card-crud

export const createCard = async ({
  boardId,
  listId,
  title,
  description,
  position,
}) => {
  const cardsCollection = collection(
    db,
    "boards",
    boardId,
    "lists",
    listId,
    "cards",
  );

  const cardData = {
    title,
    description,
    position,
    completed: false,
    createdAt: serverTimestamp(),
  };

  const cardRef = await addDoc(cardsCollection, cardData);

  return {
    id: cardRef.id,
    ...cardData,
  };
};

export const getCards = async ({ boardId, listId }) => {
  const cardsCollection = collection(
    db,
    "boards",
    boardId,
    "lists",
    listId,
    "cards",
  );

  const snapshot = await getDocs(cardsCollection);

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .sort((a, b) => a.position - b.position);
};

export const updateCard = async ({
  boardId,
  listId,
  cardId,
  title,
  description,
}) => {
  const cardRef = doc(db, "boards", boardId, "lists", listId, "cards", cardId);

  await updateDoc(cardRef, {
    title,
    description,
  });
};

export const updateCardCompletion = async ({
  boardId,
  listId,
  cardId,
  completed,
}) => {
  const cardRef = doc(db, "boards", boardId, "lists", listId, "cards", cardId);

  await updateDoc(cardRef, {
    completed,
  });
};

export const deleteCard = async ({ boardId, listId, cardId }) => {
  const cardRef = doc(db, "boards", boardId, "lists", listId, "cards", cardId);

  await deleteDoc(cardRef);
};

//dnd-stuff

export const updateCardPositions = async ({ boardId, listId, cards }) => {
  const batch = writeBatch(db);

  cards.forEach((card, index) => {
    const cardRef = doc(
      db,
      "boards",
      boardId,
      "lists",
      listId,
      "cards",
      card.id,
    );

    batch.update(cardRef, {
      position: index,
    });
  });

  await batch.commit();
};

export const moveCard = async ({
  boardId,
  sourceListId,
  destinationListId,
  card,
  sourceCards,
  destinationCards,
}) => {
  const batch = writeBatch(db);

  const sourceCardRef = doc(
    db,
    "boards",
    boardId,
    "lists",
    sourceListId,
    "cards",
    card.id,
  );

  const destinationCardRef = doc(
    db,
    "boards",
    boardId,
    "lists",
    destinationListId,
    "cards",
    card.id,
  );

  const movedCard = {
    title: card.title,
    description: card.description || "",
    completed: card.completed === true,
    position: destinationCards.findIndex((item) => item.id === card.id),
    createdAt: card.createdAt || serverTimestamp(),
  };

  batch.set(destinationCardRef, movedCard);

  batch.delete(sourceCardRef);

  sourceCards.forEach((sourceCard, index) => {
    const sourceRef = doc(
      db,
      "boards",
      boardId,
      "lists",
      sourceListId,
      "cards",
      sourceCard.id,
    );

    batch.update(sourceRef, {
      position: index,
    });
  });

  destinationCards.forEach((destinationCard, index) => {
    if (destinationCard.id === card.id) {
      return;
    }

    const destinationRef = doc(
      db,
      "boards",
      boardId,
      "lists",
      destinationListId,
      "cards",
      destinationCard.id,
    );

    batch.update(destinationRef, {
      position: index,
    });
  });

  await batch.commit();
};
