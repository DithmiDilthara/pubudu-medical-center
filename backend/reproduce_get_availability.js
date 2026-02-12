
// Using native fetch in Node 18+
async function run() {
    try {
        console.log('Fetching availability for doctor 2...');
        const response = await fetch('http://localhost:3000/api/doctors/2/availability');
        const data = await response.json();

        console.log('Success:', data.success);
        if (data.data && data.data.length > 0) {
            console.log('Sample availability items:');
            data.data.forEach(item => {
                console.log(`- Date: ${item.specific_date} (${typeof item.specific_date}), Day: ${item.day_of_week}, Start: ${item.start_time}`);
            });
        } else {
            console.log('No availability found');
        }

    } catch (error) {
        console.error('Error:', error);
    }
}

run();
