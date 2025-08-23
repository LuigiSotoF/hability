export type ResponseWrapper<T> = {
    data: T;
    isOk: true;
} | {
    error: string;
    isOk: false;
}