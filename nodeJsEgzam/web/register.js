const registBtn = document.getElementById('regist-btn');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const repeatPassword = document.getElementById('repeat_password');

const API_BASE = 'http://localhost:8080';

const onRegisterUser = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    return console.log(error);
  }
};

registBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  if (!nameInput.value || !emailInput.value || !passwordInput.value || !repeatPassword.value) {
    alert('Please fill all inputs.');
    return;
  };
  if (passwordInput.value !== repeatPassword.value) {
    alert('Passwords do not match.');
    return;
  };  
  const payload = {
    full_name: nameInput.value,
    email: emailInput.value,
    password: passwordInput.value,
    repeatPassword: repeatPassword.value,
   };
   const userData = await onRegisterUser(payload);
  if (userData.token) {
    Cookies.set('token', userData.token, { expires: 1 });
    window.location.replace('./groups.html');
  }
});