let debug = require('debug')('mycompany:services');
let moment = require('moment');
let _ = require('lodash');
let EventEmitter = require('events');

/**
 * Utility which polls for changes to entities.
 * It is used because some entities (e.g. stock transfers) do not 
 * offer webhooks for the ".updated" event. 
 * 
 */
class Poller extends EventEmitter {
  /**
   * Polls an API by persistent timestamps for changes to entities.
   * @param {object} app1Connector an API connector instance
   * @param {object} gr8AccountApi an Apigrate AccountApi instance for 
   * getting account-specific properties (used to keep track of the 
   * time-last-polled). 
   */
  constructor(app1Connector, gr8AccountApi) {
    super();
    this.app1 = app1Connector;
    this.gr8AccountApi = gr8AccountApi;
  }

  /**
   * Example method polling accounts changed since the last update.
   * The last polling date is stored under the 'app1.accounts_last_updated'
   * Apigrate account property.
   * @see poll
   */
  async pollForChanges(event_name) {
    let self = this;
    return this.poll(
      'accounts',
      'app1.accounts_last_updated',
      async function (ts) {
        return await self.app1Connector.get(`/accounts`, { updated_at_min: ts });
      },
      'updated_at',
      event_name
    );
  }

  /**
   * Generic polling method for entity changes, returning them immediately and emitting an 
   * event specified by the event_name parameter (optional)
   *
   * @param {string} collection_name the property name from the API response that is the array of entities returned.
   * @param {string} datastore_update_key the Apigrate account API property name where the last-time-polled is stored
   * @param {function} query_function the query function that queries the API for the entities
   * @param {string} timestamp_property on the app entity, the property name holding the timestamp used for polling.
   * This is typically the "updated_at" property, but not always.
   * @param {string} event_name (optional) name of event to emit. If omitted, nothing is emitted.
   * @returns a payload of the form:
   * @example
   * {
   *    "timestamp_for_query": <string> submitted timestamp (ISO 8601 format) for query,
   *    "timestamp_after_query": <string> latest resulting timestamp (ISO 8601 format) from list of entities from query,
   *    "(collection_name)" : <array> of entities changed.
   * }
   *
   */
  async poll(collection_name, datastore_update_key, query_function, timestamp_property, event_name) {
    try {
      //Get the last timestamp from dynamodb.

      let last_updated_ts = await this.gr8AccountApi.getAccountProperty(datastore_update_key);

      if (!last_updated_ts) {
        let now = moment().toISOString();
        debug(`...initializing ${datastore_update_key} to "${now}"`);
        await this.gr8AccountApi.setAccountProperty(datastore_update_key, now);
        last_updated_ts = now;
      }

      //The most recent last updated timestamp, as a moment.
      let last_update = moment(last_updated_ts);//Snapshot it before the API call.
      debug(`Looking for TG ${collection_name} updated since ${last_update.toISOString()}...`);

      //Invoke the query function.
      let response = await query_function(last_update.toISOString());
      debug(`...found  ${response[collection_name].length}.`);

      if (response[collection_name].length > 0) {

        let entities = _.sortBy(response[collection_name], [timestamp_property])

        //Obtain the latest timestamp.
        for (let entity of entities) {
          let updated = moment(entity[timestamp_property]);
          //Move forward in time for next poll.
          if (updated.isAfter(last_update)) last_update = updated;
        }

        //Advance the last-updated ts that was used by one millisecond and store it for the next poll.
        last_updated_ts = last_update.add(1, 'millisecond').toISOString();
        debug(`...updating ${datastore_update_key} to "${last_updated_ts}"`);
        await this.gr8AccountApi.setAccountProperty(datastore_update_key, last_updated_ts);

        //Construct the result.
        let result = {
          timestamp_for_query: last_updated_ts,
          timestamp_after_query: last_update.toISOString()
        };
        result[collection_name] = entities;

        if (event_name) {
          this.emit(event_name, result);
        }
        return result;

      } else {
        //Do not emit an event, but return a result with an empty string.
        let result = {
          timestamp_for_query: last_updated_ts,
          timestamp_after_query: last_update.toISOString()
        };
        result[collection_name] = [];
        return result;
      }

    } catch (ex) {
      console.error(`Error during ${collection_name} update polling. ${ex.message}`);
      console.error(ex);
      throw (ex);
    }
  }


}//Poller

exports.Poller = Poller;
