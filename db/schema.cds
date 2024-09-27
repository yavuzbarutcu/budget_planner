 using { managed } from '@sap/cds/common';
namespace cap.reply;

aspect cuid {
  key U_ID : UUID @(Core.Computed : true); //> automatically filled in
}

aspect temporal {
  validFrom : Timestamp @cds.valid.from default $now;
  validTo   : Timestamp null;
}

@cds.odata.valuelist
entity BudgetTypes: cuid
{
    budgetType : String;
}

// type budgetType : String enum { InStore; FreeGoods }
// type budgetPhase : String enum { Initial; Released }

entity Budget: managed, cuid, temporal {
        Modifier        : Association to Users;
        ParentBudget    : Association to Budget on ParentBudget.U_ID = $self.ParentBudget_U_ID;
        ParentBudget_U_ID  : UUID;
        BudgetType      : Association to one BudgetTypes;
        description     : String(100) not null;
        @readonly phase           : String enum { Initial; Released } default 'Initial';
        Responsible     : Association to Users;
        Material        : Association to Material;
        @readonly budVal          : Decimal(16,2) null;
        @readonly budDistrib      : Decimal(16,2) null;
        @readonly budOpen         : Decimal(16,2) null;
        percentage : Integer null;
        childBudgets    : Composition of many Budget on childBudgets.ParentBudget = $self;
}

entity Users: cuid {
        id          : String(20);
        first_name  : String(100);
        last_name   : String(100);
        email       : String(200);
        login_name  : String(100);
}

entity Material: cuid {
        id          : String(20);
        description : String(100);
}