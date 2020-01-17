const _ = require('lodash');
const Logger = require('@apigrate/logger');
const { SyncEnvironment } = require("../helpers/sync-environment");
const { TransactionResult } = require('../helpers/txn');
/**
 * Sync environment for handling syncs of entities between app1 and app2.
 */
class EntitySyncEnvironment extends SyncEnvironment{
  constructor(app1, app2){
    super(app1, app2); 
  }

  /**
   * Syncs 
   */
  async processEntity(app1_entity){
    let txnResp = new TransactionResult();
    let txnLogger = new Logger(process.env.LOG_LEVEL || "warn");

    try {
      
      //Implement your processing here.
      //app1_entity... 

      txnResp.success = true;

    } catch (ex) {
      txnLogger.error(`Error processing entity. ${ex.message}`);
      txnLogger.error(ex.stack);

      txnResp.success = false;
      txnResp.message = `Error processing entity.`;
      txnResp.error = ex.message;

    } finally {
      txnResp.transcript = txnLogger.transcript();
      return txnResp;
    }
  }
}
module.exports = EntitySyncEnvironment;