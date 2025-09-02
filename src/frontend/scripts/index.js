// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get the join button
  const joinButton = document.getElementById('joinBtn');
  
  // Add click event listener to the button
  joinButton.addEventListener('click', () => {
    console.log('Join button clicked - navigating to login page');
  });
  
  // Add keyboard event listener for accessibility (Enter key)
  joinButton.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      joinButton.click();
    }
  });
});