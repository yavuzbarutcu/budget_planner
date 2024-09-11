using { cap.reply as db} from '../db/schema';

service planner { 
  entity BudgetTypes as projection on db.BudgetTypes;
  entity Material as projection on db.Material;
  entity Users as projection on db.Users;
  entity Budget as projection on db.Budget
  actions{
      //Side effect annotation using an abosolute path
      @Common.SideEffects: {TargetEntities: ['childBudgets','budDistrib', 'budOpen']}
      action addChildBudget (login_name: Users:login_name, description: String, budVal: Integer );

      @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget','budDistrib', 'budOpen']}
      action deleteSubBudget ();

      @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget']}
      action copyBudget ( description: String );

      @Common.SideEffects: {TargetEntities: ['childBudgets']}
      action autoAllocateBudget ();

      action goToBudget ();
  };

  @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget']}
  action createNewBudget ( login_name: Users:login_name, budgetType:BudgetTypes:budgetType, description:String, budVal: Integer);
  action deleteBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };

  
  action calculateBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action calculateShare ( budget: Budget, budVal: Integer ) returns { U_ID: String };
}

