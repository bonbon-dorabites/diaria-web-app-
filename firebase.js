// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

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
            console.error("Error fetching user data1: 5", error);
        }
    } else {
        console.log("No authenticated user");
    }
});

    // Variables to store original values
let originalFirstName, originalLastName, originalBday, originalAge, originalEmail;

// Function to fetch user data from Firebase and initialize form
async function fetchUserData(uid) {
    try {
        console.log("Fetching user data for UID:", uid); // Debugging log
        const usersCollection = collection(db, "users"); // Ensure this matches your Firestore collection name
        const q = query(usersCollection, where("uid", "==", uid));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const userData = docSnap.data();
            console.log("User Data:", userData); // Debugging log

            // Update profile section with fetched user data
            document.getElementById("fName").value = userData.firstName || '';
            document.getElementById("lName").value = userData.lastName || '';
            document.getElementById("bday").value = userData.birthday || '';
            document.getElementById("old").value = userData.age || '';
            document.getElementById("acc").value = userData.email || '';
            document.getElementById("firstName").textContent = (userData.firstName || '').split(' ')[0] + '!';

            // Store original values
            originalFirstName = userData.firstName || '';
            originalLastName = userData.lastName || '';
            originalBday = userData.birthday || '';
            originalAge = userData.age || '';
            originalEmail = userData.email || '';

            // Setup event listeners for edit and publish actions
            setupEventListeners(docSnap.id); // Pass document ID for updating the same document
        } else {
            console.log("No matching documents found!");
        }
    } catch (error) {
        console.error("Error fetching user data:", error);
    }
}

// Function to setup event listeners for edit and publish actions
function setupEventListeners(docId) {
    // Event listener for the "Edit Details" button
    document.getElementById("edit").addEventListener("click", function (e) {
        e.preventDefault(); // Prevent page navigation

        // Enable the input fields for editing
        document.getElementById("fName").readOnly = false;
        document.getElementById("lName").readOnly = false;
        document.getElementById("bday").readOnly = false;
        document.getElementById("old").readOnly = false;
        document.getElementById("acc").readOnly = false;

        // Show Publish and Cancel Edit buttons, hide Edit Details button
        document.getElementById("edit").style.display = "none";
        document.getElementById("publish").style.display = "inline";
        document.getElementById("cancel").style.display = "inline";
    });

    // Event listener for the "Publish" button
    document.getElementById("publish").addEventListener("click", async function (e) {
        e.preventDefault(); // Prevent page navigation

        try {
            // Reference to the user's document in Firestore (using docId from fetched document)
            const userDocRef = doc(db, "users", docId);

            // Update user document with new values
            await updateDoc(userDocRef, {
                firstName: document.getElementById("fName").value,
                lastName: document.getElementById("lName").value,
                birthday: document.getElementById("bday").value,
                age: document.getElementById("old").value,
                email: document.getElementById("acc").value
            });

            // After saving, disable the inputs again
            document.getElementById("fName").readOnly = true;
            document.getElementById("lName").readOnly = true;
            document.getElementById("bday").readOnly = true;
            document.getElementById("old").readOnly = true;
            document.getElementById("acc").readOnly = true;

            // Hide Publish and Cancel Edit buttons, show Edit Details button
            document.getElementById("edit").style.display = "inline";
            document.getElementById("publish").style.display = "none";
            document.getElementById("cancel").style.display = "none";
            
            alert("Changes saved successfully to Firestore!");
        } catch (error) {
            console.error("Error saving user data to Firestore:", error);
            alert("Failed to save user data.");
        }
    });

    // Event listener for the "Cancel Edit" button
    document.getElementById("cancel").addEventListener("click", function (e) {
        e.preventDefault(); // Prevent page navigation

        // Revert to the original values
        document.getElementById("fName").value = originalFirstName;
        document.getElementById("lName").value = originalLastName;
        document.getElementById("bday").value = originalBday;
        document.getElementById("old").value = originalAge;
        document.getElementById("acc").value = originalEmail;

        // Disable the input fields again
        document.getElementById("fName").readOnly = true;
        document.getElementById("lName").readOnly = true;
        document.getElementById("bday").readOnly = true;
        document.getElementById("old").readOnly = true;
        document.getElementById("acc").readOnly = true;

        // Hide Publish and Cancel Edit buttons, show Edit Details button
        document.getElementById("edit").style.display = "inline";
        document.getElementById("publish").style.display = "none";
        document.getElementById("cancel").style.display = "none";
    });
}

