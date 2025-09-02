

  import { Clerk } from '@clerk/clerk-js'

// Get your Clerk publishable key from the .env file
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Wrap everything in an async function to avoid top-level await issues
async function initClerk() {
  const clerk = new Clerk(clerkPubKey)
  await clerk.load()

  const app = document.getElementById('app')

  if (clerk.isSignedIn) {
    // Get the current user
    const user = clerk.user
    const email = user?.primaryEmailAddress?.emailAddress

    // Extract username (everything before @)
    const username = email ? email.split('@')[0] : 'User'

    // Display welcome message + user button
    app.innerHTML = `
      <p>Welcome, <strong>${username}</strong>!</p>
      <div id="user-button"></div>
    `

    const userButtonDiv = document.getElementById('user-button')
    clerk.mountUserButton(userButtonDiv)
  } else {
    // Show sign-in UI if user is not signed in
    app.innerHTML = `<div id="sign-in"></div>`

    const signInDiv = document.getElementById('sign-in')
    clerk.mountSignIn(signInDiv)
  }
}

// Start the app
initClerk()
