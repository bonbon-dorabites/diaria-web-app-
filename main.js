// Get all icons and windows
const icons = document.querySelectorAll('.icon');
const windows = document.querySelectorAll('.window');
const welcomeWindow = document.getElementById('welcome');

// Show the welcome window by default
window.addEventListener('load', () => {
    welcomeWindow.classList.add('active');
});

icons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
        // Remove active class from all windows
        windows.forEach(w => w.classList.remove('active'));

        // Add active class to the window based on the icon clicked
        switch (index) {
            case 0:
                document.getElementById('window1').classList.add('active');
                break;
            case 1:
                document.getElementById('window2').classList.add('active');
                break;
            case 2:
                document.getElementById('window3').classList.add('active');
                break;
        }

        // Remove active class from the welcome window if present
        welcomeWindow.classList.remove('active');

        // Add active class to the clicked icon
        icons.forEach(i => i.classList.remove('active'));
        icon.classList.add('active');

        // Move icon up and back down (simulate the up-down effect)
        setTimeout(() => {
            icon.classList.remove('active');
        }, 1000); // After 1 second, revert icon position
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Get the logo link
    const logoLink = document.getElementById('logo-link');

    // Handle click event on the logo
    logoLink.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior

        // Remove active class from all windows
        document.querySelectorAll('.window').forEach(window => {
            window.classList.remove('active');
        });

        // Add active class to the welcome window
        document.getElementById('welcome').classList.add('active');
    });
});
