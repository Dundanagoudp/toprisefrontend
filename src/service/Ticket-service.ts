import apiClient from "@/apiClient";
import { TicketResponse } from "@/types/Ticket-types";


export const getTickets = async (): Promise<TicketResponse> => {
    try{
        const response = await apiClient.get("/orders/api/tickets")
        return response.data
    }
    catch(err:any){
        console.log("error in get tickets",err)
        throw err
    }
}