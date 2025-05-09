// export interface Service {
//     id: number;
//     ServiceType: boolean;
//     picture: string | null;
//     user: {
//         id: number;
//         //name: string; //todo may need to update the 
//     };
//     groupId: number | null;
//     category: string[];
//     description: string;
//     postComments: string[];
//     timestamp: string;
//     flagged:boolean;
// }

// export interface Service {
//     id: number;
//     ServiceType: boolean;
//     picture: string | null;
//     user: {
//         id: number;
//         // name: string; // still not used, but ok to keep if you need it later
//     };
//     groupId: number | null;
//     category: string[];
//     description: string;
//     postComments: string[];
//     timestamp: string;
//     flagged: boolean;
//     username?: string; // added this part so it is displayed in the card
// }

export interface Comment {
    username: string;
    text: string;
    timestamp: string;
  }
  
  export interface Service {
    id: string;
    ServiceType: boolean;
    picture: string | null;
    groupId: string | null;
    category: string[];
    description: string;
    comments: Comment[];
    timestamp: string;
    flagged: boolean;
    username: string;
  }