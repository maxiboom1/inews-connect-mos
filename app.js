import express from "express";
import cors from "cors";
import bodyParser from 'body-parser';
import routes from "./src/5-routes/routes.js";
import appProcessor from "./src/4-services/app-processor.js";
import appConfig from "./src/3-utilities/app-config.js";
import startTcpServer from './src/1-dal/tcp.js'; // just importing starts the listener
import prwRouter from "./src/5-routes/prw.js";


const app = express(); 

app.use(cors({origin: '*'}));

// Increase payload size limit to 50MB
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use("/api",routes);

// PRW routes (HEAD + static with no-cache)
app.use("/prw", prwRouter);

// Static server http://localhost:3000/plugin
app.use(express.static('plugin')); 

startTcpServer();
// Start the Express server

app.listen(appConfig.pluginPort, () => {
    appProcessor.initialize();
});