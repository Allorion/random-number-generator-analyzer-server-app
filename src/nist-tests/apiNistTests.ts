import express from "express";
import {IListPValue, INistTestsPostData, INistTestsRespData} from "./types/INistTestTypes";
import {frequencyTest} from "./nist-sts/frequencyTest";
import {blockFrequency} from "./nist-sts/blockFrequency";
import {cumulativeSums} from "./nist-sts/cumulativeSums";
import {runTest} from "./nist-sts/runTest";
import {longestRunOfOnes} from "./nist-sts/longestRunOfOnes";
import {rankTest} from "./nist-sts/rankTest";
import {generateUniqueId} from "../global-elements/functions/generateUniqueId";
import {combinePValues} from "./scripts/combinePValues";
import {removeSpacesFromFile} from "../global-elements/functions/removeSpacesFromFile";
import {readTextFromFile} from "../global-elements/functions/readTextFromFile";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";

const router = express.Router()

const checkReqData = (elem: INistTestsPostData, index: number, warning: string[]) => {

    if (elem.nameFile === undefined || elem.nameFile === null) {
        warning.push(`В ${index} элементе запроса отсутствует название файла`)
    }

    if (elem.listTests.length === undefined || elem.listTests.length === null || elem.listTests.length === 0) {
        warning.push(`В ${index} элементе запроса отсутствуют тесты`)
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

    if (elem.listTests.length > 0) {
        if (elem.dopParams === undefined) {
            warning.push(`В ${index} элементе запроса отсутствуют дополнительные параметры для тестов`)
        } else {
            elem.listTests.forEach(test => {
                if (test === 'blockFrequency' && elem.dopParams?.bftParam === undefined) {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Block Frequency Test`)
                } else if (test === 'nonOverlappingTemplateMatchings') {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока NonOverlapping Template Test`)
                } else if (test === 'overlappingTemplateMatchings') {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Overlapping Template Test`)
                } else if (test === 'approximateEntropy') {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Approximate Entropy Test`)
                } else if (test === 'serialTest') {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Serial Test`)
                } else if (test === 'linearComplexity') {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Linear Complexity Test`)
                }
            })
        }
    }
}

const startNistTests = async (data: INistTestsPostData, index: number): Promise<INistTestsRespData> => {

    const listResult: INistTestsRespData = {
        nameFile: data.nameFile,
        listTests: data.listTests,
        alpha: data.alpha,
        dopParams: data.dopParams,
        bitstreams: data.bitstreams,
        combinePValue: {},
        uid: generateUniqueId(),
        numberOfBits: data.numberOfBits
    }

    await removeSpacesFromFile(data.nameFile, FILE_DIRECTORY)

    const listPValues: IListPValue = {}

    for (let i = 0; i < data.bitstreams; i++) {

        let bitsLine: number[] = await readTextFromFile(data.numberOfBits * i, data.numberOfBits, data.nameFile, FILE_DIRECTORY)

        data.listTests.map((test, indexTest) => {

            switch (test) {
                case "frequencyTest":
                    if (listResult.frequencyTest === undefined) {
                        listResult.frequencyTest = []
                    }
                    if (listPValues.frequencyTest === undefined) {
                        listPValues.frequencyTest = []
                    }
                    try {
                        const result = frequencyTest(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.frequencyTest.push(result.pValue)
                        listResult.frequencyTest.push(result)
                    } catch (e) {
                        listResult.frequencyTest.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "blockFrequency":
                    if (listResult.blockFrequency === undefined) {
                        listResult.blockFrequency = []
                    }
                    if (listPValues.blockFrequency === undefined) {
                        listPValues.blockFrequency = []
                    }
                    try {
                        const result = blockFrequency(bitsLine, data.numberOfBits, data.dopParams?.bftParam, data.alpha)
                        listPValues.blockFrequency.push(result.pValue)
                        listResult.blockFrequency.push(result)
                    } catch (e) {
                        listResult.blockFrequency.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "cumulativeSums":
                    if (listResult.cumulativeSums === undefined) {
                        listResult.cumulativeSums = {
                            forward: [],
                            backwards: []
                        }
                    }
                    if (listPValues.cumulativeSums === undefined) {
                        listPValues.cumulativeSums = {forward: [], backwards: []}
                    }
                    try {
                        const result = cumulativeSums(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.cumulativeSums.forward.push(result.forward.pValue)
                        listPValues.cumulativeSums.backwards.push(result.backwards.pValue)
                        listResult.cumulativeSums.forward.push(result.forward)
                        listResult.cumulativeSums.backwards.push(result.backwards)
                    } catch (e) {
                        listResult.cumulativeSums.forward.push(`Ошибка выполнения теста! ${e}`)
                        listResult.cumulativeSums.backwards.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "runTest":
                    if (listResult.runTest === undefined) {
                        listResult.runTest = []
                    }
                    if (listPValues.runTest === undefined) {
                        listPValues.runTest = []
                    }
                    try {
                        const result = runTest(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.runTest.push(result.pValue)
                        listResult.runTest.push(result)
                    } catch (e) {
                        listResult.runTest.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "longestRunOfOnes":
                    if (listResult.longestRunOfOnes === undefined) {
                        listResult.longestRunOfOnes = []
                    }
                    if (listPValues.longestRunOfOnes === undefined) {
                        listPValues.longestRunOfOnes = []
                    }
                    try {
                        const result = longestRunOfOnes(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.longestRunOfOnes.push(result.pValue)
                        listResult.longestRunOfOnes.push(result)
                    } catch (e) {
                        listResult.longestRunOfOnes.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "rankTest":
                    if (listResult.rankTest === undefined) {
                        listResult.rankTest = []
                    }
                    if (listPValues.rankTest === undefined) {
                        listPValues.rankTest = []
                    }
                    try {
                        const result = rankTest(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.rankTest.push(result.pValue)
                        listResult.rankTest.push(result)
                    } catch (e) {
                        listResult.rankTest.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
            }

        })
    }

    Object.entries(listPValues).map(([key, value]) => {
        if (key === 'cumulativeSums') {
            listResult.combinePValue.cumulativeSums = {forward: 0, backwards: 0}
            //@ts-ignore
            listResult.combinePValue.cumulativeSums.forward = combinePValues(value.forward)
            //@ts-ignore
            listResult.combinePValue.cumulativeSums.backwards = combinePValues(value.backwards)
        } else {
            //@ts-ignore
            listResult.combinePValue[key] = combinePValues(value)
        }
    })

    return listResult
}


router.post('/start-analysis', async (req, res) => {

    const reqData: INistTestsPostData[] = req.body

    let resData: INistTestsRespData[] = []

    const warning: string[] = []

    try {

        reqData.forEach((elem, index) => {
            checkReqData(elem, index, warning)
        })

        if (warning.length > 0) {
            res.status(500).json(warning)
        } else {

            // Ждем завершения всех асинхронных операций в цикле map
            await Promise.all(reqData.map(async (opt, index) => {
                await startNistTests(opt, index)
                    .then(res => {
                        resData.push(res)
                    })

            }))

            res.status(200).json(resData)
        }


    } catch (e) {
        res.status(500).json(e)
    }

})

export = router