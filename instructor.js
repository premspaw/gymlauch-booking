// Initialize Supabase client
const supabaseUrl = 'https://ovkfnwbzjbbhqtlsgnwh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92a2Zud2J6amJiaHF0bHNnbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNTkzODEsImV4cCI6MjA1ODYzNTM4MX0.GQ19cd5Bwe-KWudoFeIz9AmjCdEFQpOmkZtwWM_8CpE'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Get form elements
const form = document.getElementById('classForm')
const messageDiv = document.getElementById('message')
const createdClassesList = document.getElementById('createdClassesList')
const dateInput = document.getElementById('date')
const timeInput = document.getElementById('time')
const resetDateTimeButton = document.getElementById('resetDateTime')
const classNameSelect = document.getElementById('className')
const instructorSelect = document.getElementById('instructorName')
const durationSelect = document.getElementById('duration')

// Set up date restrictions
function setupDateRestrictions() {
    const today = new Date()
    const maxDate = new Date()
    maxDate.setDate(today.getDate() + 10)

    // Format dates for date input
    const todayFormatted = today.toISOString().split('T')[0]
    const maxDateFormatted = maxDate.toISOString().split('T')[0]

    // Set min and max attributes for date input
    dateInput.min = todayFormatted
    dateInput.max = maxDateFormatted

    // Set initial values
    dateInput.value = todayFormatted
    timeInput.value = today.toTimeString().slice(0, 5)
}

// Reset date and time to current
function resetDateTime() {
    const now = new Date()
    const todayFormatted = now.toISOString().split('T')[0]
    const timeFormatted = now.toTimeString().slice(0, 5)
    
    dateInput.value = todayFormatted
    timeInput.value = timeFormatted
}

// Load created classes
async function loadCreatedClasses() {
    try {
        console.log('Fetching created classes...')
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('date_time', { ascending: false })

        if (error) {
            console.error('Error fetching created classes:', error)
            throw error
        }

        console.log('Fetched created classes:', data)
        displayCreatedClasses(data)
    } catch (error) {
        showMessage('Error loading created classes: ' + error.message, 'error')
    }
}

// Display created classes
function displayCreatedClasses(classes) {
    if (!classes || classes.length === 0) {
        createdClassesList.innerHTML = '<p>No classes created yet.</p>'
        return
    }

    createdClassesList.innerHTML = classes.map(classItem => {
        const dateTime = new Date(classItem.date_time)
        // Convert from UTC to IST by adding 5 hours and 30 minutes
        const istDateTime = new Date(dateTime.getTime() + (5.5 * 60 * 60 * 1000))
        
        const formattedDate = istDateTime.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        const formattedTime = istDateTime.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        })
        
        return `
            <div class="created-class-item" data-class-id="${classItem.id}">
                <h3>${classItem.class_name}</h3>
                <p>Instructor: ${classItem.instructor_name}</p>
                <p>Date: ${formattedDate}</p>
                <p>Time: ${formattedTime}</p>
                <p>Duration: ${classItem.duration} minutes</p>
                <p>Seats: ${classItem.available_seats}/${classItem.total_seats}</p>
                <button 
                    onclick="deleteClass(${classItem.id})"
                    class="delete-button"
                >
                    Delete Class
                </button>
            </div>
        `
    }).join('')
}

