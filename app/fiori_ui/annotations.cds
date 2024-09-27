using planner as service from '../../srv/service';

annotate service.Budget with @odata.draft.enabled;

annotate service.Budget with @(
  Capabilities.InsertRestrictions : {
    Insertable : false,
  },
  Capabilities.DeleteRestrictions : {
    Deletable : false,
  },
    UI.FieldGroup #description : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : description,
                Label : 'description',
            },
        ],
    },
);

annotate service.Budget with @(
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Value : U_ID,
            Label : 'U_ID',
        },
        {
            $Type : 'UI.DataField',
            Label : 'Desc',
            Value : description,
        },
        {
            $Type : 'UI.DataField',
            Value : BudgetType.budgetType,
            Label : 'Budget Type',
        },
        {
            $Type : 'UI.DataField',
            Label : 'Valid From',
            Value : validFrom,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Valid Until',
            Value : validTo,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Phase',
            Value : phase,
        },
        {
            $Type : 'UI.DataField',
            Value : budVal,
            Label : 'Budget',
            ![@UI.Importance] : #High,
        },
        {
            $Type : 'UI.DataField',
            Value : Responsible.first_name,
            Label : 'Responsible Name',
        },
        {
            $Type : 'UI.DataField',
            Value : Responsible.last_name,
            Label : 'Responsible Last Name',
        },
        {
            $Type : 'UI.DataField',
            Value : Responsible.email,
            Label : 'Responsible Email',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'planner.EntityContainer/createNewBudget',
            Label : 'New Budget',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'planner.copyBudget',
            Label : 'Copy Budget',
        },
    ],
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Budget Info',
            ID : 'BudgetInfo',
            Target : '@UI.FieldGroup#BudgetInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Sub Budgets',
            ID : 'ChildBudgets',
            Target : 'childBudgets/@UI.LineItem#ChildBudgets',
        },
    ],
    UI.LineItem #ChildBudgets : [
        {
            $Type : 'UI.DataField',
            Value : U_ID,
            Label : 'U_ID',
        },{
            $Type : 'UI.DataFieldForAnnotation',
            Target : 'Responsible/@Communication.Contact#contact',
            Label : 'Responsible',
        },
        {
            $Type : 'UI.DataField',
            Value : description,
            Label : 'Desc',
        },
        {
            $Type : 'UI.DataField',
            Value : budVal,
            Label : 'Budget',
        },
        {
            $Type : 'UI.DataField',
            Value : budDistrib,
            Label : 'Distributed',
        },
        {
            $Type : 'UI.DataField',
            Value : budOpen,
            Label : 'Open',
        },
        {
            $Type : 'UI.DataField',
            Value : percentage,
            Label : 'Share',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'planner.calculateBudget',
            Label : 'Calculate Budget',
        },
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'planner.goToBudget',
            Label : 'Details',
            Inline : true,
            ![@UI.Importance] : #High,
        }, 
        {
            $Type : 'UI.DataFieldForAction',
            Action : 'planner.deleteSubBudget',
            Label : 'Delete Sub Budget',
        },
    ],
    UI.FieldGroup #BudgetInfo : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : U_ID,
                Label : 'U_ID',
            },
            {
                $Type : 'UI.DataField',
                Value : description,
                Label : 'Description',
            },
            {
                $Type : 'UI.DataField',
                Value : validFrom,
                Label : 'Valid From',
            },
            {
                $Type : 'UI.DataField',
                Value : validTo,
                Label : 'Valid To',
            },
            {
                $Type : 'UI.DataField',
                Value : createdAt,
            },
            {
                $Type : 'UI.DataField',
                Value : BudgetType.budgetType,
                Label : 'Budget Type',
            },
            {
                $Type : 'UI.DataField',
                Value : phase,
                Label : 'Phase',
            },
            {
                $Type : 'UI.DataField',
                Value : Responsible.last_name,
                Label : 'Responsible',
            },
            {
                $Type : 'UI.DataField',
                Value : budVal,
                Label : 'Budget Value',
            },
            {
                $Type : 'UI.DataField',
                Value : budDistrib,
                Label : 'Bud Distributed',
            },
            {
                $Type : 'UI.DataField',
                Value : budOpen,
                Label : 'Budget Open',
            },
            {
                $Type : 'UI.DataFieldForAction',
                Action : 'planner.addChildBudget',
                Label : 'Add Sub Budget',
            },
            {
                $Type : 'UI.DataFieldForAction',
                Action : 'planner.autoAllocateBudget',
                Label : 'Auto Allocate Budget',
            },
            {
                $Type : 'UI.DataFieldForAction',
                Action : 'planner.autoCalculateShare',
                Label : 'Auto Calculate Share',
            },
        ],
    },
    UI.SelectionFields : [
        U_ID,
        description,
    ],
    UI.FieldGroup #details : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : Responsible.Responsible_U_ID,
            },
        ],
    },
);

annotate service.Users with @(
    Communication.Contact #contact : {
        $Type : 'Communication.ContactType',
        fn : first_name,
        email : [
            {
                $Type : 'Communication.EmailAddressType',
                type : #work,
                address : email,
            },
        ],
    }
);

annotate service.BudgetTypes with {
    budgetType @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'BudgetTypes',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : budgetType,
                    ValueListProperty : 'budgetType',
                },
            ],
            Label : 'BudgetTypeHelpValue',
        },
        Common.ValueListWithFixedValues : true
)};

annotate service.Users with {
    login_name @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'Users',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : login_name,
                    ValueListProperty : 'login_name',
                },
            ],
            Label : 'UserHelpValue',
        },
        Common.ValueListWithFixedValues : true
)};

annotate service.Users with {
    last_name @Common.Text : first_name
};

annotate service.Budget with {
    description @UI.MultiLineText : true
};

