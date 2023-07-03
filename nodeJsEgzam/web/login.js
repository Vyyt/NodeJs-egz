const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');


const API_BASE = "http://localhost:8080";

const onLoginUser = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    return console.log(error);
  }
};

loginBtn.addEventListener('click', async (event) => {
  event.preventDefault();

  if (!emailInput.value || !passwordInput.value) {
    alert('Please fill all inputs.');
    return;
  };
  
  const payload = {
    email: emailInput.value,
    password: passwordInput.value,
  };

  const userData = await onLoginUser(payload);

  if (userData.error || userData.error) {
    alert('Incorrect email or password.');
    return;
  };
  if (userData.token) {
    Cookies.set("token", userData.token, { expires: 1 });
    window.location.replace("./groups.html");
  };  
  });