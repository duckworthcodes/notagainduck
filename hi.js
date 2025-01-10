// Create Meeting
document.getElementById('create-meeting-btn').addEventListener('click', () => {
    const title = document.getElementById('meeting-title').value;
    const date = document.getElementById('meeting-date').value;
    const time = document.getElementById('meeting-time').value;
    const agenda = document.getElementById('meeting-agenda').value;
    const userId = auth.currentUser.uid;
  
    db.collection('meetings').add({
      title,
      date,
      time,
      agenda,
      createdBy: userId,
      participants: [userId]
    })
    .then(() => {
      console.log('Meeting created');
      loadMeetings();
    })
    .catch(error => console.error('Error creating meeting:', error));
  });
  
  // Load Meetings
  function loadMeetings() {
    const userId = auth.currentUser.uid;
    db.collection('meetings')
      .where('participants', 'array-contains', userId)
      .onSnapshot(snapshot => {
        const meetingsList = document.getElementById('meetings-list');
        meetingsList.innerHTML = '';
        snapshot.forEach(doc => {
          const meeting = doc.data();
          const li = document.createElement('li');
          li.textContent = `${meeting.title} - ${meeting.date} at ${meeting.time}`;
          meetingsList.appendChild(li);
        });
      });
  }



  // Save Note
document.getElementById('save-note-btn').addEventListener('click', () => {
    const content = document.getElementById('note-content').value;
    const userId = auth.currentUser.uid;
  
    db.collection('notes').add({
      content,
      createdBy: userId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      console.log('Note saved');
      loadNotes();
    })
    .catch(error => console.error('Error saving note:', error));
  });
  
  // Load Notes
  function loadNotes() {
    const userId = auth.currentUser.uid;
    db.collection('notes')
      .where('createdBy', '==', userId)
      .onSnapshot(snapshot => {
        const notesList = document.getElementById('notes-list');
        notesList.innerHTML = '';
        snapshot.forEach(doc => {
          const note = doc.data();
          const li = document.createElement('li');
          li.textContent = note.content;
          notesList.appendChild(li);
        });
      });
  }


  auth.onAuthStateChanged(user => {
    if (user) {
      console.log(`Welcome, ${user.email}!`);
      // Load meetings and notes for the logged-in user
      loadMeetings();
      loadNotes();
    } else {
      console.log('User is logged out');
      // Clear meetings and notes if user logs out
      document.getElementById('meetings-list').innerHTML = '';
      document.getElementById('notes-list').innerHTML = '';
    }
  });