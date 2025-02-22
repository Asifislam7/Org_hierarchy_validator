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
          const workbook = XLSX.read(data, { type: 'array' }); //fetching the workbook of the excel file
          const firstSheetName = workbook.SheetNames[0]; //fetching the first sheet name
          const worksheet = workbook.Sheets[firstSheetName]; //fetching the first sheet
          const employees: Employee[] = XLSX.utils.sheet_to_json(worksheet); //converting the sheet to json
          resolve(employees); 
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      reader.readAsArrayBuffer(file); //reading the file as an array buffer
    });
  }
}
