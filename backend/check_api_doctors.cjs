const axios = require('axios');

async function checkDoctors() {
    try {
        const response = await axios.get('http://localhost:3000/api/doctors');
        const hiromel = response.data.data.find(d => d.full_name.includes('Hiromel'));
        if (hiromel) {
            console.log('DOCTOR_FEE:', hiromel.doctor_fee);
            console.log('CENTER_FEE:', hiromel.center_fee);
        } else {
            console.log('Hiromel not found');
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkDoctors();
