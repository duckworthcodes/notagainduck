const firebaseConfig = {
  apiKey: "AIzaSyARbW2lDKcZucJbo8lrwARvgax4Cy0NfuA",
  authDomain: "naaaabruh-ad282.firebaseapp.com",
  projectId: "naaaabruh-ad282",
  storageBucket: "naaaabruh-ad282.firebasestorage.app",
  messagingSenderId: "555946191902",
  appId: "1:555946191902:web:01ef40fb4e42acdf88120f",
  measurementId: "G-WWNFXHJ4XX"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(app);
const auth = firebase.auth();

// Array of funny loading messages
const loadingMessages = [
  "Hold on, we're summoning the code gods...",
  "Loading your awesomeness...",
  "Patience, young padawan...",
  "Brewing some coffee for the server...",
  "Counting to infinity...",
  "Spinning up the hamster wheel...",
  "Calibrating the flux capacitor...",
  "Assembling the Avengers...",
  "Warming up the quantum bits...",
  "Loading... because faster than light is illegal.",
];

document.addEventListener('DOMContentLoaded', () => {
  const audio = document.getElementById('background-music');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const musicSectionToggle = document.getElementById('music-section-toggle');
  const musicSectionContent = document.getElementById('music-section-content');
  const musicFileInput = document.getElementById('music-file-input');
  const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
  const playlistSelector = document.getElementById('playlist-selector');
  const volumeSlider = document.getElementById('volume-slider'); // Ensure this is defined

  let playlist = [];
  let currentTrackIndex = 0;

  // Debugging: Log elements to ensure they are correctly referenced
  console.log('Audio element:', audio);
  console.log('Play/Pause button:', playPauseBtn);
  console.log('Music section toggle:', musicSectionToggle);
  console.log('Music section content:', musicSectionContent);
  console.log('Music file input:', musicFileInput);
  console.log('Add to playlist button:', addToPlaylistBtn);
  console.log('Playlist selector:', playlistSelector);
  console.log('Volume slider:', volumeSlider);

  // Toggle visibility of the music section
  musicSectionToggle.addEventListener('click', () => {
    musicSectionContent.classList.toggle('visible');
  });

  // Handle file selection
  musicFileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      playlist = Array.from(files);
      updatePlaylistSelector();
    }
  });

  // Add selected files to playlist
  addToPlaylistBtn.addEventListener('click', () => {
    const files = musicFileInput.files;
    if (files.length > 0) {
      playlist = playlist.concat(Array.from(files));
      updatePlaylistSelector();
    }
  });

  // Update the playlist selector dropdown
  function updatePlaylistSelector() {
    playlistSelector.innerHTML = '';
    playlist.forEach((file, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = file.name;
      playlistSelector.appendChild(option);
    });
  }

  // Play/Pause Button
  playPauseBtn.addEventListener('click', () => {
    if (audio.paused) {
      playTrack(currentTrackIndex);
    } else {
      audio.pause();
      playPauseBtn.textContent = '🎵 Play Music';
    }
  });

  // Play a specific track from the playlist
  function playTrack(index) {
    if (index >= 0 && index < playlist.length) {
      const file = playlist[index];
      const objectURL = URL.createObjectURL(file);
      audio.src = objectURL;
      audio.play()
        .then(() => {
          console.log('Audio is playing');
          playPauseBtn.textContent = '🎵 Pause Music';
        })
        .catch((error) => {
          console.error('Error playing audio:', error);
        });
      currentTrackIndex = index;
    }
  }

  // Change track when a new option is selected
  playlistSelector.addEventListener('change', () => {
    const selectedIndex = parseInt(playlistSelector.value);
    playTrack(selectedIndex);
  });

  // Volume Control
  if (volumeSlider) { // Ensure volumeSlider exists
    volumeSlider.addEventListener('input', () => {
      if (audio) { // Ensure audio exists
        audio.volume = volumeSlider.value;
      }
    });
  } else {
    console.error('Volume slider not found!');
  }

  // Automatically play the next track when the current one ends
  audio.addEventListener('ended', () => {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(currentTrackIndex);
  });
});