// Example usage: Fetch user data once Firebase auth state changes and user is logged in
onAuthStateChanged(auth, async (user) => {
    if (user) {
        console.log("User logged in:", user.uid);
        await fetchUserData(user.uid); // Fetch user data using UID
    } else {
        console.log("No user is logged in.");
    }
});


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

document.addEventListener('DOMContentLoaded', async function() {
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
                            document.getElementById('journal-date').value = ''; // Reset the value
                            document.getElementById('journal-text').value = ''; // Reset the value
                            console.log("New diary entry saved:", { content: journalContent, timestamp: new Date() });

                            // Fetch updated entries and display them
                            const userId = user.uid; // Assuming user ID is available
                            const updatedEntries = await fetchAllDiaryEntries(userId); // Fetch updated entries
                            displayDiaryEntries(updatedEntries); // Update the display with new entries

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
        }
    }); 

    let entries = {}; // Globally accessible for storing diary entries
    const diaryContainer = document.getElementById('diaryContainer');
    const calendarSearchContainer = document.createElement('div');
    calendarSearchContainer.className = 'calendar-search-container';
    calendarSearchContainer.innerHTML = `
        <div class="calendar-container container-fluid justify-content-center align-items-center">
            <!-- Calendar Logo -->
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-calendar calendar-icon" viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5M1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
            </svg>
            <!-- Calendar Input -->
            <div class="calendar-popup">
                <input type="date" id="calendarInput" class="calendar-input">
            </div>
            <div id="search" class="search-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-search search-icon" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
            </div>
        </div>`;
    diaryContainer.parentElement.insertBefore(calendarSearchContainer, diaryContainer);

    // Toggle calendar popup visibility
    const calendarIcon = calendarSearchContainer.querySelector('.calendar-icon');
    const calendarPopup = calendarSearchContainer.querySelector('.calendar-popup');
    calendarIcon.addEventListener('click', function() {
        calendarPopup.style.display = calendarPopup.style.display === 'none' ? 'block' : 'none';
    });

    // Date input change event listener
    const calendarInput = document.getElementById('calendarInput');
    calendarInput.addEventListener('change', function() {
        const selectedDate = calendarInput.value;
        console.log('Selected date:', selectedDate);
    });

    // Search functionality
    const searchIcon = document.getElementById('search');
    searchIcon.addEventListener('click', function () {
        const selectedDate = calendarInput.value;
        if (selectedDate) {
            searchDiaryEntriesByDate(entries, selectedDate); // Ensure correct function name
        } else {
            alert("Please select a date.");
        }
    });

    // Fetch all diary entries on page load
    try {
        const userId = await getCurrentUserId();
        entries = await fetchAllDiaryEntries(userId); // Store all diary entries globally
        
        if (entries && Object.keys(entries).length > 0) {
            displayDiaryEntries(entries); // Display all entries
            calendarSearchContainer.style.display = 'flex';
        } else {
            diaryContainer.innerHTML = `<p>Oops! No diary entries found.</p>`;
            calendarSearchContainer.style.display = 'none';
        }
    } catch (error) {
        console.error('Error fetching diary entries:', error);
        diaryContainer.innerHTML = `<p>Error fetching diary entries.</p>`;
        calendarSearchContainer.style.display = 'none';
    }

    function searchDiaryEntriesByDate(entries, selectedDate) {
        const diaryContainer = document.getElementById('diaryContainer');
        diaryContainer.innerHTML = ''; // Clear existing entries
    
        // Log the entries object to inspect its structure
        console.log('Entries Object:', entries);
    
        // Parse selectedDate to Date object and extract year, month, and day
        const searchDate = new Date(selectedDate);
        const searchYear = searchDate.getFullYear();
        const searchMonth = searchDate.getMonth() + 1; // Months are 0-based, so add 1
        const searchDay = searchDate.getDate();
    
        // Log parsed date values
        console.log('Selected Date:', selectedDate);
        console.log('Search Date:', searchDate);
        console.log('Search Year:', searchYear);
        console.log('Search Month:', searchMonth);
        console.log('Search Day:', searchDay);
    
        // Format the date string
        const formattedDate = `${searchYear}-${searchMonth.toString().padStart(2, '0')}-${searchDay.toString().padStart(2, '0')}`;
    
        // Add "Display All" button
        const displayAllButton = document.createElement('button');
        displayAllButton.classList.add('display-all-btn');
        displayAllButton.textContent = 'Display All';
        displayAllButton.addEventListener('click', function() {
            displayDiaryEntries(entries); // Redisplay all diary entries
        });
    
        // Check if entries for the selected year and month exist
        if (entries[searchYear] && entries[searchYear][searchMonth]) {
            const matchingEntries = entries[searchYear][searchMonth].filter(entry => entry.day === searchDay);
    
            if (matchingEntries.length > 0) {
                matchingEntries.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('entry-box');
                    entryDiv.innerHTML = `
                        <div class="entry">
                            <span class="details-date">${searchYear}-${searchMonth.toString().padStart(2, '0')}-${searchDay.toString().padStart(2, '0')}</span>
                            <button class="details-btn" data-year="${searchYear}" data-month="${searchMonth}" data-day="${searchDay}">Details</button>
                        </div>
                    `;
                    diaryContainer.appendChild(entryDiv);
    
                    // Add details button functionality
                    const detailsBtn = entryDiv.querySelector('.details-btn');
                    detailsBtn.addEventListener('click', function () {
                        displayDetails(entry, searchYear, searchMonth, searchDay); // Show details for the clicked entry
                    });
                });
            } else {
                diaryContainer.innerHTML = `<p>No entries found for ${formattedDate}.</p>`;
            }
        } else {
            diaryContainer.innerHTML = `<p>No entries found for ${formattedDate}.</p>`;
        }
    
        // Append the "Display All" button at the end
        diaryContainer.appendChild(displayAllButton);
    
        // Reset the calendar input field
        document.getElementById('calendarInput').value = ''; // Reset the value
    }
    
    
    // Function to fetch diary entries from Firestore
    async function fetchAllDiaryEntries(userId) {
        try {
            const diaryEntriesRef = collection(db, 'users', userId, 'diaryEntries');
            const diaryEntriesSnap = await getDocs(diaryEntriesRef);

            if (diaryEntriesSnap.empty) {
                console.log('Oops! No diary entries found.');
                return {}; // Return an empty object if no entries found
            }

            const entries = {};
            diaryEntriesSnap.forEach(doc => {
                const data = doc.data();
                const entryDate = new Date(doc.id); // Assuming the document ID is the date
                const year = entryDate.getFullYear();
                const month = entryDate.getMonth() + 1; // Months are 0-based, so add 1
                const day = entryDate.getDate();

                if (!entries[year]) entries[year] = {};
                if (!entries[year][month]) entries[year][month] = [];

                entries[year][month].push({
                    day: day,
                    content: data.content || 'No content available'
                });
            });

            return entries;
        } catch (error) {
            console.error('Error fetching diary entries:', error);
            throw error;
        }
    }

    function displayDetails(entry, year, month, day) {
        const diaryContainer = document.getElementById('diaryContainer');
        
        // Clear existing content and add detailed view
        diaryContainer.innerHTML = ''; 
    
        // Log each part of the entry for debugging
        console.log('Year:', year);
        console.log('Month:', month);
        console.log('Day:', day);
        console.log('Content:', entry.content);
    
        // Construct the entry date
        const entryDate = year && month && day
            ? `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
            : 'Unknown Date';
    
        // Create the details view
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('details-view');
        
        // Populate the content of the details view
        detailsDiv.innerHTML = `
            <h2>${entryDate}</h2>
            <p>${entry.content || 'No content available'}</p>
            <button class="go-back-btn">Go Back to All Entries</button>
        `;
        diaryContainer.appendChild(detailsDiv);
    
        // Add functionality to the "Go Back" button
        const goBackBtn = detailsDiv.querySelector('.go-back-btn');
        goBackBtn.addEventListener('click', function() {
            displayDiaryEntries(entries); // Redisplay all entries when going back
        });
    }
    
    
    function displayDiaryEntries(entries) {
        const diaryContainer = document.getElementById('diaryContainer');
        diaryContainer.innerHTML = ''; // Clear existing entries
    
        if (!entries || Object.keys(entries).length === 0) {
            diaryContainer.innerHTML = `<p>No diary entries found.</p>`;
            return;
        }
    
        const years = Object.keys(entries).sort((a, b) => b - a);
    
        years.forEach(year => {
            // Year section - outside of the flex container
            const yearDiv = document.createElement('div');
            yearDiv.classList.add('year');
            yearDiv.innerHTML = `<br><hr><h1 class="year-title">${year}</h1><br>`;
            diaryContainer.appendChild(yearDiv);
    
            const months = Object.keys(entries[year]).sort((a, b) => b - a);
    
            months.forEach(month => {
                // Month-Year section - below the year title but above the entries
                const monthYearTitle = document.createElement('div');
                monthYearTitle.classList.add('month-year-title');
                monthYearTitle.innerHTML = `<h3>${getMonthName(month)} ${year}</h3>`;
                diaryContainer.appendChild(monthYearTitle);
    
                // Container for entries of that particular month (flexbox applied here)
                const flexContainer = document.createElement('div');
                flexContainer.classList.add('flex-container'); // Flex container for entries
                diaryContainer.appendChild(flexContainer);
    
                const days = entries[year][month].sort((a, b) => a.day - b.day);
    
                days.forEach(entry => {
                    const entryDiv = document.createElement('div');
                    entryDiv.classList.add('entry-box');
                    entryDiv.innerHTML = `
                        <div class="entry">
                            <span class="details-date">${year}-${month.toString().padStart(2, '0')}-${entry.day.toString().padStart(2, '0')}
                            &nbsp&nbsp&nbsp<button class="details-btn" data-year="${year}" data-month="${month}" data-day="${entry.day}">Details</button></span>
                        </div>
                    `;
                    flexContainer.appendChild(entryDiv);
                });
            });
        });
    
        // Add event listeners to details buttons
        document.querySelectorAll('.details-btn').forEach(button => {
            button.addEventListener('click', function() {
                const year = this.getAttribute('data-year');
                const month = this.getAttribute('data-month');
                const day = this.getAttribute('data-day');
    
                console.log('Button clicked:', { year, month, day });
    
                const entry = entries[year]?.[month]?.find(e => e.day === parseInt(day));
                if (entry) {
                    displayDetails(entry, year, month, day);
                } else {
                    console.error('Entry not found:', { year, month, day });
                }
            });
        });
    }
    
    

    

    // Utility to get month name from number
    function getMonthName(monthNumber) {
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return monthNames[monthNumber - 1];
    }

    // Placeholder function to get the current logged-in user's UID
    async function getCurrentUserId() {
        return new Promise((resolve, reject) => {
            onAuthStateChanged(auth, (user) => {
                if (user) {
                    resolve(user.uid);
                } else {
                    reject('No user is signed in.');
                }
            });
        });
    }
});

