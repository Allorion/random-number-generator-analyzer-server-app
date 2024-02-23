import express from 'express';
import cors from 'cors';
import * as bodyParser from 'body-parser';

const app = express();

// Middleware для CORS
app.use(cors());

// Middleware для обработки JSON-запросов
app.use(bodyParser.json());

// Подключение маршрутов API
app.use('/api/binary-sequence-generation', require('./src/binary-sequence-generation/api/binarySequenceGeneration'));
app.use('/api/files-binary-sequence', require('./src/files-binary-sequence/api/apiFilesBinarySequence'));
app.use('/api/nist-tests', require('./src/nist-tests/apiNistTests'));
app.use('/api/stack-of-books-tests', require('./src/stack-of-books-test/apiStackOfBooksTest'));
app.use('/api/graph-distribution-test-on-a-plane', require('./src/graphical-distribution-test-on-a-plane/apiGraphicalDistributionTestOnPlane'));

const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Сервер запущен на порту ${port}`);
});
