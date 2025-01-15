import { db, auth } from './app.js';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.0.2/firebase-auth.js";

// Initialize Cloudinary
const cloudinary = window.cloudinary.Cloudinary.new({ cloud_name: 'dx6swplvu' });

document.addEventListener('DOMContentLoaded', async () => { // Add `async` here
  const audio = document.getElementById('background-music');
  const playPauseBtn = document.getElementById('play-pause-btn');
  const volumeSlider = document.getElementById('volume-slider');
  const trackSelector = document.getElementById('track-selector');
  const musicPlayerToggle = document.getElementById('music-player-toggle');
  const musicPlayer = document.getElementById('music-player');
  const musicPlayerContainer = document.getElementById('music-player-container');
  const audioUpload = document.getElementById('audio-upload');
  const uploadBtn = document.getElementById('upload-btn');

  // Ensure elements exist before adding event listeners
  if (!uploadBtn || !audioUpload) {
    console.error('Upload button or audio upload input not found.');
    return;
  }

  // Toggle visibility on icon click
  if (musicPlayerToggle && musicPlayer) {
    musicPlayerToggle.addEventListener('click', () => {
      musicPlayer.classList.toggle('visible');
    });
  }

  // Hide music player when clicking outside
  if (musicPlayerContainer) {
    document.addEventListener('click', (event) => {
      if (!musicPlayerContainer.contains(event.target)) {
        musicPlayer.classList.remove('visible');
      }
    });
  }

  // Set the initial track
  if (audio && trackSelector) {
    audio.src = trackSelector.value;
  }

  // Change track when a new option is selected
  if (trackSelector && audio && playPauseBtn) {
    trackSelector.addEventListener('change', () => {
      const selectedTrack = trackSelector.value;
      audio.src = selectedTrack; // Update the audio source
      audio.play(); // Automatically play the new track
      playPauseBtn.textContent = '🎵 Pause Music';
    });
  }

  // Play/Pause Button
  if (playPauseBtn && audio) {
    playPauseBtn.addEventListener('click', () => {
      if (audio.paused) {
        audio.play();
        playPauseBtn.textContent = '🎵 Pause Music';
      } else {
        audio.pause();
        playPauseBtn.textContent = '🎵 Play Music';
      }
    });
  }

  // Volume Control
  if (volumeSlider && audio) {
    volumeSlider.addEventListener('input', () => {
      audio.volume = volumeSlider.value;
      localStorage.setItem('musicVolume', volumeSlider.value); // Save volume to local storage
    });
  }

  // Load saved volume on page load
  if (volumeSlider && audio) {
    window.addEventListener('load', () => {
      const savedVolume = localStorage.getItem('musicVolume') || 0.5;
      volumeSlider.value = savedVolume;
      audio.volume = savedVolume;
    });
  }

  // Upload Audio Files to Cloudinary
  uploadBtn.addEventListener('click', async () => {
    const file = audioUpload.files[0];
    if (!file) return alert('Please select an audio file.');

    if (!auth.currentUser) {
      alert('Please log in to upload audio files.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default'); // Replace with your upload preset

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/dx6swplvu/upload`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      const fileURL = data.secure_url;

      // Save metadata to Firestore
      const userId = auth.currentUser.uid;
      await addDoc(collection(db, 'audio-files'), {
        fileName: file.name,
        fileURL,
        userId,
        createdAt: serverTimestamp()
      });

      alert('Upload complete!');
      loadAudioFiles(); // Refresh the list of tracks
    } catch (error) {
      console.error('Upload failed:', error);
    }
  });

  // Fetch and Display Audio Files
  const loadAudioFiles = async () => {
    const userId = auth.currentUser.uid;
    const trackSelector = document.getElementById('track-selector');
    if (!trackSelector) return;

    trackSelector.innerHTML = ''; // Clear previous options

    // Fetch user-uploaded files
    const userSnapshot = await getDocs(query(collection(db, 'audio-files'), where('userId', '==', userId)));
    userSnapshot.forEach(doc => {
      const audio = doc.data();
      const option = document.createElement('option');
      option.value = audio.fileURL;
      option.textContent = audio.fileName;
      trackSelector.appendChild(option);
    });

    // Fetch sample files
    const sampleSnapshot = await getDocs(query(collection(db, 'audio-files'), where('isSample', '==', true)));
    sampleSnapshot.forEach(doc => {
      const audio = doc.data();
      const option = document.createElement('option');
      option.value = audio.fileURL;
      option.textContent = `${audio.fileName} (Sample)`;
      trackSelector.appendChild(option);
    });
  };

  // Load audio files when the app loads
  loadAudioFiles();

  // Sample Tracks (Add these to Firestore if they don't exist)
  const sampleTracks = [
    { fileName: "Sample Track 1", fileURL: "https://res.cloudinary.com/dx6swplvu/video/upload/v1736653095/Kanye_West_-_Never_See_Me_Again_Instrumental_REMAKE_Orchestral_intro_kuficp.mp3", isSample: true },
    { fileName: "Sample Track 2", fileURL: "https://res.cloudinary.com/dx6swplvu/video/upload/v1736653094/Perfecto_-_Mac_Miller_Official_Instrumental_h1xr7z.mp3", isSample: true }
  ];

  // Check if sample tracks already exist
  const sampleSnapshot = await getDocs(query(collection(db, 'audio-files'), where('isSample', '==', true)));
  if (sampleSnapshot.empty) {
    sampleTracks.forEach(async (track) => {
      await addDoc(collection(db, 'audio-files'), track);
    });
  }
});