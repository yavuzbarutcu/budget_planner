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

    // Get budgetRecord
    const budgetRecord = await 
    SELECT.one('*')
      .from(Budget)
      .where({ U_ID: Budget_U_ID });
    if (!budgetRecord) {
      req.reject(400, `Invalid budget: ${budgetRecord}`);
      return;
    }
    logger(budgetRecord)

    cds.tx (async ()=>{
      // Return Budget value back to Parent Budget
      await UPDATE (Budget,budgetRecord.ParentBudget_U_ID) .with ({
        budDistrib: {'-=': budgetRecord.budVal},
        budOpen: {'+=': budgetRecord.budVal},
      });

      // Delete sub budget
      const result = await DELETE.from(Budget).where ({U_ID:Budget_U_ID});
      logger(result)
    })

  })


   // Action to copy a Budget
   this.on('copyBudget', async req => {
    const { description } = req.data;
    const params = req.params[0];
    const Budget_U_ID = params.U_ID
    logger({"BudgetUID":Budget_U_ID})

    // Get budgetRecord
    const budgetRecord = await 
      SELECT.one('*')
        .from(Budget)
        .where({ U_ID: Budget_U_ID });
    if (!budgetRecord) {
      req.reject(400, `Invalid budget: ${budgetRecord}`);
      return;
    }
    logger(budgetRecord)

    const UID = uuid()
    const currentTime = new Date
    const result = await 
      INSERT.into (Budget) 
        .columns ('U_ID', 'BudgetType_U_ID', 'Responsible_U_ID', 'description', 'budVal', 'budOpen', 'budDistrib', 'ValidFrom', 'createdAt') 
        .values (UID, budgetRecord.BudgetType_U_ID, budgetRecord.Responsible_U_ID, description, budgetRecord.budVal, budgetRecord.budVal, 0, currentTime, currentTime)

    logger(result)
  })

  // Check Budget requirements
  this.on ('createNewBudget', async req => {
    const { login_name, budgetType, description, budVal } = req.data;
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

    // Get UserRecord
    const userRecord = await 
      SELECT.one('U_ID')
        .from(Users)
        .where({ login_name });
    if (!userRecord) {
      req.reject(400, `Invalid user login_name: ${login_name}`);
      return;
    }

    logger(budgetTypeRecord)

    const UID = uuid()
    const currentTime = new Date
    const result = await 
      INSERT.into (Budget) 
        .columns ('U_ID', 'BudgetType_U_ID', 'Responsible_U_ID', 'description', 'budVal', 'budOpen', 'budDistrib', 'ValidFrom', 'createdAt') 
        .values (UID, budgetTypeRecord.U_ID, userRecord.U_ID, description, budVal, budVal, 0, currentTime, currentTime)

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
      SELECT.one('*')
        .from(Budget)
        .where({ U_ID: ParentBudget_U_ID });
    if (!parentBudgetRecord) {
      req.reject(400, `Invalid parent budget: ${ParentBudget_U_ID}`);
      return;
    }

    // Check available open Budget
    if (budVal > parentBudgetRecord.budOpen) {
      req.reject(400, `No enough Budget! Open Budget Value: ${parentBudgetRecord.budOpen} €`);
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

    cds.tx (async ()=>{
      await UPDATE (Budget,ParentBudget_U_ID) .with ({
        budDistrib: {'+=': budVal},
        budOpen: {'-=': budVal},
      })

      // Insert new sub budget
      await 
        INSERT.into(Budget)
          .columns('U_ID', 'ParentBudget_U_ID', 'BudgetType_U_ID', 'Responsible_U_ID', 'description', 'budVal', 'budDistrib', 'budOpen', 'ValidFrom', 'createdAt')
          .values(newBudgetUID, ParentBudget_U_ID, parentBudgetRecord.BudgetType_U_ID, userRecord.U_ID, description, budVal, 0, budVal, currentTime, currentTime);
    })
    logger.info(`Sub-Budget created with U_ID: ${newBudgetUID}`);
    return { U_ID: newBudgetUID };
  });


  // Action to split budget equally
  this.on('autoAllocateBudget', async req => {
    logger(req.params)
    logger(req.data)

    // Get the ParentBudget_U_ID from the current context
    const params = req.params[0];
    const ParentBudget_U_ID = params.U_ID
    if (!ParentBudget_U_ID) {
      req.reject(400, 'Parent Budget U_ID is missing.');
      return;
    }

    // Get ParentBudgetRecord
    const parentBudget = await 
      SELECT.one('*')
        .from(Budget)
        .where({ U_ID: ParentBudget_U_ID });
    if (!parentBudget) {
      req.reject(400, `No Budget found for the given BudgetID: ${ParentBudget_U_ID}`);
      return;
    }

    // Get Budget List
    const budgetList = await 
      SELECT('*')
        .from(Budget)
        .where({ ParentBudget_U_ID: ParentBudget_U_ID });
    if (!budgetList) {
      req.reject(400, `No Sub Budget found for the given Budget: ${ParentBudget_U_ID}`);
      return;
    }
    const valPerBudget = parentBudget.budVal / budgetList.length;
    logger.info(`Budget Per Sub-Budget : ${valPerBudget}`);
    logger.info(`Splitting Budget of : ${ParentBudget_U_ID}`);
    const currentTime = new Date();
    for (const key in budgetList) {
      const budget = budgetList[key];
      const result = await 
        UPDATE (Budget,budget.U_ID) .with ({
          budVal: valPerBudget
        })
      logger.info(result)
    }
    logger.info(`Budget of ${parentBudget.budVal} has been splitted`);
    
  });


  // Action to calculate Sub Budget new Budget Value
  this.on('calculateBudget', async req => {
    const paramsSub = req.params[1];
    const Budget_U_ID = paramsSub.U_ID
    logger({"BudgetUID":Budget_U_ID})

    // Get the ParentBudget_U_ID from the current context
    const paramsParent = req.params[0];
    const ParentBudget_U_ID = paramsParent.U_ID
    if (!ParentBudget_U_ID) {
      req.reject(400, 'Parent Budget U_ID is missing.');
      return;
    }

    const { budVal } = req.data;
    if (!budVal) {
      req.reject(400, `Invalid budget value: ${budVal}`);
      return;
    }

    // Get ParentBudgetRecord
    const parentBudgetRecord = await 
      SELECT.one('*')
        .from(Budget)
        .where({ U_ID: ParentBudget_U_ID });
    if (!parentBudgetRecord) {
      req.reject(400, `Invalid parent budget: ${ParentBudget_U_ID}`);
      return;
    }
    logger(parentBudgetRecord)

    // Get budgetRecord
    const budgetRecord = await 
    SELECT.one('*')
      .from(Budget)
      .where({ U_ID: Budget_U_ID });
    if (!budgetRecord) {
      req.reject(400, `Invalid budget: ${budgetRecord}`);
      return;
    }
    logger(budgetRecord)

    // Check available open Budget
    // if new Budget Value greater than current Budget Value
    if (budVal > budgetRecord.budVal) {
      // check if enough open Header Budget available
      if (budVal - budgetRecord.budVal > parentBudgetRecord.budOpen) {
        req.reject(400, `No enough Budget! Open Budget Value: ${parentBudgetRecord.budOpen} €`);
        return;
      }
    } else {
      // New Budget is less than current Budget value
      // Check if enough open budget to take back
      if (budVal - budgetRecord.budVal + budgetRecord.budOpen < 0) {
        req.reject(400, `No enough Open Budget to reduce current Budget! Open Budget Value: ${budgetRecord.budOpen} €`);
        return;
      }
    }
    const budToDist = budVal - budgetRecord.budVal;

    cds.tx (async ()=>{
      // Update Budget of Parent Budget
      await UPDATE (Budget,parentBudgetRecord.U_ID) .with ({
        budDistrib: {'+=': budToDist},
        budOpen: {'-=': budToDist},
      });

      // Update Budget of Sub Budget
      await UPDATE (Budget,budgetRecord.U_ID) .with ({
        budVal: {'+=': budToDist},
        budOpen: {'+=': budToDist},
      });

    })

  })

  // Action to claculate budget shares
  this.on('autoCalculateShare', async req => {
    logger(req.params)
    logger(req.data)

    // Get the ParentBudget_U_ID from the current context
    const params = req.params[0];
    const ParentBudget_U_ID = params.U_ID
    if (!ParentBudget_U_ID) {
      req.reject(400, 'Parent Budget U_ID is missing.');
      return;
    }

    // Get ParentBudgetRecord
    const parentBudget = await 
      SELECT.one('*')
        .from(Budget)
        .where({ U_ID: ParentBudget_U_ID });
    if (!parentBudget) {
      req.reject(400, `No Budget found for the given BudgetID: ${ParentBudget_U_ID}`);
      return;
    }

    logger.info(`Parent Bud : `);
    logger(parentBudget);
    // Get Budget List
    const budgetList = await 
      SELECT('*')
        .from(Budget)
        .where({ ParentBudget_U_ID: ParentBudget_U_ID });
    if (!budgetList) {
      req.reject(400, `No Sub Budget found for the given Budget: ${ParentBudget_U_ID}`);
      return;
    }
    

    logger(budgetList);
    for (const key in budgetList) {
      const budget = budgetList[key];
      logger.info(`Child Bud -- :`);
      logger.info(budget);
      if(budget.U_ID){
        logger.info(`Parent Bud Val : ${parentBudget.budVal}. Budget Val: ${budget.budVal}`);
        const share = budget.budVal / parentBudget.budVal * 100;
        const result = await 
          UPDATE (Budget,budget.U_ID) .with ({
            percentage: share
          })
        logger.info(`result: ${result}`);
      }
      
    }
    logger.info(`Shares of Header Budget ${ParentBudget_U_ID} has been calculated`);
    
  });

  // Check all Budget items 
  this.after ('READ','Budget', budget => {
    // logger(Budget)
    if (budget.budVal <= 0) logger("Budget has no value " + budget.budVal)
  })

}

