const express = require('express')
const app = express()
const crypto = require('node:crypto')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./schemas/movies.js')

const PORT = process.env.PORT ?? 1234

// deshabilitar el header X-Powered-By: Express
app.disable('x-powered-by')

//Middleware
app.use(express.json())
app.use(cors({
    origin: (origin, callback) => {
        // CORS
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:8081',
            'http://localhost:8082',
            'http://localhost:8083',
            'http://192.168.100.3:8080'
        ]
        if (ACCEPTED_ORIGINS.includes(origin)) {
            return callback(null, true)
        }
        if (!origin) {
            return callback(null, true)
        }
        return callback(new Error('Not allowed by CORS'))
    }
}))

app.get('/', (req, res) => {
    res.send('<h1>Mi API Rest </h1>')
})


// Todo los recursos que sean MOVIES se identifica con /movies
app.get('/movies', (req, res) => {


    const { genre } = req.query
    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        )
        if (filteredMovies.length > 0) {
            return res.json(filteredMovies)
        } else {
            return res.status(404).json({ message: 'Movies not found' })
        }
    }
    res.json(movies)
})

app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id === id)
    if (movie) return res.json(movie)
    res.status(404).json({ message: 'Movie not found' })
})

// Metodos POST
app.post('/movies', (req, res) => {

    const result = validateMovie(req.body)
    if (result.error) {
        res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    }
    movies.push(newMovie)
    res.status(201).json(newMovie)
})

// Actualizar una parte de la pelicula
app.patch('/movies/:id', (req, res) => {
    const { id } = req.params
    const result = validatePartialMovie(req.body)

    if (result.error) {
        return res.status(422).json({ error: JSON.parse(result.error.message) })
    }

    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }
    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie

    return res.json(updateMovie)
})


// Eliminar una pelicula
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    if (movieIndex === -1) {
        return res.status(404).json({ message: 'Movie not found' })
    }
    const deletedMovie = movies.splice(movieIndex, 1)
    res.status(204).json({
        success: true,
        message: 'Movie deleted',
        deletedMovie
    })
})


app.listen(PORT, () => {
    console.log(`Server listening on port: http://localhost:${PORT}`)
})