// Search functionality
const searchInput = document.getElementById('search-input');
searchInput.addEventListener('input', () => {
  updateDisplay();
});

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

// Listen for authentication state changes
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

// Enhanced chart configurations
const chartOptions = {
  progress: {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodyFont: {
          family: "'Plus Jakarta Sans', sans-serif"
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif"
          }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif"
          }
        }
      }
    }
  },
  resource: {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: "'Plus Jakarta Sans', sans-serif"
          },
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        bodyFont: {
          family: "'Plus Jakarta Sans', sans-serif"
        }
      }
    }
  }
};

// Fetch projects with enhanced error handling
const fetchProjectsData = async () => {
  try {
    const snapshot = await db.collection('projects').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw new Error('Failed to fetch projects data');
  }
};

// Generate alphabet buttons
const generateAlphabetFilter = () => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const filterContainer = document.getElementById('alphabet-filter');
  filterContainer.innerHTML = 
    `<button class="alphabet-btn active" data-letter="all">All</button>
    ${alphabet.map(letter => 
      `<button class="alphabet-btn" data-letter="${letter}">${letter}</button>`
    ).join('')}`;

  // Add click handlers
  filterContainer.querySelectorAll('.alphabet-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterContainer.querySelectorAll('.alphabet-btn').forEach(b => 
        b.classList.remove('active')
      );
      btn.classList.add('active');
      updateDisplay();
    });
  });
};

// Modified filterAndSortProjects function
const filterAndSortProjects = (projects, filterStatus, filterSprint, filterResource, filterProject, sortBy, searchQuery) => {
  const selectedLetter = document.querySelector('.alphabet-btn.active').dataset.letter;
  const sortDirection = document.getElementById('sort-desc').classList.contains('active') ? -1 : 1;

  return projects
    .filter(p => {
      const statusMatch = filterStatus === 'all' || p.status === filterStatus;
      const sprintMatch = filterSprint === 'all' || p.sprint === filterSprint.replace('sprint', '');
      const resourceMatch = filterResource === 'all' || p.resources.includes(filterResource);
      const letterMatch = selectedLetter === 'all' || p.name.toUpperCase().startsWith(selectedLetter);
      const projectMatch = filterProject === 'all' || p.id === filterProject;
      const searchMatch = searchQuery === '' || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.status.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.resources.join(', ').toLowerCase().includes(searchQuery.toLowerCase());
      return statusMatch && sprintMatch && resourceMatch && letterMatch && projectMatch && searchMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': 
          return sortDirection * a.name.localeCompare(b.name);
        case 'progress': 
          return sortDirection * (b.progress - a.progress);
        case 'status': 
          return sortDirection * a.status.localeCompare(b.status);
        case 'sprint': 
          return sortDirection * (parseInt(a.sprint) - parseInt(b.sprint));
        default: 
          return 0;
      }
    });
};

