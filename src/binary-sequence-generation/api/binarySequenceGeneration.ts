//**********************************************************************************************************************
// Методы реализующие функционал работы с сгенерированными бинарными файлами
//**********************************************************************************************************************


import express from "express";
import {mersenneTwisterGenerate} from "../scripts/mersenneTwisterGenerate";
import {mathRandomGenerate} from "../scripts/mathRandomGenerate";
import {
    generateCryptoSequence,
} from "../scripts/cryptoGetRandomValuesGenerate";

const router = express.Router()

const generation = (
    postData: {
        length: number,
        frequency?: number
    },
    method: 'mtg' | 'mathRandGen' | 'cryptoSequence' | 'binSeqGenWithFrequencySelect',
) => {

    const res = {
        status: 500,
        text: '',
        method: method
    };

    if (postData.length > 0 && postData.length <= 10000000000) {
        try {
            const filePath = `${method}:${postData.length}:${new Date().toLocaleString('ru')}.bin`;
            let result: { flag: boolean, text: string } | undefined = undefined

            switch (method) {
                case "mtg":
                    result = mersenneTwisterGenerate(postData.length, 'src/binary-sequence-generation/storage-files/' + filePath)
                    break;
                case "mathRandGen":
                    result = mathRandomGenerate(postData.length, postData.frequency, 'src/binary-sequence-generation/storage-files/' + filePath)
                    break;
                case "cryptoSequence":
                    result = generateCryptoSequence(postData.length, 'src/binary-sequence-generation/storage-files/' + filePath)
                    break;
            }

            if (result === undefined) {
                res.text = 'Ошибка при сохранении последовательности';
            } else {
                if (result.flag) {
                    res.status = 201
                    res.text = 'Последовательность успешно сохранена! Название файла: ' + filePath
                } else {
                    res.status = 500
                    res.text = 'Последовательность не сохранена! Ошибка: ' + result.text
                }
            }

        } catch (error) {
            res.text = 'Ошибка при сохранении последовательности';
        }
    } else {
        res.text = 'Длина последовательности должна быть больше 0 и меньше 10 миллиардов';
    }

    return res;
}

// Генерация бинарной последовательности методом Mersenne Twister 19937
router.post('/mersenne-twister-generate', (req, res) => {

    const postData: {
        length: number
    } = req.body;

    const result = generation(postData, 'mtg')

    res.status(result.status).json(result)

});

// Генерация бинарной последовательности методом Math.random()
router.post('/math-random-generate', (req, res) => {

    const postData: {
        length: number,
        frequency: number,
    } = req.body;

    const result = generation(postData, 'mathRandGen')

    res.status(result.status).json(result)

});

// Генерация бинарной последовательности методом crypto.getRandomValues
router.post('/crypto-random-generate', (req, res) => {

    const postData: {
        length: number
    } = req.body;

    const result = generation(postData, 'cryptoSequence')

    res.status(result.status).json(result)

});

export = router;