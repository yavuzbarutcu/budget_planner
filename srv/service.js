const cds = require('@sap/cds')
const logger = cds.log('budget-planner')

module.exports = async function (){

  const db = await cds.connect.to('db') // connect to database service
  const { Budget } = db.entities         // get reflected definitions

  // Check Budget requirements
  this.on ('submitBudget', async req => {
    const {budget} = req.data
    logger(budget)
    
    // logic to implement Budget requirements

  })

  // Check all Budget items 
  this.after ('READ','Budget', budget => {
    if (budget.budVal <= 0) logger("Budget has no value " + budget.budVal)
  })
}