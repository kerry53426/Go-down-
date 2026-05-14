export interface Registration {
  id: string;
  orgId: string;
  userId: string;
  date: string; // YYYY-MM-DD format
  name: string;
  phone: string;
  isUp: boolean; // 上山
  isDown: boolean; // 下山
  isStay: boolean; // 竹東住宿
  createdAt: any;
}
