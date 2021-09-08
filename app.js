const API_URL = 'https://strangers-things.herokuapp.com/api/2102-CPU-RM-WEB-PT';

const state = {
  token: '',
  responseObj: {},
  posts: [],
  messages: [],
  user: ''
};

//stores the header into one function
const makeHeaders = () => {
  if (getToken()) {
  return {'Content-Type': 'Application/JSON',
  'Authorization': `Bearer ${getToken()}`}
  } else {
  return {'Content-Type': 'Application/JSON'}
  }
};

//setToken and getToken stores the token when a user register and login
const setToken = (token) => {
  localStorage.setItem('token', token);
};

const getToken = () => {
  return localStorage.getItem('token');
};

//login a user
const login = async (username, password) => {
  try {
  const response = await fetch(`${API_URL}/users/login`, {
    method: "POST",
    headers: makeHeaders(),
    body: JSON.stringify({
    user: {
      username,
      password
    }
    })
    })
    const responseObj = await response.json(); 
    if (responseObj.data) {
    setToken(responseObj.data.token);
    } 
    state.responseObj = responseObj; 
  } catch (error) {
    console.error(error)
  }
};  

//register a user
const registerUser = async (username, password) => {
  try {
  const response = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: makeHeaders() ,
    body: JSON.stringify({
      user: {
        username,
        password
        }
      })
    })
    const responseObj = await response.json();

    if (responseObj.data.token) {
    setToken(responseObj.data.token); 
  }  
    state.responseObj = responseObj; 
  } catch (error){
    console.error(error);
  }
};

//fetches all post created by authenticated users
async function fetchPosts() {
  try {
        const data = await fetch(`${ API_URL }/posts`,{
          method: "GET",
          headers: makeHeaders()
        })
        const responseObj = await data.json();
    state.posts = responseObj.data.posts;
  } catch (error) {
    console.error(error);
  }
};

//function that grabs logged in user's relevant data
async function fetchUserData () {
  try {
  const response = await fetch(`${API_URL}/users/me`, {
  headers: makeHeaders(),
  });
  const responseObj = await response.json();
  if (responseObj.data !== null) {
    state.messages = responseObj.data.messages;
    state.username = responseObj.data.username;
  }
  } catch (error) {
    console.error(error)
  }
};

//function to create post for authenticated users
const createPost = async post => {
  try {
    const response = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: makeHeaders(),
      body: JSON.stringify({post}),
    });
    const newPost = await response.json();
    return newPost;
  } catch (error) {
    console.error(error)
  }
};

