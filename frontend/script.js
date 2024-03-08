
// http://34.207.185.225:3000/api/expenses
// const baseUrl = "https://34.207.185.225:3000/api/";
const baseUrl = "http://localhost:3000/api/";

const chatInput = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');
const amountInput = document.getElementById('amount');
const descriptionInput = document.getElementById('description');
const categoryInput = document.getElementById('category');
const idInput = document.getElementById('id');
const btn = document.getElementById('btn');

const leaderBoard = document.getElementById('leader-board');
const leaderBoardHeading = document.getElementById('leader-board-heading');

const expensesDiv = document.getElementById('expenses-div');
const paginationElement = document.getElementById('pagination');

const rowsPerPageElement = document.getElementById('r_p_page');

const accountDiv = document.getElementById('account-div')
const userList = document.getElementById('userList')
const chatGroup = document.getElementById('chatGroup')



async function addChat(e) {

  try {
    e.preventDefault();
    const chatVal = chatInput.value.trim();
    const newMessage = {
      message: chatVal,
    };
    // add to server
    await axios.post(baseUrl + 'add-chat', newMessage, { headers: { Authorization: getToken() } })

    chatInput.value = '';
    await displayChats();
    scrollToBottom();
  } catch (err) {
    console.log(err)
  }
}


async function displayChats() {

  try {

    let localChats;
    let lastChatId;
    let LastIndex;
    const localChatsString = localStorage.getItem('chats');
    if (localChatsString) {

      localChats = JSON.parse(localChatsString);
      LastIndex = localChats.length - 1;
      if (LastIndex > 50) {
        localChats = localChats.filter((chat, index) => index > 25);
        LastIndex = localChats.length - 1;
      }

      lastChatId = localChats[LastIndex]['id'];

    } else {
      lastChatId = 0;
    }

    // checkPremium();
    const res = await axios.get(baseUrl + `chats?lastChatId=${lastChatId}`, { headers: { "Authorization": getToken() } })


    const chats = res.data.chats;

    // console.log(chats);
    if (chats.length > 0) {

      if (localChatsString) {
        localChats = [...localChats, ...chats];
      } else {
        localChats = chats
      }
      localStorage.setItem('chats', JSON.stringify(localChats));
    }

    chatContainer.innerHTML = '';
    localChats.forEach((chat) => {
      const div = document.createElement('div');
      // Set the class attribute with all the classes
      div.setAttribute("class", "message-container");

      const dateTimeString = chat.createdAt;
      const dateObject = new Date(dateTimeString);
      const timeString = dateObject.toLocaleTimeString([], { hour12: true });

      div.innerHTML = `
      <div class="message bg-light p-2 mb-2">${chat.user.name}:  ${chat.message}</div>
      <div class="message-time">${timeString}</div>`;
      chatContainer.appendChild(div);
    });


  } catch (error) {
    // alert("please start your backend server. ")
    console.log(error);
  }


}



async function signup(e) {
  e.preventDefault();
  try {

    const name = document.getElementById('username').value.trim();
    const email = document.getElementById('email_id').value.trim();
    const password = document.getElementById('password').value.trim();
    const cpassword = document.getElementById('cpassword').value.trim();
    // console.log(name,email,password,cpassword);
    if (password !== cpassword) {

      alert("password and Confirm password does not match")
      return;
    }
    const userData = {
      name: name,
      email: email,
      password: password
    };
    const res = await axios.post(baseUrl + 'signup', userData)
    if (res.status === 200) {
      // Similar behavior as an HTTP redirect
      window.location.replace(`${window.location.origin}/frontend/index.html`);
    }
  } catch (error) {
    if (error.response.status == 403) {
      alert("This email id is already registered.");
    }
  }
}

async function login(e) {
  e.preventDefault();
  try {

    const email = document.getElementById('email_id').value.trim();
    const password = document.getElementById('password').value.trim();
    // console.log(email, password);

    const userData = {
      email: email,
      password: password
    };
    // console.log(userData);
    const res = await axios.post(baseUrl + 'login', userData)

    Object.assign(res.data, { isLogin: true });

    if (res.status === 200) {
      // console.log(res.data);
      localStorage.setItem('token', JSON.stringify(res.data))
      alert("user logged in successfully.")

      // Similar behavior as an HTTP redirect
      window.location.replace(`${window.location.origin}/frontend/chat.html`);
    }
  } catch (error) {
    console.log(error);
    if (error.response.status == 404) {
      alert("User does not exist.");
    }
    if (error.response.status == 401) {
      alert("Wrong credential");
    }
  }
}

async function forgetPassword(e) {
  e.preventDefault();
  const email = document.getElementById('email_id').value.trim();
  const res = await axios.post(baseUrl + 'forgot-password', { email })
  // console.log(res);
}

