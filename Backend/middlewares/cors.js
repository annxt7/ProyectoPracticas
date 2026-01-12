const cors = require("cors");

const allowedOrigins = [
    "http://localhost:5173",
    "https://axel.informaticamajada.es"
];

module.exports = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
});