// Modified displayProjects function
const displayProjects = (projects) => {
  const projectListElement = document.getElementById('project-list');
  projectListElement.innerHTML = '';

  // Group projects by first letter
  const groupedProjects = projects.reduce((acc, project) => {
    const firstLetter = project.name.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(project);
    return acc;
  }, {});

  Object.entries(groupedProjects)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([letter, letterProjects]) => {
      const groupElement = document.createElement('div');
      groupElement.classList.add('project-group');
      groupElement.innerHTML = `
        <div class="group-header">
          <span>Projects: ${letter}</span>
          <span class="project-count">${letterProjects.length} projects</span>
        </div>
        <div class="group-projects"></div>
      `;

      const groupProjectsContainer = groupElement.querySelector('.group-projects');

      letterProjects.forEach((project, index) => {
        const projectItem = document.createElement('div');
        projectItem.classList.add('project-item');
        
        const progressColor = project.status === 'completed' 
          ? 'var(--secondary-gradient)'
          : project.status === 'delayed'
            ? 'var(--danger-gradient)'
            : 'var(--warning-gradient)';

        // Format dates
        const startDate = project.startdate ? new Date(project.startdate).toLocaleDateString() : 'Not set';
        const dueDate = project.duedate ? new Date(project.duedate).toLocaleDateString() : 'Not set';

        projectItem.innerHTML = `
          <div class="project-info">
            <h4>${project.name}</h4>
            <div class="resources-list">Team: ${project.resources.join(', ')}</div>
            <div class="date-info">
              <span class="start-date">📅 Start: ${startDate}</span>
              <span class="due-date">⏰ Due: ${dueDate}</span>
            </div>
          </div>
          <div class="sprint-badge">Sprint ${project.sprint}</div>
          <div class="progress-wrapper">
            <div class="progress-bar">
              <div class="progress-fill" style="width: 0%; background: ${progressColor}"></div>
            </div>
            <div style="text-align: center; margin-top: 0.5rem">${project.progress}%</div>
          </div>
          <div class="status-badge status-${project.status}">
            ${project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </div>
          <div class="project-actions">
            <button class="button edit-btn" data-id="${project.id}">Edit</button>
            <button class="button delete-btn" data-id="${project.id}">Delete</button>
          </div>
        `;
        
        groupProjectsContainer.appendChild(projectItem);
        
        // Animate project items
        gsap.fromTo(projectItem, 
          { opacity: 0, y: 20 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.5, 
            delay: index * 0.1,
            ease: "power2.out"
          }
        );

        // Animate progress bars
        gsap.to(projectItem.querySelector('.progress-fill'), {
          width: `${project.progress}%`,
          duration: 1,
          delay: index * 0.1 + 0.3,
          ease: "power2.out"
        });
      });

      projectListElement.appendChild(groupElement);
    });

  // Add event listeners for edit and delete buttons
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const projectId = e.target.dataset.id;
      editProject(projectId);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const projectId = e.target.dataset.id;
      deleteProject(projectId);
    });
  });
};

// Enhanced statistics display with animations
const updateStats = (projects) => {
  const stats = {
    total: projects.length,
    ongoing: projects.filter(p => p.status === 'ongoing').length,
    completed: projects.filter(p => p.status === 'completed').length,
    delayed: projects.filter(p => p.status === 'delayed').length
  };

  Object.entries(stats).forEach(([key, value]) => {
    const element = document.getElementById(`${key}-projects`);
    gsap.to(element, {
      textContent: value,
      duration: 1,
      snap: { textContent: 1 },
      ease: "power2.out"
    });
  });
};

// Enhanced chart updates with animations
const updateCharts = (projects) => {
  // Destroy existing charts
  Chart.getChart('progressChart')?.destroy();
  Chart.getChart('resourceChart')?.destroy();

  // Progress Chart
  new Chart(document.getElementById('progressChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: projects.map(p => p.name),
      datasets: [{
        data: projects.map(p => p.progress),
        backgroundColor: projects.map(p => {
          return p.status === 'completed' 
            ? 'rgba(34, 197, 94, 0.7)'
            : p.status === 'delayed'
              ? 'rgba(239, 68, 68, 0.7)'
              : 'rgba(245, 158, 11, 0.7)';
        }),
        borderColor: projects.map(p => {
          return p.status === 'completed'
            ? 'rgb(34, 197, 94)'
            : p.status === 'delayed'
              ? 'rgb(239, 68, 68)'
              : 'rgb(245, 158, 11)';
        }),
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: chartOptions.progress
  });

  // Get the selected resource
  const selectedResource = document.getElementById('resource-filter').value;

  // Resource Chart - Modified to show projects for selected resource
  let resourceData = {};

  if (selectedResource !== 'all') {
    // Filter projects for the selected resource and group by status
    const filteredProjects = projects.filter(project => 
      project.resources.includes(selectedResource)
    );
    
    // Count projects by status
    resourceData = filteredProjects.reduce((acc, project) => {
      acc[project.name] = 1;  // Each project gets one count
      return acc;
    }, {});
  } else {
    // If 'all' is selected, show distribution of resources as before
    projects.forEach(project => {
      project.resources.forEach(resource => {
        resourceData[resource] = (resourceData[resource] || 0) + 1;
      });
    });
  }

  new Chart(document.getElementById('resourceChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(resourceData),
      datasets: [{
        data: Object.values(resourceData),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(14, 165, 233, 0.8)'
        ],
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 2
      }]
    },
    options: chartOptions.resource
  });
};

