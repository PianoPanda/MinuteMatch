export interface Service {
    id: number;
    ServiceType: boolean;
    picture: string | null;
    user: {
        id: number;
        name: string;
    };
    groupId: number | null;
    category: string[];
    description: string;
    postComments: string[];
    timestamp: string;
}