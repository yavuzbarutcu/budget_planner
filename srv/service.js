const cds = require('@sap/cds')
const logger = cds.log('budget-planner')
const { uuid } = cds.utils

module.exports = async function (){

  const db = await cds.connect.to('db') // connect to database service
  const { Budget, BudgetTypes } = db.entities         // get reflected definitions

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
    const { login_name, description, budVal } = req.data;

    // Get the ParentBudget_U_ID from the current context
    const ParentBudget_U_ID = req.params[0];
    if (!ParentBudget_U_ID) {
      req.reject(400, 'Parent Budget U_ID is missing.');
      return;
    }

    logger.info(`Creating Sub-Budget under ParentBudget with U_ID: ${ParentBudget_U_ID}`);

    // Get BudgetType U_ID based on budgetType name
    const userRecord = await 
      SELECT.one('U_ID')
        .from(Users)
        .where({ login_name });

    if (!userRecord) {
      req.reject(400, `Invalid user login_name: ${login_name}`);
      return;
    }

    const newBudgetUID = uuid();
    const currentTime = new Date();

    const result = await 
      INSERT.into(Budget)
        .columns('U_ID', 'ParentBudget_U_ID', 'Responsible_U_ID', 'description', 'budVal', 'budDistrib', 'budOpen', 'ValidFrom', 'createdAt')
        .values(newBudgetUID, ParentBudget_U_ID, userRecord.U_ID, description, budVal, budVal, 0, currentTime, currentTime);

    logger.info(`Sub-Budget created with U_ID: ${newBudgetUID}`);
    return { U_ID: newBudgetUID };
  });
  // Check all Budget items 
  this.after ('READ','Budget', budget => {
    // logger(Budget)
    if (budget.budVal <= 0) logger("Budget has no value " + budget.budVal)
  })
}