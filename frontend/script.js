
// http://34.207.185.225:3000/api/expenses
// const baseUrl = "https://34.207.185.225:3000/api/";
const baseUrl = "http://localhost:3000/api/";
const socket = io(
   'http://localhost:3000'
// , {
//   reconnectionDelay: 1000,
//   reconnection: true,
//   reconnectionAttemps: 10,
//   transports: ['websocket'],
//   agent: false,
//   upgrade: false,
//   rejectUnauthorized: false
// }
);
const chatInput = document.getElementById('message-input');
const chatContainer = document.getElementById('chat-container');

const idInput = document.getElementById('id');
const btn = document.getElementById('btn');


const paginationElement = document.getElementById('pagination');

const rowsPerPageElement = document.getElementById('r_p_page');

const accountDiv = document.getElementById('account-div')
const userList = document.getElementById('userList')
const chatGroup = document.getElementById('chatGroup')
const myGroups = document.getElementById('my-groups')
const mediaInput = document.getElementById('media-input')




async function addChat(e) {

  try {

    e.preventDefault();
    console.log(mediaInput.files);
    const chatVal = chatInput.value.trim();
    const newMessage = {
      message: chatVal,
    };
    const file = mediaInput.files[0]; 
    const formData = new FormData();
    formData.append('file', file);
    formData['message'] = chatVal;

    const groupId = localStorage.getItem('groupId');
    if (groupId) {
      newMessage.groupId = parseInt(groupId);
    }
    // if(mediaInput.files) {
    //   newMessage.file = 
    // }
    const headerObj = {
       Authorization: getToken() 
    }
    // if (mediaInput.files) {
      
    //   headerObj['Content-Type'] = 'multipart/form-data';
    // }
    console.log(newMessage);
    // add to server
    await axios.post(baseUrl + 'add-chat', formData, { headers: headerObj })
    socket.emit('message', {chat:chatVal,groupId});
    chatInput.value = '';
    // const chats = await getChats(groupId);
    // await displayChats(chats);
    // scrollToBottom();
  } catch (err) {
    console.log(err)
  }
}


