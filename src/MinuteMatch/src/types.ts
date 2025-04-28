export interface Service {
    id: number;
    ServiceType: boolean;
    picture: string | null;
    user: {
        id: number;
        //name: string; //todo may need to update the 
    };
    groupId: number | null;
    category: string[];
    description: string;
    postComments: string[];
    timestamp: string;
    flagged:boolean;
}