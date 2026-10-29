import { Roles } from '../_enums/roles.enum';

export interface User {
  id: string;
  name: string;
  role: Roles;
  score?: number;
}
