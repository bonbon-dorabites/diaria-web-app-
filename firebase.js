// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBuJiYI_t8AhBfKb0mWz6-poN5lmEd2_2o",
    authDomain: "diaria-bdc0f.firebaseapp.com",
    projectId: "diaria-bdc0f",
    storageBucket: "diaria-bdc0f.appspot.com",
    messagingSenderId: "583921431977",
    appId: "1:583921431977:web:164810adadd54bc83980b8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User is authenticated");
        const uid = user.uid;
        console.log("User ID: ", uid); // Debugging log
        try {
            await fetchUserData(uid);
        } catch (error) {
            console.error("Error fetching user data: ", error);
        }
    } else {
        console.log("No authenticated user");
    }
});

async function fetchUserData(uid) {
    try {
        console.log("Fetching user data for UID: ", uid); // Debugging log
        const usersCollection = collection(db, "users"); // Ensure this matches your Firestore collection name
        const q = query(usersCollection, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const userData = docSnap.data();
            console.log("User Data: ", userData); // Debugging log

            // Update profile section
            document.getElementById("fName").value = userData.firstName || '';
            document.getElementById("lName").value = userData.lastName || '';
            document.getElementById("bday").value = userData.birthday || '';
            document.getElementById("old").value = userData.age || '';
            document.getElementById("acc").value = userData.email || '';
            document.getElementById("firstName").textContent = (userData.firstName || '').split(' ')[0]+'!';
        } else {
            console.log("No matching documents found!");
        }
    } catch (error) {
        console.error("Error fetching user data: ", error);
    }
}
// Helper function to validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Calculate age based on birthday input
function calculateAge(birthday) {
    const birthDate = new Date(birthday);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Adjust age if birthday hasn't occurred yet this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        return age - 1;
    }
    return age;
}

// Update the age field when the birthday is changed
function handleBirthdayChange() {
    const birthdayInput = document.getElementById('birthday').value;
    const ageInput = document.getElementById('age');
    
    if (birthdayInput) {
        const computedAge = calculateAge(birthdayInput);
        console.log("Computed Age:", computedAge); // Debugging: Log computed age
        ageInput.value = computedAge;
    } else {
        ageInput.value = '';
    }
}

// Attach event listener to the birthday input field
document.addEventListener('DOMContentLoaded', () => {
    const birthdayInput = document.getElementById('birthday');
    if (birthdayInput) {
        birthdayInput.addEventListener('change', handleBirthdayChange);
    }
});


function showModal(message, isSuccess) {
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    const modalMessage = document.getElementById('modalMessage');

    modalMessage.textContent = message;

    // Change color based on success or error
    if (isSuccess) {
        document.querySelector('#loadingModal .modal-content').style.backgroundColor = '#d4edda';
    } else {
        document.querySelector('#loadingModal .modal-content').style.backgroundColor = '#f8d7da';
    }

    loadingModal.show();
}

function hideModal() {
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.hide();
}


async function handleSignup(event) {
    event.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const birthday = document.getElementById('birthday').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const age = document.getElementById('age').value;

    // Basic validation
    if (!firstName || !lastName || !birthday || !email || !password || !age) {
        showModal("Please fill in all required fields.", false);
        return;
    }

    // Check if email format is valid
    if (!isValidEmail(email)) {
        showModal("Please enter a valid email address.", false);
        return;
    }

    try {

        // Try to create a new user with the provided email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const uid = userCredential.user.uid;

        // Save user details to Firestore
        await addDoc(collection(db, "users"), {
            uid,
            firstName,
            lastName,
            birthday,
            age,
            email
        });

        // Simulate a delay before redirecting
        showModal("Creating account. Please wait...", true);
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    } catch (error) {
        console.error("Signup error: ", error.code, error.message)
        // Handle specific errors
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/email-already-in-use') {
            showModal("This email is already registered. Please use a different email.", false);
        } else if (errorCode === 'auth/invalid-email') {
            showModal("Invalid email format.", false);
        } else if (errorCode === 'auth/weak-password') {
            showModal("Password should be at least 6 characters.", false);
        } else {
            showModal(errorMessage, false); // Display other errors
        }
    }
}


async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Basic validation
    if (!email || !password) {
        showModal("Please fill in all required fields.", false);
        return;
    }

    // Check if email format is valid
    if (!isValidEmail(email)) {
        showModal("Please enter a valid email address.", false);
        return;
    }

    try {
        // Log the email and password for debugging
        console.log("Attempting login with:", email);

        // Try to sign in the user
        await signInWithEmailAndPassword(auth, email, password);

        // Show success message and redirect
        showModal("Redirecting to your diary booklet...", true);
        setTimeout(() => {
            window.location.href = "home.html";
        }, 2000);

    } catch (error) {
        // Log the error details for debugging
        console.error("Login error:", error.code, error.message);

        // Handle specific errors
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === 'auth/user-not-found') {
            showModal("No account found with this email. Please sign up or check your email.", false);
        } else if (errorCode === 'auth/wrong-password') {
            showModal("Incorrect password. Please try again.", false);
        } else if (errorCode === 'auth/invalid-email') {
            showModal("Invalid email format.", false);
        } else {
            showModal(errorMessage, false);
        }
    }
}


// Attach event listener when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signup');
    const loginButton = document.getElementById('login');

    if (signupButton) {
        signupButton.addEventListener("click", handleSignup);
    }

    if (loginButton) {
        loginButton.addEventListener("click", handleLogin);
    }

    // Set the current date in the calendar input for signup
    const today = new Date().toISOString().split('T')[0];
    const birthdayInput = document.getElementById('birthday');
    if (birthdayInput) {
        birthdayInput.setAttribute('max', today);
    }
});

// Monitor auth state
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User logged in:", user.uid);
        const userId = user.uid;

        // Reference to the user's document where the UID is stored
        // Update this to the actual path of the document where the UID is stored
        const userDocRef = doc(db, "users", userId);

        try {
            // Check if the user document exists
            const userDocSnapshot = await getDoc(userDocRef);

            console.log("User document exists.");

            // Event listener for the Save button
            document.getElementById("save-journal").addEventListener("click", async () => {
                const journalDate = document.getElementById("journal-date").value;
                const journalContent = document.getElementById("journal-text").value;

                // Validate that the date is selected
                if (!journalDate) {
                    alert("Please select a date.");
                    return;
                }

                try {
                    // Reference to the subcollection 'diaryEntries' under the user's document
                    const diaryEntryRef = doc(collection(userDocRef, "diaryEntries"), journalDate);

                    console.log("Diary entry reference:", diaryEntryRef);

                    // Check if the diary entry for the given date already exists
                    const docSnapshot = await getDoc(diaryEntryRef);
                    console.log("Document snapshot:", docSnapshot.exists());

                    if (docSnapshot.exists()) {
                        alert("An entry already exists for this date.");
                        console.log("Entry already exists:", docSnapshot.data());
                    } else {
                        // Create a new diary entry under the 'diaryEntries' subcollection of the user document
                        await setDoc(diaryEntryRef, {
                            content: journalContent,
                            timestamp: new Date()
                        });
                        alert("Diary entry saved successfully!");
                        console.log("New diary entry saved:", { content: journalContent, timestamp: new Date() });
                    }
                } catch (error) {
                    console.error("Error saving diary entry:", error);
                    alert("Failed to save diary entry.");
                }
            });
        } catch (error) {
            console.error("Error retrieving user document:", error);
        }
    } else {
        console.log("No user is logged in.");
        alert("Please log in to save a diary entry.");
    }
});
