const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = express.Router();
const jobAnalysisController = require('./src/modules/job-analyse/job-analysis.controller');

const app = express();
app.use(cors({
    origin: '*',
}));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
// Connect to MongoDB
const MONGO_DB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGO_DB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

router.post('/analyse-job', jobAnalysisController.analyseJob);

router.get('/', (req, res) => {
  res.send('Career Campus API is running');
});

app.use('/api', router);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Server is running on http://localhost:3000');
});