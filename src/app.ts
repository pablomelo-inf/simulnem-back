import express from 'express';
import routes from './interfaces/http/routes';
import cors from 'cors';

const app = express();
const port = 80;


// Configurate do CORS
const corsOptions = {
  origin: 'http://localhost:3000', // domain front-end
  methods: 'GET,POST,OPTIONS,PUT,PATCH,DELETE',
  allowedHeaders: 'Content-Type, Authorization',
  credentials: true
};

app.use(cors(corsOptions)); // Use o middleware CORS
app.use(express.json());
app.use('/api', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
