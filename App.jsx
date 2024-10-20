import React from "react";
import Sidebar from "./components/Sidebar";
import Editor from "./components/Editor";
import Split from "react-split";
import { nanoid } from "nanoid";
import { db, notesCollection } from "./firebase";
import { onSnapshot, addDoc, deleteDoc, doc, setDoc } from "firebase/firestore";

export default function App() {
  const [notes, setNotes] = React.useState(() => JSON.parse(localStorage.getItem("notes")) || []);
  const [currentNoteId, setCurrentNoteId] = React.useState(notes[0]?.id || "");

  const currentNote = notes.find((note) => note.id === currentNoteId) || notes[0];

  React.useEffect(() => {
    // localStorage.setItem("notes", JSON.stringify(notes));
    let unsubscribe = onSnapshot(notesCollection, (snapshot) => {
      //   const notes = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const notesArr = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setNotes(notesArr);

      return unsubscribe;
    });
  }, []);

  const sortedNotes = notes.sort((a, b) => b.updatedAt - a.updatedAt);

  async function createNewNote() {
    const newNote = {
      body: "# Type your markdown note's title here",
      createdAd: Date.now(),
      updatedAt: Date.now(),
    };

    // Adding new doc in firebase cloudstore.
    const newDocRef = await addDoc(notesCollection, newNote);
    setCurrentNoteId(newDocRef.id);
  }

  async function updateNote(text) {
    let docRef = doc(db, "notes", currentNote.id);
    await setDoc(docRef, { body: text, updatedAt: Date.now() }, { merge: true });
  }

  async function deleteNote(noteId) {
    // event.stopPropagation();
    // setNotes((oldNotes) => oldNotes.filter((note) => note.id !== noteId));
    let docRef = doc(db, "notes", noteId);
    await deleteDoc(docRef);
  }

  console.log(currentNote, updateNote);

  return (
    <main>
      {notes.length > 0 ? (
        <Split sizes={[30, 70]} direction="horizontal" className="split">
          <Sidebar notes={sortedNotes} currentNote={currentNote} setCurrentNoteId={setCurrentNoteId} newNote={createNewNote} deleteNote={deleteNote} />
          {currentNoteId && notes.length > 0 && <Editor currentNote={currentNote} updateNote={updateNote} />}
        </Split>
      ) : (
        <div className="no-notes">
          <h1>You have no notes</h1>
          <button className="first-note" onClick={createNewNote}>
            Create one now
          </button>
        </div>
      )}
    </main>
  );
}
