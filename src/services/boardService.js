import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
  doc,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase";

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

  return snapshot.docs.map((docs) => ({
    id: docs.id,
    ...docs.data(),
  }));
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

export const createList = async ({ boardId, title, position }) => {
  const listsCollection = collection(db, "boards", boardId, "lists");

  const listData = { title, position, createdAt: serverTimestamp() };

  const listRef = await addDoc(listsCollection, listData);
  return {
    id: listRef.id,
    ...listData,
  };
};

export const getLists = async (boardId) => {
  const listsCollection = collection(db, "boards", boardId, "lists");
  const listQuery = query(listsCollection);

  const snapshot = await getDocs(listQuery);

  return snapshot.docs
    .map((document) => ({
      id: document.id,
      ...document.data(),
    }))
    .sort((a, b) => a.position - b.position);
};
