import express from "express";
import {IPostDataStackOfBooks, IRespDataStackOfBooks, IResultBookStackTest} from "./types/TypeStackOfBooks";
import {BookStackTest} from "./stack-of-books/BookStackTest";
import {readTextFromFile} from "../global-elements/functions/readTextFromFile";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";
import {generateUniqueId} from "../global-elements/functions/generateUniqueId";

const router = express.Router()

const checkReqData = (elem: IPostDataStackOfBooks, index: number, warning: string[]) => {

    if (elem.nameFile === undefined || elem.nameFile === null) {
        warning.push(`В ${index} элементе запроса отсутствует название файла`)
    }

    if (elem.blockSize === undefined || elem.blockSize === null || elem.blockSize <= 0 || elem.blockSize > 10) {
        warning.push(`В ${index} элементе запроса отсутствует или не верно задан размер блока`)
    }

    if (elem.alpha === undefined || elem.alpha === null) {
        warning.push(`В ${index} элементе запроса отсутствует alpha`)
    }

    if (elem.alpha < 0.001 && elem.alpha > 0.1) {
        warning.push(`В ${index} элементе запроса должна иметь значение  0.001 <= alpha <= 0.1`)
    }

    if (elem.bitstreams === undefined || elem.bitstreams === null) {
        warning.push(`В ${index} элементе запроса отсутствует количество проведения тестов`)
    }

    if (elem.numberOfBits === undefined || elem.numberOfBits === null) {
        warning.push(`В ${index} элементе запроса отсутствует количество бит каждого прохода`)
    }

    if (elem.numberOfBits < 100) {
        warning.push(`В ${index} элементе запроса количество бит каждого прохода должно быть не менее 100`)
    }

}

const startBookStackTest = async (dataTest: IPostDataStackOfBooks, indexTest: number): Promise<IResultBookStackTest[]> => {

    const listResult: IResultBookStackTest[] = []

    for (let i = 0; i < dataTest.bitstreams; i++) {

        // Создаем экземпляр класса BookStackTest с заданной последовательностью бит, длиной блока и уровнем значимости
        let bookStackTest = new BookStackTest(
            // Считываем последовательность из файла. Изменяем свойства bits на новое
            await readTextFromFile(dataTest.numberOfBits * i, dataTest.numberOfBits, dataTest.nameFile, FILE_DIRECTORY),
            dataTest.blockSize,
            dataTest.alpha
        );
        // Запускаем тест и записываем в список результатов
        listResult.push(bookStackTest.runTest())
    }

    return listResult

}

router.post('/start-analysis', async (req, res) => {

    const postData: IPostDataStackOfBooks[] = req.body

    const resData: IRespDataStackOfBooks[] = []

    const warning: string[] = []


    try {

        postData.forEach((elem, index) => {
            checkReqData(elem, index, warning)
        })

        if (warning.length > 0) {
            res.status(500).json(warning)
        } else {

            await Promise.all(postData.map(async (test, indexTest) => {
                await startBookStackTest(test, indexTest)
                    .then(resp => {

                        let quantityCompletedTests = 0

                        resp.map((data) => {
                            if (data.passed) {
                                quantityCompletedTests++
                            }
                        })

                        resData.push({
                            result: resp,
                            nameFile: test.nameFile,
                            blockSize: test.blockSize,
                            bitstreams: test.bitstreams,
                            numberOfBits: test.numberOfBits,
                            quantityCompletedTests: quantityCompletedTests,
                            alpha: test.alpha,
                            uid: generateUniqueId()
                        })
                    })
            }))

            res.status(200).json(resData)
        }

    } catch (e) {
        res.status(500).json('Ошибка выполнения: ' + e)
    }

})


export = router