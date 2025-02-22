import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Employee } from '../interfaces/organization.interface';

@Injectable({
  providedIn: 'root'
})
export class FileParserService {
  async parseExcelFile(file: File): Promise<Employee[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result); 
          const workbook = XLSX.read(data, { type: 'array' }); 
          const firstSheetName = workbook.SheetNames[0]; 
          const worksheet = workbook.Sheets[firstSheetName]; 
          const employees: Employee[] = XLSX.utils.sheet_to_json(worksheet); 
          resolve(employees); 
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.readAsArrayBuffer(file); 
    });
  }
}
