import axios from 'axios';

async function testUpcoming() {
    try {
        const response = await axios.get('http://localhost:3000/api/doctors/1/upcoming');
        console.log('Success:', response.data.success);
        console.log('Sessions count:', response.data.data.length);
        if (response.data.data.length > 0) {
            console.log('First session:', response.data.data[0]);
        }
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testUpcoming();
