// -- Library
import axios from 'axios';
import _ from 'lodash';
// -- CSS
import './style.scss';
// -- Media
import imgHeader from './media/img/title.jpg';
require("./media/img/favicon512.png");


// -- Fundamental vars
const baseURL = 'https://hacker-news.firebaseio.com/v0/';

// -- Code 
let newStories; // Array of articles IDs
let indexLoadedGroup = 0; // Index of last loaded results group
let requestIsRunning = false; // Flag to prevent multiple requests

// Request 500 stories and chunks them in 10 elements each
function requestStories() {
  try {
    // Blocks all other requests
    if (requestIsRunning) return;
    requestIsRunning = true;
    axios
      .get(`${baseURL}newstories.json`)
      .then((response) => {
        // handle success
        newStories = _.chunk(response.data, 10);
        // Unlocks requests
        requestIsRunning = false;
        loadStories();
        let time = new Date();
        dispatchInfo(`Last update time ${time.toLocaleTimeString()}`);
      })
      .catch(function (error) {
        // handle error
        dispatchInfo(error, 0);
      });
  } catch (error) {
    dispatchInfo(error, 0);
    
  }
}

// This function load the selected chunk of stories
function loadStories(){
  debugger;
  try {
    if (requestIsRunning) return;
    for (let i = 0; i < 10; i++) {
      axios
        .get(`${baseURL}/item/${newStories[indexLoadedGroup][i]}.json`)
        .then(function (response) {
          // handle success
          const date = timeConverter(_.get(response.data, "time"));
          const title = _.get(response.data, "title");
          const link = _.get(response.data, "url");
          createArticle(date, title, link);
          // Unlocks requests
          requestIsRunning = false;
        })
        .catch(function (error) {
          // handle error
          dispatchInfo(error, 0);
        });
    }
    // If everything is ok, change the index
    indexLoadedGroup += 1;
  } catch (error) {
    dispatchInfo(error, 0);
    // Unlocks requests
    requestIsRunning = false;
  }
}

// Creates Article DOM
function createArticle(date, title, link){
  // Elements Creation
  const elemDiv = document.createElement("div");
  elemDiv.classList.add("article");
  const elemDate = document.createElement("h5");
  elemDate.innerText = `[${date}]`;
  const elemAnchor = document.createElement("a");
  elemAnchor.href = `${link}`;
  const elemTitle = document.createElement("h4");
  elemTitle.innerText = `${title} [...]`;
  //nesting
  elemDiv.appendChild(elemDate);
  elemDiv.appendChild(elemAnchor);
  elemAnchor.appendChild(elemTitle);
  //deploy
  document.getElementById("list").appendChild(elemDiv);
}

// Changes time formato from Unix
function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

// Show information on div#notification
// "type" indicate if it's a good info (= 1) or an error (= 0)
function dispatchInfo(info, type = 1){
  let note = document.getElementById("notification");
  if (type == 0){
    note.classList.add("bad");
    console.error(info);
  } else if (type == 1){
    note.classList.add("good");
    console.log(info);
  }
  note.innerText = info;
}

// Cleans all articles and requests new list
function cleanAndLoad(){
  let list = document.getElementById("list");
   while (list.firstChild) {
     list.removeChild(list.firstChild);
   }
  //Reset index
  indexLoadedGroup = 0;
  requestStories();
}

// Add events on elements
function addEvents(){
  //Refresh
  document.querySelector(".update-button").addEventListener("click", cleanAndLoad);
  //LoadMore
  document.querySelector(".loadMore").addEventListener("click", loadStories);
  
}

// Sets imgHeader
document.querySelector(".imgHeader").src = imgHeader;

// Starts (main) script here
requestStories();
addEvents();