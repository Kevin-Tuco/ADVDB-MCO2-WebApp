// script.js

// Handle change in action radio buttons
const actionRadios = document.querySelectorAll('input[name="action"]');
const appointmentForm = document.getElementById('add-appointment-form');

actionRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const selectedAction = document.querySelector('input[name="action"]:checked').value;

        // Hide all form elements initially
        document.querySelectorAll('.form-element').forEach(element => {
            element.style.display = 'none';
        });

        // Show specific form elements based on the selected action
        if (selectedAction === 'add') {
            document.querySelectorAll('.add-element').forEach(element => {
                element.style.display = 'block';
            });
        } else if (selectedAction === 'update') {
            document.querySelectorAll('.update-element').forEach(element => {
                element.style.display = 'block';
            });
        } else if (selectedAction === 'delete') {
            document.querySelectorAll('.delete-element').forEach(element => {
                element.style.display = 'block';
            });
        }
    });
});

// Handle form submission
const form = document.getElementById('add-appointment-form');
form.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const selectedAction = document.querySelector('input[name="action"]:checked').value;

    if (selectedAction === 'add') {
        // Add appointment directly in JavaScript
        const formData = new FormData(form);
        const appointmentData = Object.fromEntries(formData.entries());
        console.log('Adding appointment:', appointmentData);
        // You can add your logic here to handle adding appointment
    } else if (selectedAction === 'update') {
        // Handle update logic
        console.log('Update appointment');
    } else if (selectedAction === 'delete') {
        // Handle delete logic
        console.log('Delete appointment');
    }
});
