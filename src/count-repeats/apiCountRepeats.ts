import express from "express";
import {readBitsFromFile} from "../global-elements/functions/readTextFromFile";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";

interface IReqData {
    nameFile: string,
    byteCount: number
}

const router = express.Router()


const validData = (data: IReqData): string[] => {

    const err: string[] = []

    if (typeof data.nameFile !== "string") {
        err.push('- Не верно задано название файла')
    }

    if (data.byteCount < 1 || data.byteCount > 125000000) {
        err.push('- Количество байт не должно быть меньше 1 и больше 125млн')
    }

    return err

}

const startTest = async (data: IReqData): Promise<Record<number, number>> => {

    // Читаем байты из файла, используя функцию readBitsFromFile
    const buffer = readBitsFromFile(0, data.byteCount * 8, FILE_DIRECTORY + data.nameFile);

    // Создаем пустой объект для хранения результата
    let result: Record<number, number> = {};

    // Проходим по всем элементам массива
    for (let num of buffer) {
        // Если число уже есть в объекте, увеличиваем его значение на 1
        if (result[num]) {
            result[num]++;
        } else {
            // Иначе, добавляем число в объект с значением 1
            result[num] = 1;
        }
    }
    // Возвращаем объект с результатом
    return result;

}

router.post('/start-tests', async (req, res) => {

    const reqData: IReqData = req.body

    const err: string[] = validData(reqData)

    if (err.length > 0) {
        res.status(500).json(err.join('\n'))
    } else {
        try {
            const data: Record<number, number> = await startTest(reqData)
            const result: {result: Record<number, number>, nameFile: string} = {result: data, nameFile: reqData.nameFile}
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json([e])
        }
    }

})


export = router