function signout() {
  localStorage.removeItem('chats');
  localStorage.removeItem('token');
  window.location.replace(`${window.location.origin}/frontend/index.html`);
}
function isUserLoggedIN() {

  if (!(window.location.pathname == "/frontend/index.html" || window.location.pathname == "/frontend/signup.html" || window.location.pathname == "/frontend/forget-password.html")) {
    const user = localStorage.getItem('token');
    if (!user) {
      window.location.replace(`${window.location.origin}/frontend/index.html`);
    }
    const userObj = JSON.parse(user);
    if (userObj.isLogin !== true) {

      window.location.replace(`${window.location.origin}/frontend/index.html`);

    }
    return true;
  }
}

function getToken() {
  const tokenString = localStorage.getItem('token');
  if (tokenString) {
    return JSON.parse(tokenString).data;
  } else {
    window.location.replace(`${window.location.origin}/frontend/index.html`);
  }
}

async function showLeaderboard() {
  try {


    checkPremium();

    expensesDiv.classList.add('d-none')
    leaderBoardHeading.classList.remove('d-none');
    paginationElement.classList.add('d-none');

    const users = await axios.get(baseUrl + 'premium/get-leaderboard', { headers: { "Authorization": getToken() } })
    const usersData = users.data;


    leaderBoard.innerHTML = '';

    usersData.forEach((user) => {
      const li = document.createElement('li');
      li.classList.add("list-group-item");
      li.innerHTML = `<strong>${user.name}</strong> - $${user.totalExpense.toFixed(2)}  `;
      leaderBoard.appendChild(li);
    });

  } catch (error) {
    console.log(error);
  }
}
// testing email
function isValidPassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return false;
  }
  if (password.length < 6) {
    return false;
  }
  // check for the lower case letter
  if (!/[a-z]/.test(password)) {
    return false;
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    return false;
  }

  // Check for number
  if (!/\d/.test(password)) {
    return false;
  }

  // if all condition are true then 
  return true;
}

function parseJwt(token) {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

function createPagination(res, pgNo) {
  paginationElement.innerHTML = ''; // Clear previous pagination
  if (res.lastPage > 1) {


    for (let i = 1; i <= res.lastPage; i++) {
      const li = document.createElement('li');
      li.classList.add('page-item');

      if (i == pgNo) {
        li.classList.add('active');
      }
      const link = document.createElement('a');
      link.classList.add('page-link');
      link.href = `?page=${i}`;
      link.textContent = i;

      li.appendChild(link);
      paginationElement.appendChild(li);
    }
  }
}

if (rowsPerPageElement) {
  // Add onchange event listener
  rowsPerPageElement.addEventListener('change', function () {
    // Get the selected value
    const selectedValue = rowsPerPageElement.value;

    // Save the selected value to localStorage
    localStorage.setItem('rowsPerPage', selectedValue);
    location.reload();
  });
}

function scrollToBottom() {
  chatContainer.scrollTop = chatContainer.scrollHeight;
}
//  GROUP FUNCTIONS
async function getUsers() {
  const res = await axios.get(baseUrl + `get-users`, { headers: { "Authorization": getToken() } })

  res.data.users.forEach((user)=>{
    const option =  document.createElement('option');
    option.setAttribute("value",user.id);
    option.innerHTML=user.name;
    userList.appendChild(option);
  })

}
async function getGroups() {
  const res = await axios.get(baseUrl + `groups`, { headers: { "Authorization": getToken() } })
    console.log(res);
  res.data.groups.forEach((group)=>{
    const li =  document.createElement('li');
    li.setAttribute("class","list-group-item");
    li.innerHTML=`<button class="btn btn-link" onclick='displayGroupChat("${group.id}")'>${group.name}</button>`;
    chatGroup.appendChild(li);
  })
}

async function displayGroupChat(groupId){

}
async function addGroup(e){
  try {
    e.preventDefault();
  
    
    // Access the form element
    const form = e.target;

   
    // Retrieve form data
    const groupName = form.elements['groupName'].value.trim();
    const userIds = Array.from(form.elements['userList'].selectedOptions).map(option => option.value);

    const postData = {groupName,userIds};

   // add to server
    const res = await axios.post(baseUrl + 'add-group', postData, { headers: { Authorization: getToken() } });
      console.log(res);

      alert("Group Created.")
      window.location.replace(`${window.location.origin}/frontend/chat.html`)
    // chatInput.value = '';
    // await displayChats();
    // scrollToBottom();
  } catch (err) {
    console.log(err)
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  if (isUserLoggedIN()) {

    if (window.location.pathname === `/frontend/create_group.html`) {
      getUsers();
    }
      console.log(window.location);
    if (window.location.pathname === `/frontend/chat.html`) {
        getGroups();
      // setInterval(displayChats, 5000);
      // await displayChats()
      // scrollToBottom();
    }
  }
});