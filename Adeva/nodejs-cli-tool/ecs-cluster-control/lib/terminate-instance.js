'use strict';

/**
 * Given a cluster name, region and instance id, terminates that instance.
 *
 * @param {String} A region, a cluster name and instance id.
 *
 * @returns {Object} Terminating the instance.
 */

module.exports.run = (cli, context) => {
  const instanceID = cli.input[1];
  const region = cli.flags.regions[0] || 'us-east-1';
  const accounts = cli.flags.accounts[0] || 'default';
  if(!instanceID)
    return Promise.reject(new Error('Please provide an instance ID'));
  console.log(`Terminating AutoScaling Instance ${cli.input[1]}`);

  return Promise.resolve()
    .then(() => {
      const params = {
        InstanceId: instanceID,
        ShouldDecrementDesiredCapacity: false
      };
      context.access.getClient('AutoScaling', accounts, { region: region })
        .then((autoscaling) => new Promise((resolve, reject) => {
          autoscaling.terminateInstanceInAutoScalingGroup(params, function(err, data) {
            if(err) return reject(err);
            else resolve(data);
          });
        }));
    });
};
