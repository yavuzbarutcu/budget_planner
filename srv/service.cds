using { cap.reply as db} from '../db/schema';

service planner { 
  entity Users as projection on db.Users;
  entity Budget as projection on db.Budget
  actions{
      action addChildBudget (login_name: Users:login_name, description: String, budVal: Integer );
      action goToBudget ();
      action deleteSubBudget ();
  };
  entity BudgetTypes as projection on db.BudgetTypes;
  entity Matrial as projection on db.Material;

  action createNewBudget ( budgetType:BudgetTypes:budgetType, description:String, budVal: Integer);
  action deleteBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action copyBudget ( budget: Budget:U_ID ) returns { U_ID: String };

  
  action autoAllocateBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action calculateBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action calculateShare ( budget: Budget, budVal: Integer ) returns { U_ID: String };
}