// Populate resource filter
const populateResourceFilter = (projects) => {
  const resources = [...new Set(projects.flatMap(p => p.resources))].sort();
  const filterElement = document.getElementById('resource-filter');
  
  filterElement.innerHTML = '<option value="all">All Resources</option>' +
    resources.map(resource => 
      `<option value="${resource}">${resource}</option>`
    ).join('');
};

// Update display with loading animation
const updateDisplay = async () => {
  const loadingOverlay = document.getElementById('loading-overlay');
  const loadingMessage = document.getElementById('loading-message'); // Ensure this element exists in your HTML

  // Randomly select a message
  const randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
  loadingMessage.textContent = randomMessage;

  loadingOverlay.style.display = 'flex';
  
  try {
    const projects = await fetchProjectsData();
    const filters = {
      status: document.getElementById('status-filter').value,
      sprint: document.getElementById('sprint-filter').value,
      resource: document.getElementById('resource-filter').value,
      project: document.getElementById('project-dropdown').value,
      sortBy: document.getElementById('sort-by').value
    };
    
    const searchQuery = document.getElementById('search-input').value;

    const filteredProjects = filterAndSortProjects(
      projects,
      filters.status,
      filters.sprint,
      filters.resource,
      filters.project,
      filters.sortBy,
      searchQuery
    );
    
    displayProjects(filteredProjects);
    updateStats(filteredProjects);
    updateCharts(filteredProjects);
  } catch (error) {
    console.error('Error updating display:', error);
  } finally {
    gsap.to(loadingOverlay, {
      opacity: 0,
      duration: 0.3,
      onComplete: () => {
        loadingOverlay.style.display = 'none';
        loadingOverlay.style.opacity = 1;
      }
    });
  }
};

// Add sort direction event listeners
document.getElementById('sort-asc').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('sort-desc').classList.remove('active');
  updateDisplay();
});

document.getElementById('sort-desc').addEventListener('click', function() {
  this.classList.add('active');
  document.getElementById('sort-asc').classList.remove('active');
  updateDisplay();
});

// Event listeners
document.querySelectorAll('select').forEach(select => {
  select.addEventListener('change', updateDisplay);
});

document.getElementById('refresh-data').addEventListener('click', () => {
  gsap.from('#refresh-data svg', {
    rotate: 360,
    duration: 1,
    ease: "power2.out"
  });
  updateDisplay();
});

document.getElementById('dark-mode-toggle').addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  
  // Animate theme switch
  gsap.from('#dark-mode-toggle svg', {
    rotate: 180,
    duration: 0.5,
    ease: "back.out"
  });
});

const populateProjectDropdown = async () => {
  try {
    const projects = await fetchProjectsData();
    const dropdownElement = document.getElementById('project-dropdown');
    
    // Clear existing options except "All Projects"
    dropdownElement.innerHTML = '<option value="all">All Projects</option>';
    
    // Add each project as an option
    projects.forEach(project => {
      const option = document.createElement('option');
      option.value = project.id;
      option.textContent = project.name;
      dropdownElement.appendChild(option);
    });
  } catch (error) {
    console.error('Error populating project dropdown:', error);
  }
};

// Modify the initialization to include alphabet filter
document.addEventListener('DOMContentLoaded', async () => {
  generateAlphabetFilter();
  await populateProjectDropdown();
  const projects = await fetchProjectsData();
  populateResourceFilter(projects);
  updateDisplay();
  
  // Add event listener for project dropdown
  document.getElementById('project-dropdown').addEventListener('change', updateDisplay);
});

