
export const CREATE_order="CREATE_ORDER"
export const CANCEL_ORDER="CANCEL_ORDER"
export const GET_DEPTH="GET_DEPTH"
export const ORDER="ORDER"

export type MessageToApi={
    type:"DEPTH",
    payload:{
        bids:[string,string][],
        asks:[string,string][],
    }
} | {
    type:"ORDER_PLACED",
    payload:{
        orderId:string,
        executedQty:number,
        fills:{
            price: string,
            qty:number,
            tradeId:number
        }[]
    }
} | {
    type:"ORDER_CANCELLED",
    payload:{
        orderId:string,
        executedQty:number,
        remainingQty:number
    }
} | {
    type:"OPEN_ORDERS",
    payload:typeof ORDER[]
}