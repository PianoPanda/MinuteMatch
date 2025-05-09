

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