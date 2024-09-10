const cds = require('@sap/cds')
const logger = cds.log('budget-planner')
const { uuid } = cds.utils

module.exports = async function (){

  const db = await cds.connect.to('db') // connect to database service
  const { Budget, BudgetTypes, Users } = db.entities         // get reflected definitions

  // Action to go to a Sub-Budget
  this.on('goToBudget', async req => {
    const params = req.params[1];
    const Budget_U_ID = params.U_ID
    logger({"BudgetUID":Budget_U_ID})
  })
   // Action to delete Sub Budget
   this.on('deleteSubBudget', async req => {
    const params = req.params[1];
    const Budget_U_ID = params.U_ID
    logger({"BudgetUID":Budget_U_ID})
  })
  // Check Budget requirements
  this.on ('createNewBudget', async req => {
    const { budgetType, description, budVal } = req.data;
    logger(budgetType)
    // logic to implement Budget requirements

    // Get BudgetType U_ID based on budgetType name
    const budgetTypeRecord = await 
      SELECT.one('U_ID')
        .from(BudgetTypes)
        .where({ budgetType });

    if (!budgetTypeRecord) {
      req.reject(400, `Invalid budget type: ${budgetType}`);
      return;
    }

    logger(budgetTypeRecord)

    const UID = uuid()
    const currentTime = new Date
    const result = await 
      INSERT.into (Budget) 
        .columns ('U_ID', 'BudgetType_U_ID', 'description', 'budVal', 'budOpen', 'budDistrib', 'ValidFrom', 'createdAt') 
        .values (UID, budgetTypeRecord.U_ID, description, budVal, budVal, 0, currentTime, currentTime)

    logger(result)
  })


  // Action to create a new Sub-Budget
  this.on('addChildBudget', async req => {
    logger(req.params)
    logger(req.data)
    const { login_name, description, budVal } = req.data;

    // Get the ParentBudget_U_ID from the current context
    const params = req.params[0];
    const ParentBudget_U_ID = params.U_ID
    if (!ParentBudget_U_ID) {
      req.reject(400, 'Parent Budget U_ID is missing.');
      return;
    }

    // Get ParentBudgetRecord
    const parentBudgetRecord = await 
      SELECT.one('U_ID')
        .from(Budget)
        .where({ U_ID: ParentBudget_U_ID });
    if (!parentBudgetRecord) {
      req.reject(400, `Invalid parent budget: ${ParentBudget_U_ID}`);
      return;
    }

    // Get UserRecord
    const userRecord = await 
      SELECT.one('U_ID')
        .from(Users)
        .where({ login_name });
    if (!userRecord) {
      req.reject(400, `Invalid user login_name: ${login_name}`);
      return;
    }

    logger.info(`Creating Sub-Budget under ParentBudget with U_ID: ${ParentBudget_U_ID}`);

    const newBudgetUID = uuid();
    const currentTime = new Date();

    const result = await 
      INSERT.into(Budget)
        .columns('U_ID', 'ParentBudget_U_ID', 'Responsible_U_ID', 'description', 'budVal', 'budDistrib', 'budOpen', 'ValidFrom', 'createdAt')
        .values(newBudgetUID, ParentBudget_U_ID, userRecord.U_ID, description, budVal, 0, budVal, currentTime, currentTime);

    logger.info(`Sub-Budget created with U_ID: ${newBudgetUID}`);
    return { U_ID: newBudgetUID };
  });
  // Check all Budget items 
  this.after ('READ','Budget', budget => {
    // logger(Budget)
    if (budget.budVal <= 0) logger("Budget has no value " + budget.budVal)
  })
}