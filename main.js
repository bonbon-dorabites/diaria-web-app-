// Get all icons and windows
const icons = document.querySelectorAll('.icon');
const windows = document.querySelectorAll('.window');

icons.forEach((icon, index) => {
    icon.addEventListener('click', () => {
        // Handle the icons animation and window change

        // Remove active class from all icons and windows
        icons.forEach(i => i.classList.remove('active'));
        windows.forEach(w => w.classList.remove('active'));

        // Add active class to clicked icon and corresponding window
        icon.classList.add('active');
        windows[index].classList.add('active');

        // Move icon up and back down (simulate the up-down effect)
        setTimeout(() => {
            icon.classList.remove('active');
        }, 1000); // After 1 second, revert icon position
    });
});