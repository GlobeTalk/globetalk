document.addEventListener('DOMContentLoaded', () => {
  const joinButton = document.getElementById('getStartedBtn'); 

  // Click event listener
  joinButton.addEventListener('click', () => {
    window.location.href = 'login.html';
  });

  // Keyboard accessibility (Enter or Space key)
  joinButton.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault(); // prevent scrolling
      joinButton.click();
    }
  });
});
