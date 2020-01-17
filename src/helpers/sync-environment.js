/**
 * Provides a common execution environment for data being exchanged between App1 and App2.
 * 
 * Extend it as necessary.
 */
class SyncEnvironment {
  constructor(app1, app2) {
    this.app1 = app1;
    this.app2 = app2;
    //implement a cache if necessary.
  }//constructor
  
  //Implement constants if necessary...
  static get SPECIAL_ENTITY_ID() { return 46135; }
  
  //Implement common functions if necessary...

}

exports.SyncEnvironment = SyncEnvironment;