//function to create messages for authenticated users
const createMessage = async (postID , content) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postID}/messages`, {
    method: 'POST',
    headers: makeHeaders() ,
  body: JSON.stringify({message: {content}})
});
    const responseObj = await response.json();
  } catch(error) {
    console.error(error)
  }
};

//function to delete post for authenticated users who owns the post 
const deletePost = async postID => {
  try {
    const response = await fetch(`${API_URL}/posts/${postID}`, {
  method: 'DELETE',
  headers: makeHeaders() 
  });
  const responseObj = await response.json();
  return responseObj;
  }
  catch(error) {
    console.error(error)
  } 
};


//function to edit a post for authenticated users who owns the post
const editPost = async (postId, post) => {
  try {
    const response = await fetch(`${API_URL}/posts/${postId}`, {
      method: 'PATCH',
      headers: makeHeaders() ,
      body: JSON.stringify({post}),
    });
    const updatedPost = await response.json();
    return updatedPost;
  } catch (error) {
    console.error(error)
  }  
};

const render = (posts) => {
  const message = $('#message');
  message.empty();
  message.append(navBar());
};

const renderPosts = () => {
  state.posts.forEach(function(post){
  const cardElem = createPostHTML(post)
  $("#messageContainer").prepend(cardElem);
  })
};

const renderSearchPosts = (posts) => {
  posts.forEach(function(post){
    const cardElem = createPostHTML(post)
    $("#messageContainer").prepend(cardElem);
  })
}

//log out a user and return to the default page
const logOut = () => {
  $('#messageContainer').empty(); 
  localStorage.clear();   
  render();
  renderPosts();
};

//render messages when an authenticated users send a message
const renderMessage = async (messageCard) => {
  $('#messageContainer').empty();
  $('#messageContainer').append('<div id="messageReceivedDiv"><h1>You Got Mail</h1></div>');
  try {
  messageCard.forEach(function(message){
  const messageCardElem = createElementFromMessageReceived(message)
  $("#messageContainer").append(messageCardElem); 
  }) 
  } catch(error) {
    console.error(error)
  }
};


//function that grabs information from the authenticated user
const postIdMessages = (postId) => {
  let result = "";
  state.messages.forEach(function(message) {
    if (message.post._id === postId) {
      result= "<div>"+message.fromUser.username+": "+message.content+"</div>"
    }
  })
  return result;
}; 

//bootstrap for navbar, modals, register/login a user, rendering posts
const navBar = () => {
  if (getToken()) {
      const navBarElem = $(`
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <a class="navbar-brand">Stranger's Things</a>
      <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
      </button>
    
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav mr-auto">
      <li class="nav-item active">
      <a class="nav-link" href="#" id="homeLink">Home <span class="sr-only"></span></a>
      </li>
      <li class="nav-item">
      <a class="nav-link" href="#" id="createButton" data-toggle="modal" data-target="#createPostModal">Create Post <span class="sr-only"></span></a>
      </li>
      <li class="nav-item">
      <a class="nav-link" href="#" id="messageLink">Messages<span class="badge badge-light" id="badge">${state.messages.length}</span></a>
      </li>        
      <form class="form-inline my-2 my-lg-0" id="search">
      <input class="form-control mr-sm-2" type="search" id="searchInput" placeholder="Search" aria-label="Search">
      <button class="btn btn-outline-success my-2 my-sm-0" type="submit" id="search-form">Search</button>
      </form>
      </ul>
      <div class="justify-content-end">
      <span id="username">Hello ${state.username}</span>
      <button class="btn btn-danger my-2 my-sm-0" id="logOutButton" type="submit">Log Out</button>
      </div>
      </div>
      </nav>
      `);
return navBarElem;
  } else {
    const navBarElem = $(`
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
  <a class="navbar-brand">Stranger's Things</a>
  <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
  <span class="navbar-toggler-icon"></span>
  </button>
  
  <div class="collapse navbar-collapse" id="navbarSupportedContent">
  <ul class="navbar-nav mr-auto">    
  <form class="form-inline my-2 my-lg-0" id="search">
  <input class="form-control mr-sm-2" type="search" id="searchInput" placeholder="Search" aria-label="Search">
  <button class="btn btn-light my-2 my-sm-0" type="submit" id="search-form">Search</button>
  </form>
  </ul>
  <div class="justify-content-end">
  <button class="btn btn-light my-2 my-sm-0" type="submit" id="signUpButton">Sign Up</button>
  <button class="btn btn-light my-2 my-sm-0" type="submit" id="signInButton">Sign In</button> 
  </div>
  </div>
  </nav>
  `);
  return navBarElem;
  }
};

const loginUser = () => {
  return $(`
  <div class="form-signin">
  <h1 class="h3 mb-3 font-weight-normal"> Welcome back! Feel Free To Login</h1>
  <label for="inputUsername" class="sr-only">Username</label>
  <input type="username" id="inputUsernameSignIn" class="form-control" placeholder="Username" required>
  <label for="inputPassword" class="sr-only">Password</label>
  <input type="password" id="inputPasswordSignIn" class="form-control" placeholder="Password" required>
  <button class="btn btn-lg btn-primary btn-block" type="click" id="signInValidationButton">Sign in</button>
  </div>
  `)
};

const signUpUser = () => {
  return $(`
  <div class="form-signup">
  <h1 class="h3 mb-3 font-weight-normal">Welcome! Please Register</h1>
  <label for="inputEmail" class="sr-only">Username</label>
  <input type="username" id="inputUsernameSignUp" class="form-control" placeholder="Username" required autofocus>
  <label for="inputPassword" class="sr-only">Password</label>
  <input type="password" id="inputPasswordSignUp" class="form-control" placeholder="Password" required>
  <button class="btn btn-lg btn-primary btn-block" type="click" id="signUpButton">Sign Up</button>
  </div>
  `)
};

const createPostHTML = (post) => {
  const {author:{username}, title, description, price, location, willDeliver, isAuthor, _id} = post;
  if (getToken()) {
  const messages = postIdMessages(_id);
  const cardElement = $(`
  <div class="col-sm">
  <div class="post" style="width: 18rem;">
  <div class="card-body">
  <h2 class="card-title">${title}</h2>
  <p class="card-text">${description}</p>
  <p class="card-text">By: ${username}</p>
  <p class="card-text">Price: ${price}</p>
  <p class="card-text">Location: ${location}</p>
  <p class="card-text">Will Deliver: ${willDeliver}</p>
  ${!isAuthor && getToken() !== undefined ? `<div class="messagefield">
  <a href="#" class="btn btn-primary" id="submitMessageButton">Contact ${username}</a></form></div>`: " "}
  ${isAuthor ? `
  <div id="button_delete_edit">
  <a href="#" class="btn btn-danger" id="deleteButtonAllPosts">Delete</a>
  <a href="#" class="btn btn-secondary" data-toogle="modal" data-target="#editPostModal" id="editButtonAllPosts">Edit</a>
  </div>
  <div id="messages" class="card" style="width: 16rem">
  <div class="card-header">Messages Received</div>
    <ul class="list-group list-group-flush">
      <li class="list-group-item"> ${messages}</li>
    </ul>
  </div>`: " "}
  </div>
  </div>
  </div>
  `).data('card', post)
  return cardElement;
  }
  else if (getToken() === null) {
  const cardElement = $(`
  <div class="col-sm">
  <div class="post" style="width: 18rem;">
  <div class="card-body-loggedOut">
  <h2 class="card-title">${title}</h2>
  <p class="card-text">${description}</p>
  <p class="card-text">By: ${username}</p>
  <p class="card-text">Price: ${price}</p>
  <p class="card-text">Location: ${location}</p>
  <p class="card-text">Will Deliver: ${willDeliver}</p>
  </div>
  </div>
  </div>
  `).data('card', post);
  return cardElement;  
  }
};

const createElementFromMessageReceived = (card) => {
  const {fromUser:{username}, post: {title}, content} = card;
  const usernameState = state.username;
  const elementFromMessageReceived = $(`
  ${username !== usernameState ?
  `
  <table class="table table-striped">
  <thead>
    <tr>
      <th scope="col">From</th>
      <th scope="col">Post</th>
      <th scope="col">Message</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">${username}</th>
      <td>${title}</td>
      <td>${content}</td>
    </tr>
  </tbody>
</table>
  
  ` :
  ""
  }
  `).data('card', card);
return elementFromMessageReceived;
};

const createNewPost = (myPost) => {
  const elementNewPost = $(`
