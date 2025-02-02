let googleUserId;

window.onload = (event) => {
  // Use this to retain user state between html pages.
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      console.log('Logged in as: ' + user.displayName);
      googleUserId = user.uid;
      getNotes(googleUserId);
    } else {
      // If not logged in, navigate back to login page.
      window.location = 'index.html';
    };
  });
};

const getNotes = (userId) => {
  const notesRef = firebase.database().ref(`users/${userId}`);
  notesRef.on('value', (snapshot) => {
    const data = snapshot.val();
    renderDataAsHtml(data);
  });
};

const renderDataAsHtml = (data) => {
  let cards = ``;
  let dataArray = [];
  for (const noteItem in data) {
    const note = data[noteItem];
    const noteInformation = {
        title: note.title,
        text: note.text,
        id: noteItem
    }
    dataArray.push(noteInformation);
  };
  dataArray.sort(function(a, b) {
    var textA = a.title.toUpperCase();
    var textB = b.title.toUpperCase();
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
    });
  for (const noteItem in dataArray) {
    // For each note create an HTML card
    cards += createCard(dataArray[noteItem].title, dataArray[noteItem].text, dataArray[noteItem].id);
  };
  // Inject our string of HTML into our viewNotes.html page
  document.querySelector('#app').innerHTML = cards;
};

const createCard = (title, text, noteId) => {
  return `
    <div class="column is-one-quarter">
      <div class="card">
        <header class="card-header">
          <p class="card-header-title">${title}</p>
        </header>
        <div class="card-content">
          <div class="content">${text}</div>
        </div>
        <footer class="card-footer">
            <a href="#" class="card-footer-item" onclick="editNote('${noteId}')">
                Edit
            </a>
            <a href="#" class="card-footer-item" onclick="deleteNoteModal('${noteId}')">
                Delete
            </a>
        </footer>
      </div>
    </div>
  `;
}

const closeDeleteModal = () => {
    const deleteModal = document.querySelector("#deleteNoteModal");
    deleteModal.classList.toggle("is-active");
}

const deleteNote = () => {
    const noteId = document.querySelector("#deleteNoteId").value;
    firebase.database().ref(`users/${googleUserId}/${noteId}`).remove();
    closeDeleteModal();
}

const deleteNoteModal = (noteId) => {
    const deleteModal = document.querySelector("#deleteNoteModal");
    document.querySelector("#deleteNoteId").value = noteId;
    deleteModal.classList.toggle("is-active");
}

const editNote = (noteId) => {
    const editNoteModal = document.querySelector("#editNoteModal");
    const notesRef = firebase.database().ref(`users/${googleUserId}`);
    notesRef.on("value", (snapshot) => {
        const data = snapshot.val();
        const note = data[noteId];
        document.querySelector("#editTitleInput").value = note.title;
        document.querySelector("#editTextInput").value = note.text;
        document.querySelector("#editNoteId").value = noteId;
    });
    editNoteModal.classList.toggle("is-active");
}

const closeEditModal = () => {
    const editNoteModal = document.querySelector("#editNoteModal");
    editNoteModal.classList.toggle("is-active");
}

const saveEdittedNote = () => {
    const noteTitle = document.querySelector("#editTitleInput").value;
    const noteText = document.querySelector("#editTextInput").value;
    const noteId = document.querySelector("#editNoteId").value;
    const noteEdits = {
        title: noteTitle,
        text: noteText
    }
    firebase.database().ref(`users/${googleUserId}/${noteId}`).update(noteEdits);
    closeEditModal();
}