const express = require('express')
const axios = require('axios')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path')
const app = express()

const client_id = 'bdad6a3fd9154210928e311ee5bbf430';
const client_secret = '69cd4ddd7b9d46e8b47894e9a656230e';
const redirect_uri = 'http://localhost:3000';

app.use(bodyParser.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, './src/util')))
console.log(__dirname)

app.get('/login', (req, res) => {
    const scopes = 'user-read-private user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-private'
    const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${client_id}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(redirect_uri)}`;
    res.redirect(authUrl)
})

app.post('/callback', async (req, res) => {
    const code = req.query.code || null
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token', null, {
            params: {
                grant_type: 'authorization_code',
                code: code, 
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        const { access_token, refresh_token } = response.data

        //Store the tokens in cookies 
        res.cookie('access_token', access_token)
        res.cookie('refresh_token', access_token)
        
        res.redirect('/app')
    } catch (error) {
        res.status(400).json(error.response.data)
    }
})

app.get('/token', (req, res) => {
    const access_token = req.cookies.access_token || null
    res.json({ access_token: access_token })
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))