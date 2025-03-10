import './bundle.scss';


const clientId = process.env.SPOTIFY_CLIENT_ID;
const redirect_uri = process.env.REDIRECT_URI;

const queryString = window.location.search;

const urlParams = new URLSearchParams(queryString);

const code = urlParams.get('code') || null;

let currentlyPlaying = null;

updateSize();

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);

    updateCurrentlyPlayingLoop(accessToken);
}

function updateSize() {
    let size = Math.min(window.innerWidth, window.innerHeight);

    document.getElementById("image").height = size;
    document.getElementById("image").width = size;
};

async function redirectToAuthCodeFlow(clientId) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", redirect_uri);
    params.append("scope", "user-read-private user-read-email user-read-currently-playing");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length) {
    let text = '';
    let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", redirect_uri);
    params.append("code_verifier", verifier);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function updateCurrentlyPlayingLoop(token) {
    await updateCurrentlyPlaying(token);

    setTimeout(() => {
        updateCurrentlyPlayingLoop(token);
    }, 2000);
}

async function updateCurrentlyPlaying(token) {
    const result = await fetch("https://api.spotify.com/v1/me/player/currently-playing", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    let data = await result.json();

    let trackHref = data.item.href;

    if (trackHref !== currentlyPlaying) {
        currentlyPlaying = trackHref;

        if (data.item.album.images[0]) {
            document.getElementById("image").src = data.item.album.images[0].url;
        }
    }
}

window.addEventListener('resize', () => {
    updateSize();
  });
  