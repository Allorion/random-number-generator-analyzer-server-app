import express from "express";
import {getFilesInDirectory} from "../scripts/getFilesInDirectory";


const router = express.Router()

// Поиск файлов в директории
router.get('/list', (req, res) => {

    const directoryPath = 'src/binary-sequence-generation/storage-files/';

    res.status(200).json({
        status: 200,
        listFiles: getFilesInDirectory(directoryPath)
    })

});

export = router;