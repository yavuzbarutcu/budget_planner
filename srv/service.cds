using { cap.reply as db} from '../db/schema';

service planner { 
  entity Budget as projection on db.Budget;
  entity BudgetTypes as projection on db.BudgetTypes;
  entity Matrial as projection on db.Material;
  entity Users as projection on db.Users;

  action createNewBudget ( budgetType:BudgetTypes:budgetType, description:String, budVal: Integer);
  action deleteBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action copyBudget ( budget: Budget:U_ID ) returns { U_ID: String };

  action goToBudget ( U_ID: UUID );
  action addChildBudget (U_ID: UUID @UI.ParameterDefaultValue : '{Budget.U_ID}', login_name: Users:login_name, description: String, budVal: Integer );
  action autoAllocateBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action calculateBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action calculateShare ( budget: Budget, budVal: Integer ) returns { U_ID: String };
}
