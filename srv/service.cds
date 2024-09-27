using { cap.reply as db} from '../db/schema';

service planner { 
  entity BudgetTypes as projection on db.BudgetTypes;
  entity Material as projection on db.Material;
  entity Users as projection on db.Users;
  entity Budget as projection on db.Budget
  actions{
      //Side effect annotation using an abosolute path
      @Common.SideEffects: {TargetEntities: ['childBudgets','budDistrib', 'budOpen']}
      action addChildBudget (login_name: Users:login_name, description: String, budVal: Decimal(16,2) );

      @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget','budDistrib', 'budOpen']}
      action deleteSubBudget ();

      @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget','budDistrib', 'budOpen']}
      action calculateBudget (budVal: Decimal(16,2));

      @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget']}
      action copyBudget ( description: String );

      @Common.SideEffects: {TargetEntities: ['childBudgets']}
      action autoAllocateBudget ();

      @Common.SideEffects: {TargetEntities: ['childBudgets']}
      action autoCalculateShare ();

      action goToBudget ();
  };

  @Common.SideEffects: {TargetEntities: ['/planner.EntityContainer/Budget']}
  action createNewBudget ( login_name: Users:login_name, budgetType:BudgetTypes:budgetType, description:String, budVal: Decimal(16,2));
  action deleteBudget ( budget: Budget, budVal: Decimal(16,2) ) returns { U_ID: String };

  
  action calculateBudget ( budget: Budget, budVal: Integer ) returns { U_ID: String };
  action calculateShare ( budget: Budget, budVal: Integer ) returns { U_ID: String };
}

