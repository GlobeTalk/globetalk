// Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
  import { getAuth ,GoogleAuthProvider ,signInWithPopup } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js"; 

export default function LogIn(){
  const firebaseConfig = {
    apiKey: "AIzaSyCtAw-A06ZJvKXfbfpNu9D8rYurdgX0sVk",
    authDomain: "globetalk-2508c.firebaseapp.com",
    projectId: "globetalk-2508c",
    storageBucket: "globetalk-2508c.firebasestorage.app",
    messagingSenderId: "1046584624165",
    appId: "1:1046584624165:web:6ed616da6aafdb52ddebcc"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig); 
  const auth = getAuth(app);
  auth.languageCode = 'en';


  const provider = new GoogleAuthProvider();

  const googleLogin = document.getElementById("loginBtn");
  console.log("Button found:", googleLogin);

  googleLogin.addEventListener("click", function(){
  console.log("Button clicked!");
  signInWithPopup(auth, provider)
  .then((result) => {

    const user = result.user;
    console.log(user);
    
    window.location.href = "./home.html"

  }).catch((error) => {
 
     console.error("Error:", error.code, error.message);
    alert("Login failed: " + error.message);
  });

})

}
/*please have this line of code right before "</body>" on the page where the sign-in with google button will be. code: <script type="module" src="LogIn.js"></script> */