//Authenticate the user in order to generate a state to receive 
//the access token


let client_id = 'bdad6a3fd9154210928e311ee5bbf430';
let client_secret = '69cd4ddd7b9d46e8b47894e9a656230e';
let redirect_uri = 'https://abun100.github.io/spotify_abun/';

const AUTHORIZE = "https://accounts.spotify.com/authorize";
const TOKEN = "https://accounts.spotify.com/api/token";

/* 
    When user logs in, build a url and lead the user to the 
    spotify authentication page. The query string includes the 
    client id, reponse type, redirect url, and scope 
    (what the user has access to when the api is called), 
    in this case only read data
*/
function requestAuthorization() {
    localStorage.setItem("client_id", client_id);
    localStorage.setItem("client_secret", client_secret);
    
    let url = AUTHORIZE;
    url += "?client_id=" + client_id;
    url += "&response_type=code";
    url += "&redirect_uri=" + encodeURI(redirect_uri);
    url += "&show_dialog=true";
    url += "&scope=user-read-private user-read-email user-top-read";
    window.location.href = url;     
}


function onPageLoad() {
    localStorage.setItem('client_id', client_id);
    localStorage.setItem('client_secret', client_secret);
    client_id = localStorage.getItem("client_id");
    client_secret = localStorage.getItem("client_secret");
    if(window.location.search.length > 0) {
        handleRedirect();
    }
    else {
        access_token = localStorage.getItem("access_token");
        refresh_token = localStorage.getItem("refresh_token");
        if(access_token == null) {
            console.log("We do not have a valid access token, Initiate refresh_token");
            refreshAccessToken();
        }
        else {
            console.log("We have a valid acess token");
            getUserData();
            getUserTracks();
            getAudioFeatures();
        }
    }
}

function login() {
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private';
    const authUrl = `${AUTHORIZE}?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirect_uri)}&show_dialog=true`;
    window.location.href = authUrl;
}

function handleRedirect() {
    let code = getCode();
    fetchToken(code);
    window.history.pushState("", "", redirect_uri); // remove param from url    
}

/*
    is exchange for the authorizatoin code, we can get
    the access token. This is done by making a POST 
    request to the /api/token endpoint
*/
function fetchToken(code) {
    let body = "grant_type=authorization_code";
    body += "&code=" + code; 
    body += "&redirect_uri=" + encodeURI(redirect_uri);
    body += "&client_id=" + client_id;
    body += "&client_secret=" + client_secret;
    callAuthorizationAPI(body);
}

function refreshAccessToken(){
    refresh_token = localStorage.getItem("refresh_token");
    let body = "grant_type=refresh_token";
    body += "&refresh_token=" + refresh_token;
    body += "&client_id=" + client_id;
    callAuthorizationAPI(body);
}

function callAuthorizationAPI(body) {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", TOKEN, true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.setRequestHeader('Authorization', 'Basic ' + btoa(client_id + ":" + client_secret));
    xhr.send(body);
    xhr.onload = handleAuthorizationResponse;
}


function handleAuthorizationResponse(){
    if ( this.status == 200 ){
        var data = JSON.parse(this.responseText);
        console.log(data);
        var data = JSON.parse(this.responseText);
        if ( data.access_token != undefined ){
            access_token = data.access_token;
            localStorage.setItem("access_token", access_token);
        }
        if ( data.refresh_token  != undefined ){
            refresh_token = data.refresh_token;
            localStorage.setItem("refresh_token", refresh_token);
        }
        onPageLoad();
    }
    else {
        console.log(this.responseText);
        alert(this.responseText);
    }
}
/*
    Return back after authorization access and now
    the code and state are returned in queery string.
    Parse the code from query string and return 
*/
function getCode() {
    let code = null;
    const queryString = window.location.search;
    if(queryString.length > 0) {
        const urlParams = new URLSearchParams(queryString);
        code = urlParams.get('code');
    }
    return code;
}

/*
    API Call Functions
*/

async function fetchWebApi(endpoint, method, body) {
    const access_token = localStorage.getItem('access_token');
    console.log(`https://api.spotify.com/${endpoint}`)
    const response = await fetch(`https://api.spotify.com/${endpoint}`, {
        headers: {Authorization: `Bearer ${access_token}` },
        method,
        body:JSON.stringify(body)
    });
    if(response.status == 401) {
        refreshAccessToken();
    }
    return await response.json();
}

async function getUserData() {
    const data = await fetchWebApi("v1/me/top/artists", 'GET');
    const artists = data.items;
    
    let pageImgs = document.querySelectorAll('.image-item img');
    let artistText = document.querySelectorAll('.image-item p');
    artists.forEach((artist, index) => {
        const name = artist.name;
        const img = artist.images;
        const img_link = img.map(image =>image.url)
        
        // Check if there is an image element at the specified index
        if (pageImgs[index]) {
            pageImgs[index].src = img_link[0];
            artistText[index].textContent = index+1 + '. ' + name;
        }
    });
    await getUserTracks();
}

async function getUserTracks() {
    const data = await fetchWebApi('v1/me/top/tracks?time_range=medium_term&limit=15', 'GET')
    localStorage.setItem('track_data', JSON.stringify(data));
}

async function getAudioFeatures() {
    const ids = getItemCategory('id', 'None')
    const endpoint = "v1/audio-features?ids=" + ids;
    const data = await fetchWebApi(endpoint, 'GET')
    const audioData = data.audio_features;
    console.log(audioData)
}

async function getRecommend() {
    const songs = getItemCategory('id', 'None')
    const topFiveSongs = []
    for(let i=0; i<5; i++) {
        topFiveSongs.push(songs[i])
    }

    const data = await fetchWebApi('v1/recommendations?seed_tracks=' + topFiveSongs, 'GET')
    tracks = data.tracks
    console.log(tracks)
    recommendImg = document.querySelectorAll('.recommend-img img');
    artistText = document.querySelectorAll('.recommend-img p');

    tracks.forEach((track, index) => {
        const name = track.name
        const album = track.album;
        const img = album.images
        const artists = track.artists
        const artist_name = artists.map(artist=>artist.name)
        const img_link = img.map(image =>image.url)

        // Check if there is an image element at the specified index
        if (recommendImg[index]) {
            recommendImg[index].style.visibility = 'visible';
            artistText[index].style.visibility = 'visible';
            recommendImg[index].src = img_link[0];
            artistText[index].textContent = name + " by  " + artist_name;
        }
    })
}

function getItemCategory(category, subCategory) {
    const data = JSON.parse(localStorage.getItem('track_data'));
    const tracks = data.items;

    categoryData = [];
    tracks.forEach(track => {
        if(Array.isArray(track[category]) && subCategory !== 'None') {
            subData = [];
            (track[category]).forEach(item => {
                subData.push((item[subCategory]));
            })
            categoryData.push(subData);
        }
        else {
            categoryData.push(track[category]);
        }
        // const name = track.name;
        // const popularity = track.popularity;
        // const artists = track.artists;
        // const artist_name = artists.map(artist =>artist.name);
        // console.log(`Song Name: ${name}`);
        // console.log(`Popularity: ${popularity}`);
        // console.log(`artist_name: ${artist_name.join(', ')}`);
        // console.log("")
    });

    return categoryData;
}