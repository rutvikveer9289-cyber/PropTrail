export interface Visit{
    
    visitId?:number;

    brokerId:number;

    leadId:number;

    propertyId:number;

    visitDate:string;

    status:string;

    notes:string;

    clientFeedback?:string;
    clientRating?:number;
    feedbackStatus?:string;
}