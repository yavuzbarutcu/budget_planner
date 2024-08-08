 using { managed, temporal} from '@sap/cds/common';
namespace cap.reply;

aspect cuid {
  key U_ID : UUID; //> automatically filled in
}


entity Budget: managed, cuid, temporal {
        Modifier        : Association to Users;
        ParentBudget    : Association to Budget;
        type            : String(50) null;
        description     : String(100) null;
        phase           : String(10) null;
        Responsible     : Association to Users;
        Material        : Association to Material;
        budVal          : Decimal(16,2) null;
        budDistrib      : Decimal(16,2) null;
        budOpen         : Decimal(16,2) null;
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