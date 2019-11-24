/*
 * Copyright (c) 2018 TopCoder, Inc. All rights reserved.
 */
'use strict';
const logger = require('./logger');

/**
 * This module contains the database helper methods.
 *
 * @version 1.0
 */

/**
 * Get Data by model id
 * @param {Object} model The dynamoose model to query
 * @param {String} id The id value
 * @returns {Promise<void>}
 */
async function getById(model, id) {
  return await new Promise((resolve, reject) => {
    model.query('id').eq(id).consistent().exec((err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result[0]);
    });
  });
}

/**
 * Get data collection by scan parameters
 * @param {Object} model The dynamoose model to scan
 * @param {Object} scanParams The scan parameters object
 * @returns {Promise<void>}
 */
async function scan(model, scanParams) {
  return await new Promise((resolve, reject) => {
    model.scan(scanParams).consistent().exec((err, result) => {
      if (err) {
        return reject(err);
      }

      return resolve(result.count === 0 ? [] : result);
    });
  });
}

/**
 * Get single data by scan parameters
 * @param {Object} model The dynamoose model to scan
 * @param {Object} scanParams The scan parameters object
 * @returns {Promise<void>}
 */
async function scanOne(model, scanParams) {
  logger.debug('Enter scanOne.');

  return await new Promise((resolve, reject) => {
    model.scan(scanParams).consistent().exec((err, result) => {
      if (err) {
        logger.debug(`scanOne. Error. ${err}`);
        return reject(err);
      }
      logger.debug('scanOne. Result.');
      logger.debug(result);

      return resolve(result.count === 0 ? null : result[0]);
    });
  });
}

/**
 * Update collection
 * @param {Object} model The dynamoose model to update
 * @param {Array} collection The update data collection
 */
async function updateMany(model, collection) {
  await new Promise((resolve, reject) => {
    model.batchPut(collection, (err, result) => {
      if (err) {
        return reject(err);
      }

      resolve(result);
    });
  });
}

/**
 * Create item in database
 * @param {Object} Model The dynamoose model to query
 * @param {Object} data The create data object
 * @returns {Promise<void>}
 */
async function create(Model, data) {
  return await new Promise((resolve, reject) => {
    const dbItem = new Model(data);
    dbItem.save((err) => {
      if (err) {
        return reject(err);
      }

      return resolve(dbItem);
    });
  });
}

/**
 * Update item in database
 * @param {Object} Model The dynamoose model to update
 * @param {String} id The id of item
 * @param {Object} data The updated data object
 * @returns {Promise<void>}
 */
async function update(Model, id, data) {
  const dbItem = await getById(Model, id);
  Object.keys(data).forEach((key) => {
    dbItem[key] = data[key];
  });
  return await new Promise((resolve, reject) => {
    dbItem.save((err) => {
      if (err) {
        return reject(err);
      }

      return resolve(dbItem);
    });
  });
}

/**
 * Delete item in database
 * @param {Object} Model The dynamoose model to delete
 * @param {Object} queryParams The query parameters object
 */
async function remove(Model, queryParams) {
  const dbItem = await scanOne(Model, queryParams);
  await new Promise((resolve, reject) => {
    if (dbItem != null) {
      dbItem.delete((err) => {
        if (err) {
          return reject(err);
        }

        resolve(dbItem);
      });
    }
  });
}

module.exports = {
  getById,
  scan,
  scanOne,
  updateMany,
  create,
  update,
  remove
};
