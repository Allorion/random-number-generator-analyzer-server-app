export function generateUniqueId(): string {
    const timestamp: number = new Date().getTime();
    const randomPart: number = Math.floor(Math.random() * 1000000);
    return `${timestamp}-${randomPart}`;
}

