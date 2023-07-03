const token = Cookies.get("token");

if (!token) {
  window.location.replace("./login.html");
}

const API_BASE = "http://localhost:8080";

const billsContainer = document.getElementById("bills");
const billBtn = document.getElementById("bill_btn");
const billAmount = document.getElementById("bill_amount");
const billDescription = document.getElementById("bill_description");

const getBills = async (groupId) => {
  try {
    const response = await fetch(`${API_BASE}/bills/${groupId}`, {
      headers: {
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
    });
    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      console.log(error);
    }
  } catch (error) {
    console.log(error);
}
};

const addBills = (bills) => {
  bills.forEach((bill) => {
    const billCard = document.createElement("div");
    billCard.classList.add('bill-card');
    const groupIdOfBill = document.createElement("div");
    const billAmount = document.createElement("div");
    const billDescription = document.createElement("div");

    groupIdOfBill.textContent = bill.group_id;
    billAmount.textContent = bill.amount; 
    billDescription.textContent = bill.description;

   billCard.append(groupIdOfBill, billDescription, billAmount); 
   billsContainer.append(billCard);
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const groupId = window.location.search.split('id')[1];
  const bills = await getBills(groupId);
  addBills(bills); 
});

const addBill = async (payload) => {
  try {
    const response = await fetch(`${API_BASE}/bills`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get("token")}`,
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    return console.log(error);
  }
};

billBtn.addEventListener('click', async (event) => {
  event.preventDefault();
  const billAmount = document.getElementById("bill_amount");
  const billDescription = document.getElementById("bill_description");
  const payload = {
    amount: billAmount.value,
    description: billDescription.value,
    groupId: window.location.search.split('id')[1]};
    const billInfo = await addBill(payload);
  });