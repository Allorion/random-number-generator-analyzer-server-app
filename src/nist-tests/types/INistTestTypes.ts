import {IResFrequency} from "../nist-sts/frequencyTest";
import {IResCumulativeSumsBackwards, IResCumulativeSumsForward} from "../nist-sts/cumulativeSums";
import {IResRunsTest} from "../nist-sts/runTest";
import {IResRankTest} from "../nist-sts/rankTest";
import {IResLongestRunOfOnes} from "../nist-sts/longestRunOfOnes";
import {IResBlockFrequency} from "../nist-sts/blockFrequency";

export type INameTests =
    'frequencyTest' |
    "blockFrequency" |
    "cumulativeSums" |
    'runTest' |
    'longestRunOfOnes' |
    'rankTest' |
    'discreteFourierTransform' |
    'nonOverlappingTemplateMatchings' |
    'overlappingTemplateMatchings' |
    'universal' |
    'approximateEntropy' |
    'randomExcursions' |
    'randomExcursionsVariant' |
    'serialTest' |
    'linearComplexity' |
    'universalStatisticalTest' |
    'cumulativeSumsForwardTest' |
    'cumulativeSumsBackwardTest' |
    'randomExcursionTest' |
    'randomExcursionVariantTest'


interface IDopParams {
    bftParam: number | undefined,
    nottParam: number | undefined,
    ottParam: number | undefined,
    aetParam: number | undefined,
    stParam: number | undefined,
    lctParam: number | undefined
}

export interface INistTestsPostData {
    nameFile: string,
    listTests: INameTests[],
    alpha: number,
    dopParams: IDopParams,
    bitstreams: number,
    numberOfBits: number
}

export interface ICombinePValue {
    frequencyTest?: number,
    blockFrequency?: number,
    cumulativeSums?: { forward: number, backwards: number },
    runTest?: number,
    longestRunOfOnes?: number,
    rankTest?: number,
}

export interface IListPValue {
    frequencyTest?: number[],
    blockFrequency?: number[],
    cumulativeSums?: { forward: number[], backwards: number[] },
    runTest?: number[],
    longestRunOfOnes?: number[],
    rankTest?: number[],
}

export interface INistTestsRespData {
    nameFile: string,
    listTests: INameTests[],
    alpha: number,
    dopParams: IDopParams,
    bitstreams: number,
    numberOfBits: number,
    frequencyTest?: Array<IResFrequency | string>,
    blockFrequency?: Array<IResBlockFrequency | string>,
    cumulativeSums?: {
        forward: Array<IResCumulativeSumsForward | string>,
        backwards: Array<IResCumulativeSumsBackwards | string>,
    },
    runTest?: Array<IResRunsTest | string>,
    longestRunOfOnes?: Array<IResLongestRunOfOnes | string>,
    rankTest?: Array<IResRankTest | string>,
    combinePValue: ICombinePValue,
    uid: string,
}

export type BitSequence = 0 | 1;