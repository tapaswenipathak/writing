'use strict';

const Table = require('easy-table');
const clusterState = require('aws-ecs-monitors');

/**
 * Given a cluster name and region print currently pending tasks.
 *
 * pending-task        host          duration
 * ---------------- ------------  ---------------
 * stack-name          i-id         duration(s)
 *
 * @param {String} A region, a cluster name and cache.
 *
 * @returns {Object} A table as shown above.
 */

module.exports.run = (cli, context) => {

  const region = cli.flags.regions[0] || 'us-east-1';
  const accounts = cli.flags.accounts[0] || 'default';
  const cluster = cli.input[1];
  var hosts;
  if (!cluster)
    return Promise.reject(new Error('--cluster-name is required'));
  return Promise.resolve()
    .then(() => {
      return clusterState.getClusterState(region, cluster)
        .then((state) => {
          Object.keys(state.Instances).reduce((data, id) => {
            const arn = state.Instances[id].clusterInfo.containerInstanceArn;
            data[arn] = id;
            hosts = data;
            return data;
          }, {});
        })
        .then(() => {
          let pendingTasks = [];
          return context.access.getClient('ECS', accounts, { region: region })
            .then((ecs) => new Promise((resolve, reject) => {
              ecs.listTasks({ cluster }).eachPage((err, data, done) => {
                if (err) return reject(err);
                if (!data) return resolve(pendingTasks);
                ecs.describeTasks({
                  cluster,
                  tasks: data.taskArns
                }).promise()
                  .then((data) => {
                    const pending = data.tasks
                      .filter((task) => task.lastStatus === 'PENDING')
                      .map((task) => ({
                        'pending task': task.taskDefinitionArn.split('/').pop(),
                        host: hosts[task.containerInstanceArn],
                        duration: `${((Date.now() - new Date(task.createdAt)) / 1000).toFixed(0)}s`
                      }));
                    pendingTasks = pendingTasks.concat(pending);
                    done();
                  })
                  .catch((err) => reject(err));
              });
            }))
            .then((pendingTasks) => pendingTasks.sort((a, b) => {
              if (a.host > b.host) return -1;
              if (a.host < b.host) return 1;
              if (a.duration > b.duration) return 1;
              if (a.duration < b.duration) return -1;
              return 0;
            }))
            .then((pendingTasks) => console.log(`\n${Table.print(pendingTasks)}`));
        });
    });
};