async function getChats(groupId) {

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
    let res;
    if (groupId) {
      groupId = parseInt(groupId);

      res = await axios.get(baseUrl + `chats?lastChatId=${lastChatId}&groupId=${groupId}`, { headers: { "Authorization": getToken() } })
    } else {

      res = await axios.get(baseUrl + `chats?lastChatId=${lastChatId}`, { headers: { "Authorization": getToken() } })
    }


    const chats = res.data.chats;

    if (chats.length > 0) {

      if (localChatsString) {
        localChats = [...localChats, ...chats];
      } else {
        localChats = chats
      }
      localStorage.setItem('chats', JSON.stringify(localChats));
    }
    return localChats;

  } catch (error) {
    // alert("please start your backend server. ")
    console.log('Error in getChats function', error);
  }


}
async function displayChats(chats) {


  if (chats && chats.length > 0) {
    chatContainer.innerHTML = '';
    chats.forEach((chat) => {
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
  localStorage.clear();
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

  res.data.users.forEach((user) => {
    const option = document.createElement('option');
    option.setAttribute("value", user.id);
    option.innerHTML = user.name;
    userList.appendChild(option);
  })

}

async function getNewUsersforGroup(groupId) {
  const res = await axios.get(baseUrl + `get-new-users-for-group?groupId=${+groupId}`, { headers: { "Authorization": getToken() } })

  res.data.users.forEach((user) => {
    const option = document.createElement('option');
    option.setAttribute("value", user.id);
    option.innerHTML = user.name;
    userList.appendChild(option);
  })

}
async function getGroups() {
  const res = await axios.get(baseUrl + `groups`, { headers: { "Authorization": getToken() } })
  // console.log(res);
  res.data.groups.forEach((group) => {
    const li = document.createElement('li');
    li.setAttribute("class", "list-group-item");
    li.innerHTML = `<button class="btn btn-link" onclick='displayGroupChat("${group.id}")'>${group.name}</button>`;
    chatGroup.appendChild(li);
  })
}
socket.on('send_message', async (data) => {
  console.log(data,'send_message');
   const localgroupId =  localStorage.getItem('groupId')

   if(localgroupId && parseInt(localgroupId) == data.groupId) {
    await displayGroupChat(data.groupId,true)
   }
  // await displayGroupChat(data.groupId,true)
})
async function displayGroupChat(groupId,fromServer) {
  chatContainer.innerHTML = '';
  if (!fromServer) {
    
    localStorage.removeItem('chats');
    localStorage.setItem('groupId', groupId);
  }

  // const chats = await getChats(groupId);
  // displayChats(chats);
  // const lastIntervalId = localStorage.getItem('lastIntervalId')
  // clearInterval(lastIntervalId);
  // const intervalId = setInterval(async () => {
    const chats = await getChats(groupId);
    console.log(chats);
    await displayChats(chats);

  // }, 5000)
  scrollToBottom();
  // localStorage.setItem('lastIntervalId', intervalId);
}
async function addGroup(e) {
  try {
    e.preventDefault();


    // Access the form element
    const form = e.target;


    // Retrieve form data
    const groupName = form.elements['groupName'].value.trim();
    const userIds = Array.from(form.elements['userList'].selectedOptions).map(option => option.value);

    const postData = { groupName, userIds };

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
async function addNewUserTOGroup(e) {
  try {

    e.preventDefault();

    // Access the form element
    const form = e.target;

    // Get the URL parameters
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);

    // Get the value of the groupId parameter
    const groupId = urlParams.get('groupId');


    // Retrieve form data

    const userIds = Array.from(form.elements['userList'].selectedOptions).map(option => option.value);

    const postData = { groupId, userIds };

    // add to server
    const res = await axios.post(baseUrl + 'add-new-member-in-group', postData, { headers: { Authorization: getToken() } });
    console.log(res);

    alert("Member added.")
    window.location.replace(`${window.location.origin}/frontend/chat.html`)
    // chatInput.value = '';
    // await displayChats();
    // scrollToBottom();
  } catch (err) {
    console.log(err)
  }
}

async function getMyGroups() {
  try {
    const res = await axios.get(baseUrl + `get-user-groups`, { headers: { "Authorization": getToken() } })
    console.log(res);
    const groups = res.data.groups;
    myGroups.innerHTML = '';

    if (groups.length > 0) {
      groups.forEach((group, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<tr>
        <td scope="row">${index + 1}</td>
        <td>${group.name}</td>
        <td><a class="btn btn-outline-success btn-sm me-2" href="/frontend/add-new-user-in-group.html?groupId=${group.id}" >Add User</a><button class="btn btn-outline-danger btn-sm" onclick="deleteGroup(event,${group.id})">Delete</button></td>
          </tr>`
        myGroups.appendChild(tr);
      })
    } else {

      myGroups.innerHTML = `<tr>
        <td colspan ="3" class" text-center">you did not created any group yet .</td>
      </tr>`
    }

  } catch (error) {
    console.log(error);
  }
}

async function deleteGroup(e, groupId) {
  try {

    console.log(groupId);
    let confirm = window.confirm("Do you really want to delete !");
    if (!confirm) {
      return;
    }
    const res = await axios.delete(baseUrl + `delete-group/${groupId}`, { headers: { "Authorization": getToken() } })

    var row = e.target.parentNode.parentNode; // Get the row
    row.parentNode.removeChild(row);
    alert("group deleted.")
  } catch (error) {
    console.log(error);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
 
  if (isUserLoggedIN()) {

    if (window.location.pathname === `/frontend/create_group.html`) {
      getUsers();
    }
    if (window.location.pathname === `/frontend/add-new-user-in-group.html`) {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      // Get the value of the groupId parameter
      const groupId = urlParams.get('groupId');
      getNewUsersforGroup(groupId);
    }
    console.log(window.location);
    if (window.location.pathname === `/frontend/chat.html`) {
      getGroups();
    }

    if (window.location.pathname === `/frontend/my-groups.html`) {
      getMyGroups();
    }
  }
});