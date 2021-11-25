'use strict';

const ss = require('simple-statistics');
const Table = require('easy-table');

/**
 * Given a cluster name print the min/avg/max durations for tasks stopped in
 * the last hour.
 *
 * name                                count       min (s)   avg (s)   max (s)
 * -------------------------------- ------------  --------- --------- ---------
 * stack-name                        total_count    min_sec  avg_sec   max_sec
 *
 * @param {String} A region and a cluster name.
 *
 * @returns {Object} A table as shown above.
 */

module.exports.run = (cli, context) => {
  const region = cli.flags.regions[0] || 'us-east-1';
  const accounts = cli.flags.accounts[0] || 'default';
  const cluster = cli.input[1];
  if (!cluster)
    return Promise.reject(new Error('--cluster-name is required'));
  return Promise.resolve()
    .then(() => {
      var tasks = [];
      return context.access.getClient('ECS', accounts, { region: region })
        .then((ecs) => new Promise((resolve, reject) => {
          ecs.listTasks({ cluster, desiredStatus: 'STOPPED' }).eachPage((err, data, done) => {
            if (err) return reject(err);
            if (!data) return resolve(tasks);
            if (!data.taskArns.length) return resolve(tasks);
            ecs.describeTasks({ cluster, tasks: data.taskArns }).promise()
              .then((data) => {
                tasks = tasks.concat(data.tasks);
                done();
              })
              .catch((err) => reject(err));
          });
        })).then((tasks) => tasks.reduce((data, task) => {
          const name = task.taskDefinitionArn.split('/')[1].split(':')[0];

          const duration = +new Date(task.stoppedAt) - +new Date(task.startedAt);
          if (!data[name]) data[name] = { count: 0, durations: [] };
          data[name].count++;
          if (!isNaN(duration)) data[name].durations.push(duration);
          return data;
        }, {})).then((data) => Object.keys(data).map((name) => ({
          name,
          count: data[name].count,
          'min (s)': Math.ceil(ss.min(data[name].durations) / 1000),
          'avg (s)': Math.ceil(ss.average(data[name].durations) / 1000),
          'max (s)': Math.ceil(ss.max(data[name].durations) / 1000)
        })).sort((a, b) => {
          if (a.count > b.count) return -1;
          return 1;
        })).then((data) => {
          console.log(Table.print(data));
        });
    });
};
