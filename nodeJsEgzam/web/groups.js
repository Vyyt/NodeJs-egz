const token = Cookies.get("token");

if (!token) {
  window.location.replace("./login.html");
}

const API_BASE = "http://localhost:8080";

const groupsContainer = document.getElementById("groups");
const groupBtn = document.getElementById("group_btn");
const groupName = document.getElementById("group_name");

const getGroups = async () => {
  try {
    const response = await fetch(`${API_BASE}/groups`, {
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

const addGroups = (groups) => {
  groups.forEach((group) => {
    const groupCard = document.createElement("div");
    groupCard.classList.add("group-card");
    const groupId = document.createElement("h1");
    const groupName = document.createElement("p");

    groupId.textContent = `ID: ${group.id}`;
    groupName.textContent = group.name; 

    groupCard.append(groupId, groupName);
    groupsContainer.append(groupCard); 
  });
};

document.addEventListener("DOMContentLoaded", async () => {
  const groups = await getGroups();
  addGroups(groups); 
});

document.addEventListener('DOMContentLoaded', function() {
  const groupForm = document.querySelector('.add_group');
  const groupInput = document.getElementById('group_id');
  groupForm.addEventListener('submit', function(event) {
    event.preventDefault(); 
    const groupId = groupInput.value;
    window.location.href = './bills.html?=id' + groupId;
  });
});