<div class="modal" id="createPostModal" aria-hidden="true">  
<form class="newPostForm">  
<div class="card" style="width: 35rem;">
<div class="card-body-createPost">
<h3 id="titleAlert">Create New Post</h5>
<div class="mb-3">
<label for="createPostTitle">Title</label>
<input type="text" class="form-control" placeholder="required" id="createPostTitle" required>
</div>
<div class="mb-3">
<label for="createPostDescription">Description</label>
<textarea type="text" class="form-control" placeholder="required" id="createPostDescription" required></textarea>
</div>
<div class="mb-3">
<label for="createPostPrice">Price</label>
<input type="text" class="form-control" placeholder="required" id="createPostPrice" required>
</div>
<div class="mb-3">
<label for="createPostLocation">Location</label>
<input type="text" class="form-control" placeholder="optional" id="createPostLocation">
</div>
<div class="mb-3">
<label for="createPostWillDeliver">Will Deliver</label>
<input type="checkbox" class="form-control" id="createPostWillDeliver">
</div>
<div class="modal-footer">
  <button type="button" class="btn btn-lg btn-secondary" data-dismiss="modal">Close</button> 
  <button type="button" class="btn btn-lg btn-primary" id="createPostSubmitButton" disabled>Submit</button>
 </div>
</div>
</div>
</form>
</div>
`)
return elementNewPost;
};

const deletedPostModal = () => {
  deletedPost = $(`
<div class="modal" tabindex="-1" role="dialog">
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Modal title</h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <p>Modal body text goes here.</p>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
      </div>
    </div>
  </div>
