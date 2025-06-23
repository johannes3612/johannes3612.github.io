
export interface User {
  username: string;
  // Passwords are not stored directly in this example for simplicity
  // In a real app, passwords would be hashed and stored securely on a backend
}

export enum Gender {
  Male = "Man",
  Female = "Vrouw",
  Other = "Anders",
  Unknown = "Onbekend"
}

export interface FamilyMember {
  id: string; // Unique ID
  firstName: string;
  lastName: string;
  birthDate: string; // DD-MM-YYYY
  gender: Gender;
  parent1Id?: string;
  parent2Id?: string;
  partnerId?: string;
}

export type FamilyData = Record<string, FamilyMember>;

export enum AppTab {
  AddMember = "Lid Toevoegen",
  EditMember = "Lid Bewerken",
  ViewAll = "Alles Bekijken",
  Insights = "Familie Inzichten"
}
