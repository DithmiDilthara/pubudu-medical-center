import axios from 'axios';

const testLogin = async () => {
  try {
    console.log('Testing login API...\n');
    
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      username: 'Anuja_01',
      password: 'Admin@123'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ Login failed!');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received from server');
      console.log('Error:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();
