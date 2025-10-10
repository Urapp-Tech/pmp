export interface Fields {
  id?: string;
  propertyId: string| any;
  propertyUnitId: string;
  agreementDoc?: string | any;
  language: string;
  civilId: string;
  nationality: string;
  contractStart: string;
  contractEnd: string;
  rentPrice: number;
  leavingDate: string;
  rentPayDay: number;
  legalCase: boolean;
  paymentCycle: string;
  tenantType: string;
}
