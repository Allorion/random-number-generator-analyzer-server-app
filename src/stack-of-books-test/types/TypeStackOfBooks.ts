export  interface IPostDataStackOfBooks {
    nameFile: string;
    alpha: number;
    blockSize: number;
    bitstreams: number;
    numberOfBits: number
}

export  interface IRespDataStackOfBooks {
    result: IResultBookStackTest[];
    nameFile: string;
    blockSize: number;
    bitstreams: number;
    numberOfBits: number;
    quantityCompletedTests: number;
    alpha: number;
    uid: string
}

export  interface IResultBookStackTest {
    frequencies: number[];
    chi: number;
    df: number;
    chiCritical: number;
    alpha: number;
    passed: boolean;
    pValue: number;
    resultPValue: 'FAILURE' | 'SUCCESS';
}