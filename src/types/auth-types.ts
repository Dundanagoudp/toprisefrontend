export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  data: {
    user: {
      _id: string;
      email: string;
      password: string;
      phone_Number: string;
      role: string;
      address: any[];
      __v: number;
      last_login: string;
      vehicle_details: any[];
    };
    token: string;
  };
}


