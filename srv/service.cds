using { cap.reply as db} from '../db/schema';

service planner { 
  entity Budget as projection on db.Budget;
  entity Matrial as projection on db.Material;
  entity Users as projection on db.Users;

  action submitBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
}