document.addEventListener('mousemove', (e) => {
  const trail = document.createElement('div');
  trail.className = 'cursor-trail';
  trail.style.left = `${e.pageX}px`;
  trail.style.top = `${e.pageY}px`;
  document.body.appendChild(trail);
  setTimeout(() => trail.remove(), 500);
});

// Add Project Modal Logic
const addProjectBtn = document.getElementById('add-project-btn');
const addProjectModal = document.getElementById('add-project-modal');
const cancelProjectBtn = document.getElementById('cancel-project');
const projectForm = document.getElementById('project-form');

// Open Modal
addProjectBtn.addEventListener('click', () => {
  addProjectModal.style.display = 'flex';
});

// Close Modal
cancelProjectBtn.addEventListener('click', () => {
  addProjectModal.style.display = 'none';
});

// Handle Form Submission
projectForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const project = {
    name: document.getElementById('project-name').value,
    status: document.getElementById('project-status').value,
    sprint: document.getElementById('project-sprint').value,
    resources: document.getElementById('project-resources').value.split(',').map(res => res.trim()),
    progress: parseInt(document.getElementById('project-progress').value),
    startDate: document.getElementById('project-start-date').value,
    dueDate: document.getElementById('project-due-date').value
  };

  try {
    await db.collection('projects').add(project);
    alert('Project added successfully!');
    addProjectModal.style.display = 'none';
    projectForm.reset();
    updateDisplay();
  } catch (error) {
    console.error('Error adding project:', error);
    alert('Failed to add project. Please try again.');
  }
});

// Edit Project
const editProject = async (projectId) => {
  const projectRef = db.collection('projects').doc(projectId);
  const projectDoc = await projectRef.get();
  const project = projectDoc.data();

  document.getElementById('project-name').value = project.name;
  document.getElementById('project-status').value = project.status;
  document.getElementById('project-sprint').value = project.sprint;
  document.getElementById('project-resources').value = project.resources.join(', ');
  document.getElementById('project-progress').value = project.progress;
  document.getElementById('project-start-date').value = project.startDate || '';
  document.getElementById('project-due-date').value = project.dueDate || '';
  addProjectModal.style.display = 'flex';

  projectForm.onsubmit = async (e) => {
    e.preventDefault();

    const updatedProject = {
      name: document.getElementById('project-name').value,
      status: document.getElementById('project-status').value,
      sprint: document.getElementById('project-sprint').value,
      resources: document.getElementById('project-resources').value.split(',').map(res => res.trim()),
      progress: parseInt(document.getElementById('project-progress').value)
    };

    try {
      await projectRef.update(updatedProject);
      alert('Project updated successfully!');
      addProjectModal.style.display = 'none';
      projectForm.reset();
      updateDisplay(); // Refresh the dashboard
    } catch (error) {
      console.error('Error updating project:', error);
      alert('Failed to update project. Please try again.');
    }
  };
};

// Delete Project
const deleteProject = async (projectId) => {
  if (confirm('Are you sure you want to delete this project?')) {
    try {
      await db.collection('projects').doc(projectId).delete();
      alert('Project deleted successfully!');
      updateDisplay(); // Refresh the dashboard
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project. Please try again.');
    }
  }
};

// Firebase Authentication
const loginBtn = document.getElementById('login-btn');

// Function to handle login (assuming you have a form or method to log in the user)
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value; // Assuming you have an input field with ID 'email'
  const password = document.getElementById('password').value; // Assuming you have an input field with ID 'password'

  try {
    await auth.signInWithEmailAndPassword(email, password);
    console.log('User logged in successfully');
  } catch (error) {
    console.error('Error logging in:', error.message);
  }
});

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is logged in, hide the login button
    loginBtn.style.display = 'none';
    console.log(`Welcome, ${user.email}!`);
  } else {
    // User is logged out, show the login button
    loginBtn.style.display = 'block';
  }
});