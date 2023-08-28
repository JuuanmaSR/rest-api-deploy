const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        required_error: 'Movie title is required'
    }),
    year: z.number({
        required_error: 'Movie year is required'
    }).int().positive().min(1900).max(2024),
    director: z.string({
        required_error: 'Movie director is required'
    }),
    duration: z.number({
        required_error: 'Movie duration is required'
    }).int().positive(),
    poster: z.string({
        required_error: 'Movie poster is required'
    }).url(),
    genre: z.array(z.enum(['Drama', 'Suspense', 'Action', 'Adventure', 'Comedy', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi']), {
        required_error: 'Movie genre es required'
    }),
    rate: z.number({
        required_error: 'Movie rate is required'
    }).min(0).max(10).default(0)
})

function validateMovie (object) {
    return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
    return movieSchema.partial().safeParse(object)
}

module.exports = {
    validateMovie,
    validatePartialMovie
}