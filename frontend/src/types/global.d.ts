interface ApiResponse<T> {
    localDateTime : Date
    data? : T
    apiError? : ApiError
}

interface ApiError {
    statusCode : number
    message : string
    errors : {
        [key: string]: string
    }
}






interface IUser{
    id : string
    name : string
    email : string
    username : string
    profile_picture : string
    roles : ["ADMIN","VENDOR" ,"USER"]
    account_status : "ACTIVE" | "SUSPENDED" | "DEACTIVATED"
    is_verified : boolean
    created_at : Date
    updated_at : Date
} 