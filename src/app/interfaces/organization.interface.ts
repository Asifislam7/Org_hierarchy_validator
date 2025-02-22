export interface Employee {
    Email: string;
    FullName: string;
    Role: 'Root' | 'Admin' | 'Manager' | 'Caller';
    ReportsTo: string;
  }
  
  export interface ValidationError {
    row: number;
    employee: string;
    message: string;
  }
  
  export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
  }