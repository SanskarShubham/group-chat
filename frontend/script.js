document.addEventListener('DOMContentLoaded', () => {
  if (isUserLoggedIN()) {
    displayExpenses();
  }
});
// http://34.207.185.225:3000/api/expenses
// const baseUrl = "https://34.207.185.225:3000/api/";
const baseUrl = "http://localhost:3000/api/";

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

function addExpense() {


  const amount = amountInput.value.trim();
  const description = descriptionInput.value.trim();
  const category = categoryInput.value;
  const id = idInput.value;

  if (amount === '' || description === '') {
    alert('Please enter both amount and description.');
    return;
  }

  const newExpense = {
    amount: parseFloat(amount),
    description: description,
    category: category,
    userId: getToken(),
  };
  if (id === '') {
    // add to server
    axios
      .post(baseUrl + 'add-expense', newExpense, { headers: { Authorization: getToken() } })
      .then((res) => {
        location.reload();

      })
      .catch((err) => console.log(err));
  } else {
    const newExpense = {
      amount: parseFloat(amount),
      description: description,
      category: category,
      id: id,
      userId: getToken()
    };
    axios
      .post(baseUrl + 'edit-expense', newExpense, { headers: { Authorization: getToken() } })
      .then((res) => {
        location.reload();
      })
      .catch((err) => console.log(err));
  }


  amountInput.value = '';
  descriptionInput.value = '';
  displayExpenses();
}


async function displayExpenses() {

  try {
    checkPremium();
    const currentUrl = window.location.href;
    // Create a new URLSearchParams object with the URL's search parameter string
    const searchParams = new URLSearchParams(new URL(currentUrl).search);
    // Get individual query parameters using the get() method
    const pageNo = searchParams.get('page') || 1;
      let rowPerPage =  localStorage.getItem('rowsPerPage')
    if (rowPerPage) {
        rowPerPage  =parseInt(rowPerPage);
    }else{
      rowPerPage = 5;
    }    
    console.log(rowPerPage);
     rowsPerPageElement.value =rowPerPage;

    const expenseList = document.getElementById('expenseList');
    const res = await axios.get(baseUrl + `expenses?page=${pageNo}&rowPerPage=${rowPerPage}`, { headers: { "Authorization": getToken() } })
    const expenses = res.data.expenses;

    expenseList.innerHTML = '';

    expenses.forEach((expense) => {
      const li = document.createElement('li');
      li.classList.add("list-group-item");
      li.innerHTML = `<strong>${expense.description}</strong> - $${expense.amount.toFixed(2)} (${expense.category}) <button onclick="editExpense(${expense.id},event)" class="btn btn-sm btn-outline-success">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteExpense(${expense.id})">Delete</button>`;
      expenseList.appendChild(li);
    });
    createPagination(res.data, pageNo);

  } catch (error) {
    // alert("please start your backend server. ")
    console.log(error);
  }


}

function editExpense(id, e) {

  axios
    .get(baseUrl + '/edit-expense/' + id)
    .then((res) => {
      if (res.status === 200) {
        // inserting the values in form input
        amountInput.value = res.data.amount
        descriptionInput.value = res.data.description
        idInput.value = id;
        btn.textContent = 'Update';

        Array.from(document.querySelector('#category').options).forEach(option => {
          if (option.value == res.data.category)
            option.selected = true
        });
      }
    })
    .catch((err) => console.log(err));

}

function deleteExpense(id) {
  const confirmRes = confirm("Are you sure want to delete ?");
  if (!confirmRes) {
    return;
  }
  axios
    .delete(baseUrl + 'delete-expense/' + id, { headers: { Authorization: getToken() } })
    .then((res) => {
      if (res.status === 200) {
        location.reload();
      }
    })
    .catch((err) => console.log(err));


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
      window.location.replace(`${window.location.origin}/frontend/expense.html`);
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

async function buyMembership() {
  // Fetch the order details from the backend

  const postData = {
    amount: 1000, // Specify amount in paisa (e.g., ₹10 = 1000)
    currency: 'INR' // Specify the currency
  };
  const data = await axios.post(baseUrl + 'create-order', postData, { headers: { Authorization: getToken() } })
  // Initialize Razorpay checkout
  const options = {
    key: 'rzp_test_xlWAAcbItraEsW',
    currency: data.data.order.currency,
    order_id: data.data.order.id,
    name: 'Group Chat ',
    description: 'Payment for Premium Features',
    image: 'https://your-company-logo-url.png',
    handler: async function (response) {
      const token = await axios.post(baseUrl + 'update-order', response, { headers: { Authorization: getToken() } })
      if (token) {
        localStorage.setItem('token', JSON.stringify(token.data));
      }
      alert("you are now Premium user");
      showPremium();
    },
    prefill: {
      name: 'Customer Name',
      email: 'customer@example.com',
      contact: '9999999999'
    },
    theme: {
      color: '#3399cc'
    }
  };

  const rzp1 = new Razorpay(options);
  rzp1.open();
  rzp1.on('payment.failed', async function (response) {
    // console.log(response);
    await axios.post(baseUrl + 'update-failed-order', response, { headers: { Authorization: getToken() } })
    alert('something went wrong.')
  })
}


function showPremium() {
  accountDiv.innerHTML = `
  <ul class="navbar-nav me-auto mb-2 mb-lg-0">
  <li class="nav-item">
  <button type="button" onclick="downloadReport()" class="btn btn-sm btn-outline-success mx-2">Download Report</button>
  </li>
    <li class="nav-item">
    <button type="button" onclick="showLeaderboard()" class="btn btn-sm btn-outline-success mx-2">Leader board</button>
  </li> 
   <li class="nav-item">
   <button type="button" disabled class="btn btn-sm btn-outline-outline-success">You are a Premium user.</button>
  </li> 
  <li class="nav-item">
  <a onclick="signout()" class="btn btn-sm btn-outline-success mx-2">Logout</a>
  </li>

</ul>` ;

}

function checkPremium() {
  const token = parseJwt(localStorage.getItem('token'));
  // console.log(token);
  if (token) {
    if (token.isPremium) {
      showPremium();
    } else {
      // <button onclick="buyMembership()" class="btn btn-sm btn-outline-success">Buy Membership</button>
      accountDiv.innerHTML = `<a onclick="signout()" class="btn btn-sm btn-outline-success mx-2">Logout</a>`;
    }
  }

}
async function downloadReport() {
  const response = await axios.get(baseUrl + 'premium/download-report', { headers: { "Authorization": getToken() } });
  //the bcakend is essentially sending a download link
  //  which if we open in browser, the file would download
  var a = document.createElement("a");
  a.href = response.data.fileUrl;
  a.download = 'myexpense.csv';
  a.click();
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
  if (res.lastPage > 1 ) {
    
 
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


if(rowsPerPageElement){
// Add onchange event listener
rowsPerPageElement.addEventListener('change', function () {
  // Get the selected value
  const selectedValue = rowsPerPageElement.value;

  // Save the selected value to localStorage
  localStorage.setItem('rowsPerPage', selectedValue);
  location.reload();
});
}
