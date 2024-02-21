import {IResFrequency} from "../nist-sts/frequencyTest";
import {IResCumulativeSumsBackwards, IResCumulativeSumsForward} from "../nist-sts/cumulativeSums";
import {IResRunsTest} from "../nist-sts/runTest";
import {IResRankTest} from "../nist-sts/rankTest";
import {IResLongestRunOfOnes} from "../nist-sts/longestRunOfOnes";
import {IResBlockFrequency} from "../nist-sts/blockFrequency";
import {IOverlappingTemplateMatchings} from "../nist-sts/overlappingTemplateMatchings";
import {IUniversal, universal} from "../nist-sts/universal";
import {approximateEntropy, IApproximateEntropy} from "../nist-sts/approximateEntropy";
import {IListResultRandomExcursions, IRandomExcursions, randomExcursions} from "../nist-sts/randomExcursions";
import {
    IListResultRandomExcursionsVariant,
    IRandomExcursionsVariant,
    randomExcursionsVariant
} from "../nist-sts/randomExcursionsVariant";
import {ISerialTest, serialTest} from "../nist-sts/serialTest";
import {ILinearComplexity, linearComplexity} from "../nist-sts/linearComplexity";

// [01] Frequency
// [02] Block Frequency
// [03] Cumulative Sums
// [04] Runs
// [05] Longest Run of Ones
// [06] Rank
// [07] Discrete Fourier Transform (надо доделать)
// [08] Nonperiodic Template Matchings (надо доделать)
// [09] Overlapping Template Matchings
// [10] Universal Statistical
// [11] Approximate Entropy
// [12] Random Excursions
// [13] Random Excursions Variant
// [14] Serial
// [15] Linear Complexity

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

    overlappingTemplateMatchings?: number,
    universal?: number,
    approximateEntropy?: number,
    randomExcursions?: number,
    randomExcursionsVariant?: number,
    serialTest?: [number, number],
    linearComplexity?: number,
}

export interface IListPValue {
    frequencyTest?: number[],
    blockFrequency?: number[],
    cumulativeSums?: { forward: number[], backwards: number[] },
    runTest?: number[],
    longestRunOfOnes?: number[],
    rankTest?: number[],

    overlappingTemplateMatchings?: number[],
    universal?: number[],
    approximateEntropy?: number[],
    randomExcursions?: IListResultRandomExcursions[],
    randomExcursionsVariant?: IListResultRandomExcursionsVariant[][],
    serialTest?: [number, number][],
    linearComplexity?: number[],
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

    overlappingTemplateMatchings?: Array<IOverlappingTemplateMatchings | string>,
    universal?: Array<IUniversal | string>,
    approximateEntropy?: Array<IApproximateEntropy | string>,
    randomExcursions?: Array<IRandomExcursions | string>,
    randomExcursionsVariant?: Array<IRandomExcursionsVariant | string>,
    serialTest?: Array<ISerialTest | string>,
    linearComplexity?: Array<ILinearComplexity | string>,
    combinePValue: ICombinePValue,
    uid: string,
}

export type BitSequence = 0 | 1;