import express from 'express';
import cors from 'cors';
import { config } from './config/environment';
import routes from './routes';

const app = express();

app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

app.listen(config.port, () => {
  console.log(`server is running on ${config.nodeEnv} mode on port ${config.port}`);
});
