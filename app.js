// Initialize Supabase client
const supabaseUrl = 'https://ovkfnwbzjbbhqtlsgnwh.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92a2Zud2J6amJiaHF0bHNnbndoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNTkzODEsImV4cCI6MjA1ODYzNTM4MX0.GQ19cd5Bwe-KWudoFeIz9AmjCdEFQpOmkZtwWM_8CpE'
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey)

// Get DOM elements
const classesGrid = document.getElementById('classesGrid')
const messageDiv = document.getElementById('message')

// Format date and time
function formatDateTime(dateString) {
    // Create date object from the ISO string
    const date = new Date(dateString)
    
    // Convert from UTC to IST by adding 5 hours and 30 minutes
    const istDateTime = new Date(date.getTime() + (5.5 * 60 * 60 * 1000))
    
    // Format date
    const formattedDate = istDateTime.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    
    // Format time to 12-hour format
    const formattedTime = istDateTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    })
    
    return {
        date: formattedDate,
        time: formattedTime
    }
}

// Fetch and display classes
async function loadClasses() {
    try {
        console.log('Fetching classes...')
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('date_time', { ascending: true })

        if (error) {
            console.error('Error fetching classes:', error)
            throw error
        }

        console.log('Fetched classes:', data)
        displayClasses(data)
    } catch (error) {
        console.error('Error in loadClasses:', error)
        showMessage('Error loading classes: ' + error.message, 'error')
    }
}

// Display classes in the grid
function displayClasses(classes) {
    console.log('Displaying classes:', classes)
    if (!classes || classes.length === 0) {
        classesGrid.innerHTML = '<p>No classes available at the moment.</p>'
        return
    }

    classesGrid.innerHTML = classes.map(classItem => {
        const { date, time } = formatDateTime(classItem.date_time)
        return `
            <div class="class-card">
                <h2>${classItem.class_name}</h2>
                <p>Instructor: ${classItem.instructor_name}</p>
                <p>Date: ${date}</p>
                <p>Time: ${time}</p>
                <p>Duration: ${classItem.duration} minutes</p>
                <p>Available Seats: ${classItem.available_seats}/${classItem.total_seats}</p>
                <button 
                    onclick="bookClass(${classItem.id}, ${classItem.available_seats})"
                    ${classItem.available_seats === 0 ? 'disabled' : ''}
                >
                    ${classItem.available_seats === 0 ? 'Fully Booked' : 'Book Now'}
                </button>
            </div>
        `
    }).join('')
}

// Handle class booking
async function bookClass(classId, availableSeats) {
    if (availableSeats <= 0) {
        showMessage('Sorry, this class is fully booked!', 'error')
        return
    }

    try {
        // Update available seats
        const { data, error } = await supabase
            .from('classes')
            .update({ available_seats: availableSeats - 1 })
            .eq('id', classId)
            .select()

        if (error) throw error

        showMessage('Successfully booked the class!', 'success')
        loadClasses() // Reload classes to update the display
    } catch (error) {
        showMessage('Error booking class: ' + error.message, 'error')
    }
}

// Helper function to show messages
function showMessage(text, type) {
    messageDiv.textContent = text
    messageDiv.className = type
    setTimeout(() => {
        messageDiv.textContent = ''
        messageDiv.className = ''
    }, 3000)
}

// Load classes when the page loads
document.addEventListener('DOMContentLoaded', loadClasses)

// Set up periodic refresh to catch deleted classes
setInterval(loadClasses, 5000) 