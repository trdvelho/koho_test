export interface ILoad {
    id: string,
    customer_id: string,
    load_amount: string,
    time: string
}

export interface IOutput {
    id: string,
    customer_id: string,
    accepted: boolean
}