</div>
`)
return deletedPost;
}; 

const updatePostModal = (myPost) => {
  const editPostElement = $(`
  <div class="modal" id="editPostModal" aria-hidden="true">  
  <form class="editPostForm">  
  <div class="card" style="width: 35rem;">
  <div class="card-body-createPost">
  <h3 id="titleAlert">Edit Post</h5>
  <div class="mb-3">
  <label for="createPostTitle">Title</label>
  <input type="text" class="form-control" placeholder="required" id="createPostTitle" required>
  </div>
  
  <div class="mb-3">
  <label for="createPostDescription">Description</label>
  <textarea type="text" class="form-control" placeholder="required" id="createPostDescription" required></textarea>
  </div>
  
  <div class="mb-3">
  <label for="createPostPrice">Price</label>
  <input type="text" class="form-control" placeholder="required" id="createPostPrice" required>
  </div>
  
  <div class="mb-3">
  <label for="createPostLocation">Location</label>
  <input type="text" class="form-control" placeholder="optional" id="createPostLocation">
  </div>
  
  <div class="mb-3">
  <label for="createPostWillDeliver">Will Deliver</label>
  <input type="checkbox" class="form-control" id="createPostWillDeliver">
  </div>
  <div class="modal-footer">
    <button type="button" class="btn btn-lg btn-secondary" data-dismiss="modal" id="editPostCloseButton">Close</button> 
    <button type="button" class="btn btn-lg btn-primary" id="editPostSubmitButton">Submit</button>
  </div>
  <input hidden type="text" id="hiddenId"></input>
  </div>
  </div>
  </form>
  </div>`)
return editPostElement;
}; 

const contactSeller = (myMessage) => {
  const contactSellerElem = $(`
  <div class="modal" id="editPostModal" aria-hidden="true">  
    <form class="editPostForm">  
      <div class="card" style="width: 35rem;">
        <div class="card-body-createPost">
          <h3 id="titleAlert">Contact Seller</h3>
          <div class="input-group">
          <textarea class="form-control" aria-label="With textarea" placeholder="Type Message Here"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-lg btn-secondary" data-dismiss="modal" id="contactSellerCloseButton">Close</button> 
            <button type="button" class="btn btn-lg btn-primary" id="contactSellerSubmitButton">Submit</button>
          </div>
          <input hidden type="text" id="hiddenIdContactSeller"></input>
        </div>
      </div>
    </form>
  </div>`)
return contactSellerElem;
}; 

//click functions
$('#message').on('click','#signInButton', function loginForm(){
$('#messageContainer').empty();
$('#messageContainer').append(loginUser());
});

$('#messageContainer').on('click','#signInValidationButton', async function signInValidation(){
  const usernameSignIn = $('#inputUsernameSignIn');
  const passwordSignIn = $('#inputPasswordSignIn');
  const obj = {
    user: $('#messageContainer').find(usernameSignIn).val(),
    password: $('#messageContainer').find(passwordSignIn).val()
  }
  try {
  await login(obj.user, obj.password)
  if ( state.responseObj.success ) {
    swal("Good job!", "You are successfully logged In!", "success");
    $('#messageContainer').empty();
    await fetchPosts(); 
    await fetchUserData();
    $('#messageContainer').empty();
    renderPosts();
    render();
  } else {
    swal("Ooops", "You enter the wrong username and/or password. Try again", "warning")
  }
  } catch (error) {
    console.error(error)
  }
});

$('#message').on('click','#signUpButton', function signUpForm(){
  $('#messageContainer').empty();
$('#messageContainer').append(signUpUser());
});

$('#messageContainer').on('click','#signUpButton', async function signInForm(){
  const obj = {
    user: $('#messageContainer').find('#inputUsernameSignUp').val(),
    password: $('#messageContainer').find('#inputPasswordSignUp').val()
  }
  await registerUser(obj.user, obj.password);
  if ( state.responseObj.success ) {
    swal("Good job!", "You created a new account", "success")
    $('#messageContainer').empty();
    await fetchPosts(); 
    await fetchUserData();
    $('#messageContainer').empty();
    renderPosts();
    render();
  } else {
    swal("Oops", "This username already taken", "warning")
  }
});

 $('#message').on('click','#logOutButton', function logOutButton(){
  logOut();
  swal('Goodbye', 'You been logged off', 'success')
});

 $('#message').on('click','#messageLink', function messagesAccess(){
   $('#createButton').hide();
  $('#messageContainer').empty(); 
  const messageReceived = renderMessage(state.messages);
  $('#messageContainer').append(messageReceived)
});

$('#message').on('click','#homeLink', function homeAccess(){
  $('#messageContainer').empty(); 
  render();
  renderPosts();
});

$('#message').on('click', '#createButton', function (event) {
  $('#message').append(createNewPost());
});

$('#message').on('input', '#createPostTitle, #createPostDescription, #createPostPrice', function(){
  if($('#createPostTitle').val() != '' && $('#createPostDescription').val()!='' && $('#createPostPrice').val()!='') {
    $('#createPostSubmitButton').removeAttr("disabled");
  } 
});

$('#message').on('click', '#createPostSubmitButton', async function (event){
  event.preventDefault();
  $('#createPostModal').modal('hide');
  const postObj = {
    title: $('#createPostTitle').val(),
    description: $('#createPostDescription').val(),
    price: $('#createPostPrice').val(),
    location: $('#createPostLocation').val(),
    willDeliver: $('#createPostWillDeliver').attr('checked')
  } 
  try {
    const {data: {post}} = await createPost(postObj);
    state.posts.push(post)
    const createdPost = {data: {post}}
    swal("Success", "Poof! Your post has been created!", "success");
    state.posts.map((post) => {
      newPost = createdPost.data.post;
    })
    const cardElem = createPostHTML(newPost)
    $("#messageContainer").prepend(cardElem);
    render();
  } catch (error) {
    console.error(error)
  }
});

$('#messageContainer').on('click', '#submitMessageButton', async function (event){
  const modal = contactSeller();
  $('#message').append(modal);
  modal.show();
  const modalBackdrop = $('<div class="modal-backdrop"></div>');
  $('body').append(modalBackdrop);
  const postElem = $(this).closest('.col-sm');
  const card = postElem.data('card');
  const postId = card._id;
  const hiddenIdContactSeller = {
  hiddenIdContactSeller: $('#hiddenIdContactSeller').val(postId)  
  }
});

$('#message').on('click', '#contactSellerCloseButton', function (event) {
  $('.card-body-createPost').hide();
  $('.modal-backdrop').remove();
  render();
})

$('#message').on('click', '#contactSellerSubmitButton', async function (event){
  event.preventDefault();
  $('.card-body-createPost').hide();
  $('.modal-backdrop').remove();
  $('#messageContainer').empty();
  const postElem = $(this).closest('.card-body-createPost');
  const postId = $('#hiddenIdContactSeller').val()
  const messageContent = postElem.find('.form-control').val();
  swal("Congrats", "Your message has been sent!", "success");
  await createMessage(postId, messageContent);
  renderPosts();
  render();
}); 


$('#messageContainer').on('click', '#deleteButtonAllPosts', async function (){
  const postElem = $(this).closest('.col-sm');
  const deletedPost = postElem.data('card');
  try {
    const result = await deletePost(deletedPost._id); 
    postElem.hide();
    swal("Success", "Poof! Your post has been deleted!", "success");
    state.posts.pop(result)
    state.posts.map((post) => {
      newPost = result.post;
    })
      } catch(error){
      console.error(error);
    }
});

$('#messageContainer').on('click', '#editButtonAllPosts', function (event) {
  const modal = updatePostModal();
  $('#message').append(modal);
  modal.show();
  const modalBackdrop = $('<div class="modal-backdrop"></div>');
  $('body').append(modalBackdrop)
  const postElem = $(this).closest('.col-sm');
  const card = postElem.data('card');
  const postId = card._id;
  const hiddenId = {
  hiddenId: $('#hiddenId').val(postId)  
  }
  const postData = {
  title: $('#createPostTitle').val(card.title),
  description: $('#createPostDescription').val(card.description),
  price: $('#createPostPrice').val(card.price),
  location: $('#createPostLocation').val(card.location),
  willDeliver: $('#createPostWillDeliver').val(card.willDeliver)
  }
});

$('#message').on('click', '#editPostCloseButton', function (event) {
  $('.card-body-createPost').hide();
  $('.modal-backdrop').remove();
  render();
})

$('#message').on('click', '#editPostSubmitButton', async function (event) {
  event.preventDefault();
  $('.card-body-createPost').hide();
  $('.modal-backdrop').remove();
  const postData = {
    title: $('#createPostTitle').val(),
    description: $('#createPostDescription').val(),
    price: $('#createPostPrice').val(),
    location: $('#createPostLocation').val(),
    willDeliver: $('#createPostWillDeliver').val()
  }
  const postId = $('#hiddenId').val()

  if (postData) {
    try {
      const result = await editPost(postId, postData);
      location.reload(true);
    } catch(error) {
      console.error(error)
    }
  }
}); 

$('#message').on('click', '#search-form', function(event) {
  $('#messageContainer').empty();
  event.preventDefault();
  const searchVal = $('#searchInput').val();
  const searchPost = state.posts.filter(function(post){
  return post.title.toLowerCase().includes(searchVal.toLowerCase()) ||
  post.description.toLowerCase().includes(searchVal.toLowerCase()) ||
  post.price.toLowerCase().includes(searchVal.toLowerCase()) ||
  post.author.username.toLowerCase().includes(searchVal.toLowerCase())
  });
  $('#messageContainer').append(renderSearchPosts(searchPost));
  const resetButton = $(`
  <div class="messageContainer">
  <input class="btn btn-primary" id="resetButton" type="reset" value="Reset All Posts">
  </div>
  `)
  render();
  $('#message').append(resetButton);
});

$('#message').on('click', '#resetButton', function(){
  "button clicked"
  $('#messageContainer').empty();
  render();
  renderPosts();
});

const bootstrap = async () => {
  try {
  getToken();
  await fetchUserData();
  await fetchPosts();
  render();
  renderPosts();
  } catch (error) {
    console.error(error);
  }
};

bootstrap();