// Make deleteClass function globally available
window.deleteClass = async function(classId) {
    console.log('Attempting to delete class with ID:', classId)
    if (!confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
        return
    }

    try {
        // First, check if the class exists
        const { data: existingClass, error: checkError } = await supabase
            .from('classes')
            .select('*')
            .eq('id', classId)
            .single()

        if (checkError) {
            console.error('Error checking class existence:', checkError)
            throw new Error('Error checking if class exists')
        }

        if (!existingClass) {
            throw new Error(`No class found with ID: ${classId}`)
        }

        console.log('Found class to delete:', existingClass)

        // Try to delete using match instead of eq
        const { data: deleteResult, error: deleteError } = await supabase
            .from('classes')
            .delete()
            .match({ id: classId })
            .select()

        if (deleteError) {
            console.error('Supabase delete error:', deleteError)
            throw deleteError
        }

        console.log('Delete operation result:', deleteResult)

        if (!deleteResult || deleteResult.length === 0) {
            throw new Error('Failed to delete class - no rows were affected')
        }

        // Remove from UI
        const classElement = document.querySelector(`[data-class-id="${classId}"]`)
        if (classElement) {
            classElement.remove()
        }

        showMessage('Class successfully deleted!', 'success')
        
        // Force a complete reload of the list
        setTimeout(() => {
            loadCreatedClasses()
        }, 500)
    } catch (error) {
        console.error('Delete error:', error)
        showMessage('Error deleting class: ' + error.message, 'error')
    }
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault()
    
    // Get form values
    const className = document.getElementById('className').value
    const instructorName = document.getElementById('instructorName').value
    const date = document.getElementById('date').value
    const time = document.getElementById('time').value
    const duration = parseInt(document.getElementById('duration').value)
    const seats = parseInt(document.getElementById('seats').value)

    // Validate duration
    if (!duration || ![30, 45, 60, 75, 90, 120].includes(duration)) {
        showMessage('Please select a valid duration', 'error')
        return
    }

    // Create a date object from the selected date and time
    const localDateTime = new Date(`${date}T${time}`)
    
    // Convert to UTC by subtracting 5 hours and 30 minutes (IST offset)
    const utcDateTime = new Date(localDateTime.getTime() - (5.5 * 60 * 60 * 1000))
    
    // Convert to ISO string
    const dateTime = utcDateTime.toISOString()

    try {
        console.log('Creating new class with data:', {
            className,
            instructorName,
            dateTime,
            duration,
            seats
        })

        // Insert new class into Supabase
        const { data, error } = await supabase
            .from('classes')
            .insert([
                {
                    class_name: className,
                    instructor_name: instructorName,
                    date_time: dateTime,
                    duration: duration,
                    total_seats: seats,
                    available_seats: seats
                }
            ])
            .select()

        if (error) {
            console.error('Error creating class:', error)
            throw error
        }

        console.log('Class created successfully:', data)

        // Show success message
        showMessage('Class created successfully!', 'success')
        form.reset()
        
        // Reset date and time after form reset
        resetDateTime()
        
        // Reload created classes
        loadCreatedClasses()
    } catch (error) {
        // Show error message
        showMessage('Error creating class: ' + error.message, 'error')
    }
})

// Helper function to show messages
function showMessage(text, type) {
    messageDiv.textContent = text
    messageDiv.className = type
    setTimeout(() => {
        messageDiv.textContent = ''
        messageDiv.className = ''
    }, 3000)
}

// Event Listeners
resetDateTimeButton.addEventListener('click', resetDateTime)

// Load class types from database
async function loadClassTypes() {
    try {
        console.log('Fetching class types...')
        const { data, error } = await supabase
            .from('class_types')
            .select('*')
            .order('name')

        if (error) {
            console.error('Error fetching class types:', error)
            throw error
        }

        console.log('Fetched class types:', data)
        
        // Clear existing options except the first one
        while (classNameSelect.options.length > 1) {
            classNameSelect.remove(1)
        }

        // Add new options from database
        data.forEach(type => {
            const option = document.createElement('option')
            option.value = type.name
            option.textContent = type.name
            classNameSelect.appendChild(option)
        })
    } catch (error) {
        showMessage('Error loading class types: ' + error.message, 'error')
    }
}

// Load instructors from database
async function loadInstructors() {
    try {
        console.log('Fetching instructors...')
        const { data, error } = await supabase
            .from('instructors')
            .select('*')
            .order('name')

        if (error) {
            console.error('Error fetching instructors:', error)
            throw error
        }

        console.log('Fetched instructors:', data)
        
        // Clear existing options except the first one
        while (instructorSelect.options.length > 1) {
            instructorSelect.remove(1)
        }

        // Add new options from database
        data.forEach(instructor => {
            const option = document.createElement('option')
            option.value = instructor.name
            option.textContent = instructor.name
            instructorSelect.appendChild(option)
        })
    } catch (error) {
        showMessage('Error loading instructors: ' + error.message, 'error')
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupDateRestrictions()
    loadCreatedClasses()
    loadClassTypes()
    loadInstructors()
}) 