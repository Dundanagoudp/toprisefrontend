 export interface SlaType {
  _id: string;
  name: string;
  description: string;
  expected_hours: number;
  created_at: string;
  updated_at: string;
  __v: number;
}
export interface SlaTypesResponse {
success: boolean;
  message: string;
  data: SlaType[];

}