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
import {readTextFromFile} from "../global-elements/functions/readTextFromFile";
import {FILE_DIRECTORY} from "../global-elements/fileDirectory";
import {overlappingTemplateMatchings} from "./nist-sts/overlappingTemplateMatchings";
import {universal} from "./nist-sts/universal";
import {approximateEntropy} from "./nist-sts/approximateEntropy";
import {randomExcursions} from "./nist-sts/randomExcursions";
import {randomExcursionsVariant} from "./nist-sts/randomExcursionsVariant";
import {serialTest} from "./nist-sts/serialTest";
import {linearComplexity} from "./nist-sts/linearComplexity";

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
                } else if (test === 'nonOverlappingTemplateMatchings' && elem.dopParams?.nottParam === undefined) {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока NonOverlapping Template Test`)
                } else if (test === 'overlappingTemplateMatchings' && elem.dopParams?.ottParam === undefined) {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Overlapping Template Test`)
                } else if (test === 'approximateEntropy' && elem.dopParams?.aetParam === undefined) {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Approximate Entropy Test`)
                } else if (test === 'serialTest' && elem.dopParams?.stParam === undefined) {
                    warning.push(`В ${index} элементе запроса отсутствует длина блока Serial Test`)
                } else if (test === 'linearComplexity' && elem.dopParams?.lctParam === undefined) {
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


                case "overlappingTemplateMatchings":
                    if (listResult.overlappingTemplateMatchings === undefined) {
                        listResult.overlappingTemplateMatchings = []
                    }
                    if (listPValues.overlappingTemplateMatchings === undefined) {
                        listPValues.overlappingTemplateMatchings = []
                    }
                    try {
                        const result = overlappingTemplateMatchings(bitsLine, data.numberOfBits, data.dopParams?.ottParam, data.alpha)
                        listPValues.overlappingTemplateMatchings.push(result.pValue)
                        listResult.overlappingTemplateMatchings.push(result)
                    } catch (e) {
                        listResult.overlappingTemplateMatchings.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "universal":
                    if (listResult.universal === undefined) {
                        listResult.universal = []
                    }
                    if (listPValues.universal === undefined) {
                        listPValues.universal = []
                    }
                    try {
                        const result = universal(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.universal.push(result.pValue)
                        listResult.universal.push(result)
                    } catch (e) {
                        listResult.universal.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "approximateEntropy":
                    if (listResult.approximateEntropy === undefined) {
                        listResult.approximateEntropy = []
                    }
                    if (listPValues.approximateEntropy === undefined) {
                        listPValues.approximateEntropy = []
                    }
                    try {
                        const result = approximateEntropy(bitsLine, data.numberOfBits, data.dopParams?.aetParam, data.alpha)
                        listPValues.approximateEntropy.push(result.pValue)
                        listResult.approximateEntropy.push(result)
                    } catch (e) {
                        listResult.approximateEntropy.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "randomExcursions":
                    if (listResult.randomExcursions === undefined) {
                        listResult.randomExcursions = []
                    }
                    if (listPValues.randomExcursions === undefined) {
                        listPValues.randomExcursions = []
                    }
                    try {
                        const result = randomExcursions(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.randomExcursions = result.listResult
                        listResult.randomExcursions.push(result)
                    } catch (e) {
                        listResult.randomExcursions.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "randomExcursionsVariant":
                    if (listResult.randomExcursionsVariant === undefined) {
                        listResult.randomExcursionsVariant = []
                    }
                    if (listPValues.randomExcursionsVariant === undefined) {
                        listPValues.randomExcursionsVariant = []
                    }
                    try {
                        const result = randomExcursionsVariant(bitsLine, data.numberOfBits, data.alpha)
                        listPValues.randomExcursionsVariant.push(result.listResult)
                        listResult.randomExcursionsVariant.push(result)
                    } catch (e) {
                        listResult.randomExcursionsVariant.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "serialTest":
                    if (listResult.serialTest === undefined) {
                        listResult.serialTest = []
                    }
                    if (listPValues.serialTest === undefined) {
                        listPValues.serialTest = []
                    }
                    try {
                        const result = serialTest(bitsLine, data.numberOfBits, data.dopParams?.stParam, data.alpha)
                        listPValues.serialTest.push(result.pValue)
                        listResult.serialTest.push(result)
                    } catch (e) {
                        listResult.serialTest.push(`Ошибка выполнения теста! ${e}`)
                    }
                    break
                case "linearComplexity":
                    if (listResult.linearComplexity === undefined) {
                        listResult.linearComplexity = []
                    }
                    if (listPValues.linearComplexity === undefined) {
                        listPValues.linearComplexity = []
                    }
                    try {
                        const result = linearComplexity(bitsLine, data.numberOfBits, data.dopParams?.lctParam, data.alpha)
                        listPValues.linearComplexity.push(result.pValue)
                        listResult.linearComplexity.push(result)
                    } catch (e) {
                        listResult.linearComplexity.push(`Ошибка выполнения теста! ${e}`)
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
        } else if (key === 'serialTest') {
            const list1: number[] = []
            const list2: number[] = []
            value.map((opt: number[]) => {
                list1.push(opt[0])
                list2.push(opt[1])
            })
            listResult.combinePValue.serialTest = [combinePValues(list1), combinePValues(list2)]
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
        console.log(e)
        res.status(500).json(e)
    }

})

export = router