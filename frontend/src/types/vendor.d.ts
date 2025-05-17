type VendorStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

interface IVendor {
    id: string;
    user_id: string;
    User?: IUser;  // Added User field from the backend response
    gst_number: string;
    pan_number: string;
    shop_name: string;
    shop_address: string;
    phone_number: string;
    status: VendorStatus;
    created_at: string;
    updated_at: string;
    message?: string;
}


interface ICreateVendor {
    gst_number: string;
    pan_number: string;
    shop_name: string;
    shop_address: string;
    phone_number: string;
}


 interface IUpdateVendor {
    shop_name: string;
    shop_address: string;
    phone_number: string;
}

