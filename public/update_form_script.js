// Function to force input to uppercase
function forceUppercase(input) {
    input.addEventListener('input', function() {
        this.value = this.value.toUpperCase();
    });
}

// Function to hide inputs other than apptid
function hideInputs() {
    const inputsToHide = document.querySelectorAll('.update-element .mb-3');
    inputsToHide.forEach(input => {
        input.style.display = 'none';
    });
}

// Function to show inputs other than apptid
function showInputs() {
    const inputsToShow = document.querySelectorAll('.update-element .mb-3');
    inputsToShow.forEach(input => {
        input.style.display = 'block';
    });
}

// Hide inputs other than apptid on page load
hideInputs();

// Select the apptid input field
const apptidInput = document.getElementById('apptid');

// Add event listener to apptid input
apptidInput.addEventListener('input', function() {
    // Show inputs when a valid apptid is inputted
    if (isValidApptid(this.value)) {
        showInputs();
        // Call a function to fetch appointment data based on apptid
        fetchAppointmentData(this.value);
    } else {
        // Hide inputs if the apptid is not valid
        hideInputs();
    }
});

// Function to check if the apptid is valid
function isValidApptid(apptid) {
    // Perform your validation logic here, for example, checking the length or format
    return apptid.length === 10; // Example validation
}

// Function to fetch appointment data based on apptid
function fetchAppointmentData(apptid) {
    // Make a fetch request to retrieve appointment data
    fetch(`/getAppointmentData?apptid=${apptid}`)
        .then(response => response.json())
        .then(data => {
            // Populate form inputs with fetched data
            document.getElementById('pxid').value = data.pxid || '';
            document.getElementById('clinicid').value = data.clinicid || '';
            document.getElementById('status').value = data.status || '';
            document.getElementById('TimeQueued').value = data.TimeQueued || '';
            document.getElementById('QueueDate').value = data.QueueDate || '';
            document.getElementById('StartTime').value = data.StartTime || '';
            document.getElementById('EndTime').value = data.EndTime || '';
            document.getElementById('app_type').value = data.app_type || '';
        })
        .catch(error => {
            console.error('Error fetching appointment data:', error);
        });
}
