interface Service{
id:number;
type:string;
category:string;
group:string;
user:User
description:string;
picture:string;
}

interface User{
    id:number;
    name:string;
}

export type {Service,User}